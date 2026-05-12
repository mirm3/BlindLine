import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getVolunteerMatches,
  cancelVolunteerOffer,
  completeTrip,
  acceptMatch,
  declineMatch,
  submitReview,
  subscribeToVolunteerMatches,
  TripWithMatch,
} from '@/services/tripService';
import ReviewModal from '@/components/ReviewModal';

export default function VolunteerTripsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const volunteerColor = '#4CAF50';
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.userType !== 'volunteer') {
      router.replace('/(tabs)');
    }
  }, [isLoading, router, user?.userType]);

  const [myTrips, setMyTrips] = useState<TripWithMatch[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripWithMatch | null>(null);

  const loadMyTrips = useCallback(async () => {
    if (!user) return;
    try {
      const trips = await getVolunteerMatches(user.id);
      setMyTrips(trips);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyTrips();
  }, [loadMyTrips]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const subscription = subscribeToVolunteerMatches(user.id, loadMyTrips);
    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadMyTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMyTrips();
  }, [loadMyTrips]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedTrip) return;
    try {
      await submitReview(selectedTrip.id, rating, comment);
      Alert.alert(t('reviews.success_title'), t('reviews.success_msg'));

      // Optimistically update the UI before refreshing
      setMyTrips(currentTrips =>
        currentTrips.map(trip =>
          trip.id === selectedTrip.id
            ? { ...trip, has_review: true, review: { rating, comment } }
            : trip
        )
      );

      loadMyTrips(); // Refresh to ensure sync with server
    } catch (error) {
      throw error; // Let ReviewModal handle it
    }
  };

  const formatMobilityAids = (aids: string[] | null | undefined): string | null => {
    if (!aids || aids.length === 0) return null;
    return aids.map(a => t(`volunteer_trips.mobility_labels.${a}`, { defaultValue: a })).join(', ');
  };

  const formatPreferences = (prefs: Record<string, unknown> | null | undefined): string | null => {
    if (!prefs) return null;
    const parts: string[] = [];
    if (prefs.visual_impairment && typeof prefs.visual_impairment === 'string') {
      parts.push(t(`onboarding_vision.options.${prefs.visual_impairment}`, { defaultValue: prefs.visual_impairment.replace(/_/g, ' ') }));
    }
    if (Array.isArray(prefs.assistance_needs) && prefs.assistance_needs.length > 0) {
      const needs = (prefs.assistance_needs as string[])
        .map(n => t(`volunteer_trips.assistance_labels.${n}`, { defaultValue: n }))
        .join(', ');
      parts.push(`${t('volunteer_trips.labels.needs_prefix')}${needs}`);
    }
    if (prefs.language && typeof prefs.language === 'string') {
      const lang = t(`onboarding_language.options.${prefs.language}`, { defaultValue: prefs.language });
      parts.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  const handleAcceptMatch = (trip: TripWithMatch) => {
    if (!trip.match) return;

    Alert.alert(
      t('volunteer_trips.alerts.accept_title'),
      t('volunteer_trips.alerts.accept_msg', { departure: trip.departure_station, arrival: trip.arrival_station }),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('volunteer_trips.actions.accept'),
          style: 'default',
          onPress: async () => {
            setProcessingId(trip.id);
            try {
              await acceptMatch(trip.match!.id);
              loadMyTrips();
              Alert.alert(
                t('volunteer_trips.alerts.accept_success_title'),
                t('volunteer_trips.alerts.accept_success_msg'),
                [{ text: 'OK' }]
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to accept';
              Alert.alert('Error', message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeclineMatch = (trip: TripWithMatch) => {
    if (!trip.match) return;

    Alert.alert(
      t('volunteer_trips.alerts.decline_title'),
      t('volunteer_trips.alerts.decline_msg'),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('volunteer_trips.actions.decline'),
          style: 'destructive',
          onPress: async () => {
            setProcessingId(trip.id);
            try {
              await declineMatch(trip.match!.id);
              loadMyTrips(); // Reload instead of manual filter to ensure state sync
              Alert.alert(
                t('volunteer_trips.alerts.decline_success_title'),
                t('volunteer_trips.alerts.decline_success_msg')
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to decline';
              Alert.alert('Error', message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancelOffer = (trip: TripWithMatch) => {
    if (!trip.match) return;

    Alert.alert(
      t('volunteer_trips.alerts.cancel_title'),
      t('volunteer_trips.alerts.cancel_msg'),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('volunteer_trips.actions.cancel'),
          style: 'destructive',
          onPress: async () => {
            setProcessingId(trip.id);
            try {
              await cancelVolunteerOffer(trip.match!.id);
              loadMyTrips();
              Alert.alert(
                t('volunteer_trips.alerts.cancel_success_title'),
                t('volunteer_trips.alerts.cancel_success_msg')
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to cancel';
              Alert.alert('Error', message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCompleteTrip = (trip: TripWithMatch) => {
    Alert.alert(
      t('volunteer_trips.alerts.complete_title'),
      t('volunteer_trips.alerts.complete_msg'),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('volunteer_trips.actions.complete'),
          style: 'default',
          onPress: async () => {
            setProcessingId(trip.id);
            try {
              await completeTrip(trip.id);
              loadMyTrips(); // Refresh to update status
              Alert.alert(
                t('volunteer_trips.alerts.complete_success_title'),
                t('volunteer_trips.alerts.complete_success_msg'),
                [{ text: 'OK' }]
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to complete';
              Alert.alert('Error', message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCallTraveler = (phone: string | undefined) => {
    if (!phone) {
      Alert.alert(t('phone_call.no_phone_title'), t('phone_call.no_phone_msg'));
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return {
      date: date.toLocaleDateString(undefined, dateOptions),
      time: date.toLocaleTimeString(undefined, timeOptions),
    };
  };

  const pendingColor = '#FF9800';

  const getStatusColor = (status: string, matchStatus?: string) => {
    if (status === 'PENDING' && matchStatus === 'ACTIVE') return pendingColor;
    switch (status) {
      case 'MATCHED':
        return volunteerColor;
      case 'COMPLETED':
        return '#9E9E9E';
      case 'CANCELED':
        return '#E53935';
      default:
        return tintColor;
    }
  };

  const getStatusIcon = (status: string, matchStatus?: string): 'bell' | 'check-circle' | 'check' | 'times-circle' | 'handshake-o' => {
    if (status === 'PENDING' && matchStatus === 'ACTIVE') return 'bell';
    switch (status) {
      case 'MATCHED':
        return 'handshake-o';
      case 'COMPLETED':
        return 'check-circle';
      case 'CANCELED':
        return 'times-circle';
      default:
        return 'check';
    }
  };

  const getStatusLabel = (status: string, matchStatus?: string): string => {
    if (status === 'PENDING' && matchStatus === 'ACTIVE') return t('volunteer_trips.status.pending');
    const key = status?.toLowerCase() || 'unknown';
    return t(`volunteer_trips.status.${key}`, { defaultValue: status });
  };

  const pendingRequests = myTrips.filter(
    (t) => t.status === 'PENDING' && t.match?.status === 'ACTIVE'
  );
  const activeTrips = myTrips.filter(
    (t) => (t.status === 'MATCHED' || t.status === 'PENDING') && t.match?.status === 'ACTIVE' && !pendingRequests.some(p => p.match?.id === t.match?.id)
  );
  const pastTrips = myTrips.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'CANCELED' || t.match?.status === 'COMPLETED' || t.match?.status === 'CANCELED'
  );

  const renderTripCard = (trip: TripWithMatch, section: 'pending' | 'active' | 'past') => {
    const { date, time } = formatDateTime(trip.departure_time);
    const isProcessing = processingId === trip.id;
    const matchStatus = trip.match?.status;
    const statusColor = getStatusColor(trip.status, matchStatus);
    const isPending = section === 'pending';
    const isActive = section === 'active';
    const isPast = section === 'past';

    return (
      <View
        key={trip.match?.id || trip.id}
        style={[
          styles.tripCard,
          isPending && { borderColor: pendingColor, borderWidth: 1.5 },
        ]}
      >
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <FontAwesome name={getStatusIcon(trip.status, matchStatus)} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(trip.status, matchStatus)}
          </Text>
        </View>

        <View style={styles.tripRoute}>
          <View style={styles.stationContainer}>
            <View style={[styles.stationDot, { backgroundColor: tintColor }]} />
            <View style={styles.stationInfo}>
              <Text style={styles.stationLabel}>{t('volunteer_trips.labels.from')}</Text>
              <Text style={styles.stationText}>{trip.departure_station}</Text>
            </View>
          </View>

          <View style={styles.routeLine}>
            <View style={[styles.line, { backgroundColor: 'rgba(128,128,128,0.3)' }]} />
            <FontAwesome name="train" size={18} color={tintColor} />
            <View style={[styles.line, { backgroundColor: 'rgba(128,128,128,0.3)' }]} />
          </View>

          <View style={styles.stationContainer}>
            <View style={[styles.stationDot, { backgroundColor: volunteerColor }]} />
            <View style={styles.stationInfo}>
              <Text style={styles.stationLabel}>{t('volunteer_trips.labels.to')}</Text>
              <Text style={styles.stationText}>{trip.arrival_station}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripDateTime}>
          <View style={styles.dateTimeItem}>
            <FontAwesome name="calendar" size={14} color="#666" />
            <Text style={styles.dateTimeText}>{date}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <FontAwesome name="clock-o" size={14} color="#666" />
            <Text style={styles.dateTimeText}>{time}</Text>
          </View>
        </View>

        <View style={styles.travelerInfo}>
          <View style={[styles.travelerAvatar, { backgroundColor: tintColor }]}>
            <FontAwesome name="user" size={16} color="#fff" />
          </View>
          <View style={styles.travelerDetails}>
            <Text style={styles.travelerLabel}>
              {isPending ? t('volunteer_trips.labels.needs_help') : isActive ? t('volunteer_trips.labels.helping') : t('volunteer_trips.labels.helped')}
            </Text>
            <Text style={styles.travelerContact}>{trip.traveler_email || 'Traveler'}</Text>
            {trip.traveler_phone && (
              <Text style={styles.travelerPhone}>
                <FontAwesome name="phone" size={12} color="#666" /> {trip.traveler_phone}
              </Text>
            )}
            {formatMobilityAids(trip.traveler_mobility_aids) && (
              <Text style={styles.travelerPhone}>
                <FontAwesome name="wheelchair" size={12} color="#666" /> {formatMobilityAids(trip.traveler_mobility_aids)}
              </Text>
            )}
            {formatPreferences(trip.traveler_preferences) && (
              <Text style={styles.travelerPhone}>
                <FontAwesome name="info-circle" size={12} color="#666" /> {formatPreferences(trip.traveler_preferences)}
              </Text>
            )}
          </View>
        </View>

        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptMatch(trip)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <FontAwesome name="check" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>{t('volunteer_trips.actions.accept')}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineMatch(trip)}
              disabled={isProcessing}
            >
              <FontAwesome name="times" size={16} color="#E53935" />
              <Text style={[styles.actionButtonText, { color: '#E53935' }]}>{t('volunteer_trips.actions.decline')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isActive && (
          <>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleCompleteTrip(trip)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <FontAwesome name="check" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>{t('volunteer_trips.actions.complete')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelOffer(trip)}
                disabled={isProcessing}
              >
                <FontAwesome name="times" size={16} color="#E53935" />
                <Text style={[styles.actionButtonText, { color: '#E53935' }]}>{t('volunteer_trips.actions.cancel')}</Text>
              </TouchableOpacity>
            </View>

            {trip.match && (
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() =>
                  router.push(
                    `/traveler-location?matchId=${trip.match!.id}&vipUserId=${trip.vip_user_id}`
                  )
                }
              >
                <FontAwesome name="map-marker" size={16} color="#3b82f6" />
                <Text style={styles.trackButtonText}>{t('location_sharing.track_button')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallTraveler(trip.traveler_phone)}
            >
              <FontAwesome name="phone" size={16} color="#fff" />
              <Text style={styles.callButtonText}>{t('phone_call.call_traveler')}</Text>
            </TouchableOpacity>
          </>
        )}

        {isPast && (trip.status === 'COMPLETED' || trip.match?.status === 'COMPLETED') && (
          <View style={styles.actionButtons}>
            {trip.has_review ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: tintColor
                  }
                ]}
                onPress={() => {
                  setSelectedTrip(trip);
                  setReviewModalVisible(true);
                }}
              >
                <FontAwesome name="edit" size={16} color={tintColor} />
                <Text style={[styles.actionButtonText, { color: tintColor }]}>
                  {t('reviews.edit_review', { defaultValue: 'Edit Review' })}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: tintColor,
                  }
                ]}
                onPress={() => {
                  setSelectedTrip(trip);
                  setReviewModalVisible(true);
                }}
              >
                <FontAwesome name="star" size={16} color="#fff" />
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>
                  {t('reviews.title_traveler')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={volunteerColor} />
        <Text style={styles.loadingText}>{t('volunteer_trips.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={volunteerColor}
          />
        }
      >
        <View style={styles.container}>
          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.pendingHeader}>
                <View style={[styles.pendingBadge, { backgroundColor: `${pendingColor}20` }]}>
                  <Text style={[styles.pendingBadgeText, { color: pendingColor }]}>
                    {pendingRequests.length}
                  </Text>
                </View>
                <Text style={styles.sectionTitle}>
                  <FontAwesome name="bell" size={16} color={pendingColor} /> {t('volunteer_trips.sections.pending')}
                </Text>
              </View>
              <Text style={styles.pendingHint}>
                {t('volunteer_trips.alerts.accept_success_msg').split('.')[0]}
              </Text>

              {pendingRequests.map((trip) => renderTripCard(trip, 'pending'))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome name="star" size={16} color={volunteerColor} /> {t('volunteer_trips.sections.active')}
            </Text>

            {activeTrips.length > 0 ? (
              activeTrips.map((trip) => renderTripCard(trip, 'active'))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="calendar-check-o" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('volunteer_trips.empty.no_active')}</Text>
                <Text style={styles.emptySubtext}>
                  {pendingRequests.length > 0
                    ? t('volunteer_trips.empty.no_active_hint_pending')
                    : t('volunteer_trips.empty.no_active_hint_none')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome name="history" size={16} color="#666" /> {t('volunteer_trips.sections.past')}
            </Text>

            {pastTrips.length > 0 ? (
              pastTrips.map((trip) => renderTripCard(trip, 'past'))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="history" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('volunteer_trips.empty.no_past')}</Text>
              </View>
            )}
          </View>

          {pastTrips.filter((t) => t.status === 'COMPLETED' || t.match?.status === 'COMPLETED').length > 0 && (
            <View style={styles.statsSection}>
              <Text style={statsStyles.statsTitle}>{t('volunteer_trips.impact.title')}</Text>
              <View style={statsStyles.statsGrid}>
                <View style={statsStyles.statCard}>
                  <Text style={[statsStyles.statNumber, { color: volunteerColor }]}>
                    {pastTrips.filter((t) => t.status === 'COMPLETED' || t.match?.status === 'COMPLETED').length}
                  </Text>
                  <Text style={statsStyles.statLabel}>{t('volunteer_trips.impact.trips_completed')}</Text>
                </View>
                <View style={statsStyles.statCard}>
                  <FontAwesome name="heart" size={28} color={volunteerColor} />
                  <Text style={statsStyles.statLabel}>{t('volunteer_trips.impact.thank_you')}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ReviewModal
        isVisible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        title={selectedTrip?.has_review ? t('reviews.edit_review', { defaultValue: 'Edit Review' }) : t('reviews.title_traveler')}
        initialRating={selectedTrip?.review?.rating}
        initialComment={selectedTrip?.review?.comment || ''}
      />
    </View>
  );
}

const statsStyles = StyleSheet.create({
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripRoute: {
    marginBottom: 12,
  },
  stationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stationInfo: {
    flex: 1,
  },
  stationLabel: {
    fontSize: 11,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingVertical: 8,
    gap: 8,
  },
  line: {
    height: 2,
    width: 20,
  },
  tripDateTime: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  travelerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerDetails: {
    flex: 1,
  },
  travelerLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  travelerContact: {
    fontSize: 15,
    fontWeight: '500',
  },
  travelerPhone: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pendingBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingHint: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 6,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 10,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
  },
  statsSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    marginBottom: 20,
  },
});
