import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Switch,
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
  getTravelerTrips,
  cancelTripRequest,
  submitReview,
  subscribeToUserTrips,
  TripWithMatch,
} from '@/services/tripService';
import {
  requestLocationPermission,
  getCurrentPosition,
  upsertVipLocation,
} from '@/services/locationService';
import ReviewModal from '@/components/ReviewModal';

export default function MyTripsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { user } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<TripWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripWithMatch | null>(null);
  const [sharingMatchId, setSharingMatchId] = useState<string | null>(null);
  const [notifiedTripIds, setNotifiedTripIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sharingMatchIdRef = useRef<string | null>(null);

  const loadTrips = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTravelerTrips(user.id);
      setTrips(data);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Real-time updates for VIP
  useEffect(() => {
    if (!user) return;
    const subscription = subscribeToUserTrips(user.id, loadTrips);
    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadTrips]);

  // Logic for no match found after 10 minutes
  useEffect(() => {
    const checkNoMatchFound = () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const tripToNotify = trips.find(trip =>
        trip.status === 'PENDING' &&
        trip.created_at &&
        new Date(trip.created_at) < tenMinutesAgo &&
        !notifiedTripIds.has(trip.id)
      );

      if (tripToNotify) {
        setNotifiedTripIds(prev => new Set(prev).add(tripToNotify.id));

        Alert.alert(
          t('traveler_trips.alerts.no_match_title'),
          t('traveler_trips.alerts.no_match_msg'),
          [
            {
              text: t('traveler_trips.actions.cancel_trip'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await cancelTripRequest(tripToNotify.id);
                  loadTrips();
                } catch (error) {
                  Alert.alert('Error', t('traveler_trips.alerts.error_cancel'));
                }
              }
            },
            {
              text: t('traveler_trips.actions.new_trip'),
              onPress: async () => {
                try {
                  await cancelTripRequest(tripToNotify.id);
                  loadTrips();
                  router.push('/request-trip');
                } catch (error) {
                  router.push('/request-trip');
                }
              }
            }
          ],
          { cancelable: false }
        );
      }
    };

    const interval = setInterval(checkNoMatchFound, 10000); // Check every 10 seconds
    checkNoMatchFound();

    return () => clearInterval(interval);
  }, [trips, notifiedTripIds, t, loadTrips, router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
  }, [loadTrips]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedTrip) return;
    try {
      await submitReview(selectedTrip.id, rating, comment);
      Alert.alert(t('reviews.success_title'), t('reviews.success_msg'));

      // Optimistically update the UI before refreshing
      setTrips(currentTrips =>
        currentTrips.map(trip =>
          trip.id === selectedTrip.id
            ? { ...trip, has_review: true, review: { rating, comment } }
            : trip
        )
      );

      loadTrips();
    } catch (error) {
      throw error;
    }
  };

  const handleCancelTrip = (trip: TripWithMatch) => {
    Alert.alert(
      t('traveler_trips.alerts.cancel_title'),
      t('traveler_trips.alerts.cancel_msg'),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('traveler_trips.actions.cancel_trip'),
          style: 'destructive',
          onPress: async () => {
            setCancelingId(trip.id);
            try {
              await cancelTripRequest(trip.id);
              loadTrips();
              Alert.alert(t('traveler_trips.alerts.cancel_success_title'), t('traveler_trips.alerts.cancel_success_msg'));
            } catch (error) {
              const message = error instanceof Error ? error.message : t('traveler_trips.alerts.error_cancel');
              Alert.alert('Error', message);
            } finally {
              setCancelingId(null);
            }
          },
        },
      ]
    );
  };

  // Stop sharing when the screen unmounts
  useEffect(() => {
    return () => {
      sharingMatchIdRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Stop sharing if the active match is no longer MATCHED (e.g. trip completed/canceled)
  useEffect(() => {
    if (!sharingMatchId) return;
    const stillActive = trips.some(
      (t) => t.match?.id === sharingMatchId && t.status === 'MATCHED'
    );
    if (!stillActive) {
      // Nullify the ref immediately (synchronous) so any in-flight share() bails early
      sharingMatchIdRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSharingMatchId(null);
    }
  }, [trips, sharingMatchId]);

  const handleToggleSharing = async (matchId: string, enable: boolean) => {
    if (!user) return;

    if (!enable) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSharingMatchId(null);
      return;
    }

    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert(
        t('location_sharing.permission_denied_title'),
        t('location_sharing.permission_denied_msg')
      );
      return;
    }

    // Stop any existing sharing
    if (intervalRef.current) clearInterval(intervalRef.current);
    sharingMatchIdRef.current = matchId;
    setSharingMatchId(matchId);

    const share = async () => {
      // Guard: bail out if sharing was stopped while this async call was in-flight
      if (sharingMatchIdRef.current !== matchId) return;
      try {
        const { latitude, longitude } = await getCurrentPosition();
        if (sharingMatchIdRef.current !== matchId) return;
        await upsertVipLocation(user.id, matchId, latitude, longitude);
      } catch (err) {
        console.error('Location sharing error:', err);
      }
    };

    // Share immediately, then every 10 seconds
    share();
    intervalRef.current = setInterval(share, 10000);
  };

  const handleCallVolunteer = (phone: string | undefined) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCHED': return '#4CAF50';
      case 'PENDING': return '#FF9800';
      case 'COMPLETED': return '#9E9E9E';
      case 'CANCELED': return '#E53935';
      default: return tintColor;
    }
  };

  const getStatusIcon = (status: string): 'check-circle' | 'clock-o' | 'check' | 'times-circle' | 'circle' => {
    switch (status) {
      case 'MATCHED': return 'check-circle';
      case 'PENDING': return 'clock-o';
      case 'COMPLETED': return 'check';
      case 'CANCELED': return 'times-circle';
      default: return 'circle';
    }
  };

  // Separate upcoming and past trips
  const now = new Date();
  const upcomingTrips = trips.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELED' && t.match?.status !== 'COMPLETED' && new Date(t.departure_time) >= now
  );
  const pastTrips = trips.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'CANCELED' || t.match?.status === 'COMPLETED' || new Date(t.departure_time) < now
  );

  const renderTripCard = (trip: TripWithMatch, isUpcoming: boolean) => {
    const { date, time } = formatDateTime(trip.departure_time);
    const statusColor = getStatusColor(trip.status);
    const isCanceling = cancelingId === trip.id;
    const isActuallyCompleted = trip.status === 'COMPLETED' || trip.match?.status === 'COMPLETED';

    return (
      <View
        key={trip.id}
        style={styles.tripCard}
        accessibilityRole="button"
        accessibilityLabel={`${trip.departure_station} to ${trip.arrival_station}. ${date} ${time}. ${trip.status}`}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripRoute}>
            <View style={styles.stationContainer}>
              <FontAwesome name="circle-o" size={12} color={tintColor} />
              <Text style={styles.stationText}>{trip.departure_station}</Text>
            </View>
            <View style={styles.routeLine}>
              <View style={[styles.line, { backgroundColor: tintColor }]} />
              <FontAwesome name="train" size={16} color={tintColor} />
              <View style={[styles.line, { backgroundColor: tintColor }]} />
            </View>
            <View style={styles.stationContainer}>
              <FontAwesome name="map-marker" size={14} color={tintColor} />
              <Text style={styles.stationText}>{trip.arrival_station}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripDateTime}>
            <FontAwesome name="calendar" size={14} color="#666" />
            <Text style={styles.tripDateText}>{date}</Text>
            <FontAwesome name="clock-o" size={14} color="#666" style={{ marginLeft: 12 }} />
            <Text style={styles.tripDateText}>{time}</Text>
          </View>

          <View style={styles.tripStatus}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <FontAwesome name={getStatusIcon(trip.status)} size={12} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {t(`traveler_trips.status.${trip.status.toLowerCase()}`, { defaultValue: trip.status })}
              </Text>
            </View>
          </View>
        </View>

        {trip.match?.volunteer_email ? (
          <View style={styles.volunteerInfo}>
            <View style={styles.volunteerAvatar}>
              <FontAwesome name="user" size={16} color="#fff" />
            </View>
            <View style={styles.volunteerDetails}>
              <Text style={styles.volunteerText}>
                {isUpcoming ? t('traveler_trips.labels.traveling_with') : t('traveler_trips.labels.traveled_with')}:
              </Text>
              <Text style={styles.volunteerName}>{trip.match.volunteer_email}</Text>
              {trip.match.volunteer_phone && (
                <Text style={styles.volunteerPhone}>
                  <FontAwesome name="phone" size={12} color="#666" /> {trip.match.volunteer_phone}
                </Text>
              )}
            </View>
          </View>
        ) : trip.status === 'PENDING' ? (
          <View style={styles.waitingVolunteer}>
            <FontAwesome name="hourglass-half" size={14} color="#FF9800" />
            <Text style={styles.waitingText}>{t('traveler_trips.status.waiting')}</Text>
          </View>
        ) : null}

        {/* Call Volunteer — prominent button for MATCHED upcoming trips */}
        {isUpcoming && trip.status === 'MATCHED' && trip.match && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCallVolunteer(trip.match?.volunteer_phone)}
            accessibilityRole="button"
            accessibilityLabel={t('phone_call.call_volunteer')}
          >
            <FontAwesome name="phone" size={20} color="#fff" />
            <Text style={styles.callButtonText}>{t('phone_call.call_volunteer')}</Text>
          </TouchableOpacity>
        )}

        {/* Location Sharing — only for MATCHED upcoming trips */}
        {isUpcoming && trip.status === 'MATCHED' && trip.match && (
          <View style={styles.locationRow}>
            <View style={styles.locationLabelRow}>
              <FontAwesome name="map-marker" size={14} color="#3b82f6" />
              <Text style={styles.locationLabel}>{t('location_sharing.share_label')}</Text>
              {sharingMatchId === trip.match.id && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeText}>{t('location_sharing.sharing_active')}</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/traveler-location',
                  params: { matchId: trip.match!.id, vipUserId: trip.vip_user_id }
                })}
                style={{ padding: 8 }}
              >
                <FontAwesome name="map" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <Switch
                value={sharingMatchId === trip.match.id}
                onValueChange={(val) => handleToggleSharing(trip.match!.id, val)}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={sharingMatchId === trip.match.id ? '#3b82f6' : '#9ca3af'}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {isUpcoming && trip.status !== 'CANCELED' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelTrip(trip)}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator color="#E53935" size="small" />
              ) : (
                <>
                  <FontAwesome name="times" size={14} color="#E53935" />
                  <Text style={styles.cancelButtonText}>{t('traveler_trips.actions.cancel_trip')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {!isUpcoming && isActuallyCompleted && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {!trip.has_review ? (
                <TouchableOpacity
                  style={[styles.reviewButton, { backgroundColor: tintColor, flex: 1 }]}
                  onPress={() => {
                    setSelectedTrip(trip);
                    setReviewModalVisible(true);
                  }}
                >
                  <FontAwesome name="star" size={14} color="#fff" />
                  <Text style={[styles.reviewButtonText, { color: "#fff" }]}>
                    {t('reviews.title_volunteer')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.reviewButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: tintColor, flex: 1 }]}
                  onPress={() => {
                    setSelectedTrip(trip);
                    setReviewModalVisible(true);
                  }}
                >
                  <FontAwesome name="edit" size={14} color={tintColor} />
                  <Text style={[styles.reviewButtonText, { color: tintColor }]}>
                    {t('reviews.edit_review', { defaultValue: 'Edit Review' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (user?.userType === 'volunteer') {
      router.replace('/(tabs)');
    }
  }, [user?.userType]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={styles.loadingText}>{t('traveler_trips.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        accessible={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        }
      >
        <View style={styles.container}>
          {/* New Trip Button */}
          <TouchableOpacity
            style={[styles.newTripButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/request-trip')}
            accessibilityRole="button"
            accessibilityLabel={t('traveler_trips.plan_new_trip')}
          >
            <FontAwesome name="plus" size={18} color="#fff" />
            <Text style={styles.newTripButtonText}>{t('traveler_trips.plan_new_trip')}</Text>
          </TouchableOpacity>

          {/* Upcoming Trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('traveler_trips.sections.upcoming')}</Text>
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => renderTripCard(trip, true))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="calendar-o" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('traveler_trips.empty.no_upcoming')}</Text>
                <Text style={styles.emptySubtext}>{t('traveler_trips.empty.no_upcoming_hint')}</Text>
              </View>
            )}
          </View>

          {/* Past Trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('traveler_trips.sections.past')}</Text>
            {pastTrips.length > 0 ? (
              pastTrips.map(trip => renderTripCard(trip, false))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="history" size={40} color="#ccc" />
                <Text style={styles.emptyText}>{t('traveler_trips.empty.no_past')}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ReviewModal
        isVisible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        title={selectedTrip?.has_review ? t('reviews.edit_review', { defaultValue: 'Edit Review' }) : t('reviews.title_volunteer')}
        initialRating={selectedTrip?.review?.rating}
        initialComment={selectedTrip?.review?.comment || ''}
      />
    </View>
  );
}

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
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  newTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  tripHeader: {
    marginBottom: 12,
  },
  tripRoute: {
    gap: 4,
  },
  stationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingVertical: 4,
    gap: 8,
  },
  line: {
    height: 2,
    width: 20,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  tripDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  tripStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  volunteerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerText: {
    fontSize: 12,
    opacity: 0.6,
  },
  volunteerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  volunteerPhone: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  waitingVolunteer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  waitingText: {
    fontSize: 14,
    color: '#FF9800',
  },
  cardActions: {
    marginTop: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E53935',
    gap: 6,
  },
  cancelButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  activeIndicator: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
});
