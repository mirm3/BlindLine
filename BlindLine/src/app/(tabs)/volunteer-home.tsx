import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getAvailableTripRequests,
  offerHelpForTrip,
  subscribeToTripRequests,
  setVolunteerAvailability,
  getVolunteerAvailability,
  AvailableTripRequest,
} from '@/services/tripService';

export default function VolunteerHomeScreen() {
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

  const [availableTrips, setAvailableTrips] = useState<AvailableTripRequest[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offeringTripId, setOfferingTripId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const loadAvailableTrips = useCallback(async () => {
    if (!user) return;
    try {
      // Load availability status
      const availability = await getVolunteerAvailability(user.id);
      setIsAvailable(availability);

      // Load trips only if available
      if (availability) {
        const trips = await getAvailableTripRequests();
        setAvailableTrips(trips);
      } else {
        setAvailableTrips([]);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoadingTrips(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadAvailableTrips();

    // Subscribe to new trip requests
    const unsubscribe = subscribeToTripRequests((newTrip) => {
      setAvailableTrips((prev) => [newTrip as AvailableTripRequest, ...prev]);
    });

    return () => unsubscribe();
  }, [loadAvailableTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAvailableTrips();
  }, [loadAvailableTrips]);

  const handleAvailabilityToggle = async (value: boolean) => {
    if (!user) return;

    setUpdatingAvailability(true);
    try {
      await setVolunteerAvailability(user.id, value);
      setIsAvailable(value);

      if (value) {
        loadAvailableTrips();
      } else {
        setAvailableTrips([]);
      }

      Alert.alert(
        value ? t('volunteer_home.availability.alert_available_title') : t('volunteer_home.availability.alert_unavailable_title'),
        value
          ? t('volunteer_home.availability.alert_available_msg')
          : t('volunteer_home.availability.alert_unavailable_msg')
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t('volunteer_home.availability.error_update');
      Alert.alert('Error', message);
      setIsAvailable(!value);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleOfferHelp = async (trip: AvailableTripRequest) => {
    if (!user) return;

    Alert.alert(
      t('volunteer_home.offer_help.alert_title'),
      t('volunteer_home.offer_help.alert_msg', { departure: trip.departure_station, arrival: trip.arrival_station }),
      [
        { text: t('volunteer_home.offer_help.cancel'), style: 'cancel' },
        {
          text: t('volunteer_home.offer_help.confirm'),
          style: 'default',
          onPress: async () => {
            setOfferingTripId(trip.id);
            try {
              await offerHelpForTrip(trip.id, user.id);
              // Remove from available list
              setAvailableTrips((prev) => prev.filter((t) => t.id !== trip.id));
              Alert.alert(
                t('volunteer_home.offer_help.success_title'),
                t('volunteer_home.offer_help.success_msg'),
                [{ text: 'OK' }]
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : t('volunteer_home.offer_help.error_offer');
              Alert.alert('Error', message);
            } finally {
              setOfferingTripId(null);
            }
          },
        },
      ]
    );
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

  const getTimeUntilTrip = (dateString: string) => {
    const tripDate = new Date(dateString);
    const now = new Date();
    const diffMs = tripDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return t('volunteer_home.trips_section.time_in_days', { count: diffDays });
    } else if (diffHours > 0) {
      return t('volunteer_home.trips_section.time_in_hours', { count: diffHours });
    } else {
      return t('volunteer_home.trips_section.time_soon');
    }
  };

  const renderTripCard = (trip: AvailableTripRequest) => {
    const { date, time } = formatDateTime(trip.departure_time);
    const timeUntil = getTimeUntilTrip(trip.departure_time);
    const isOffering = offeringTripId === trip.id;

    return (
      <View
        key={trip.id}
        style={styles.tripCard}
        accessibilityRole="button"
        accessibilityLabel={`${date} ${time}. ${timeUntil}`}
      >
        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, { backgroundColor: `${volunteerColor}15` }]}>
          <FontAwesome name="clock-o" size={12} color={volunteerColor} />
          <Text style={[styles.urgencyText, { color: volunteerColor }]}>{timeUntil}</Text>
        </View>

        {/* Route Info */}
        <View style={styles.tripRoute}>
          <View style={styles.stationContainer}>
            <View style={[styles.stationDot, { backgroundColor: tintColor }]} />
            <View style={styles.stationInfo}>
              <Text style={styles.stationLabel}>{t('volunteer_home.trips_section.from')}</Text>
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
              <Text style={styles.stationLabel}>{t('volunteer_home.trips_section.to')}</Text>
              <Text style={styles.stationText}>{trip.arrival_station}</Text>
            </View>
          </View>
        </View>

        {/* Date/Time */}
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

        {/* Traveler Info */}
        <View style={styles.travelerInfo}>
          <View style={styles.travelerAvatar}>
            <FontAwesome name="user" size={16} color="#fff" />
          </View>
          <View style={styles.travelerDetails}>
            <Text style={styles.travelerLabel}>{t('volunteer_home.trips_section.traveler_needs')}</Text>
            <Text style={styles.travelerContact}>{trip.traveler_email}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.offerButton, { backgroundColor: volunteerColor }]}
          onPress={() => handleOfferHelp(trip)}
          disabled={isOffering}
          accessibilityRole="button"
          accessibilityLabel={t('volunteer_home.trips_section.offer_button')}
        >
          {isOffering ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome name="heart" size={18} color="#fff" />
              <Text style={styles.offerButtonText}>{t('volunteer_home.trips_section.offer_button')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoadingTrips) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={volunteerColor} />
        <Text style={styles.loadingText}>{t('volunteer_home.loading_trips')}</Text>
      </View>
    );
  }

  return (
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
        {/* Availability Toggle */}
        <View style={[styles.availabilitySection, { borderColor: volunteerColor }]}>
          <View style={styles.availabilityHeader}>
            <View style={styles.availabilityLeft}>
              <FontAwesome
                name={isAvailable ? 'check-circle' : 'circle'}
                size={24}
                color={isAvailable ? volunteerColor : '#999'}
              />
              <View style={styles.availabilityText}>
                <Text style={styles.availabilityTitle}>
                  {isAvailable ? t('volunteer_home.availability.available') : t('volunteer_home.availability.set_available')}
                </Text>
                <Text style={styles.availabilitySubtitle}>
                  {isAvailable
                    ? t('volunteer_home.availability.showing_trips')
                    : t('volunteer_home.availability.turn_on')}
                </Text>
              </View>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              disabled={updatingAvailability}
              trackColor={{ false: '#d0d0d0', true: `${volunteerColor}40` }}
              thumbColor={isAvailable ? volunteerColor : '#f0f0f0'}
              style={styles.switch}
            />
          </View>
        </View>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.headerIcon, { backgroundColor: `${volunteerColor}15` }]}>
            <FontAwesome name="heart" size={32} color={volunteerColor} />
          </View>
          <Text style={styles.headerTitle}>{t('volunteer_home.header.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('volunteer_home.header.subtitle')}
          </Text>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: volunteerColor }]}>
              {availableTrips.length}
            </Text>
            <Text style={styles.statLabel}>{t('volunteer_home.stats.available_trips')}</Text>
          </View>
        </View>

        {/* Available Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome name="search" size={16} color={volunteerColor} /> {t('volunteer_home.trips_section.title')}
          </Text>

          {availableTrips.length > 0 ? (
            availableTrips.map(renderTripCard)
          ) : (
            <View style={styles.emptyState}>
              {!isAvailable ? (
                <>
                  <FontAwesome name="circle-o" size={50} color="#ccc" />
                  <Text style={styles.emptyTitle}>{t('volunteer_home.empty_state.not_available_title')}</Text>
                  <Text style={styles.emptyText}>
                    {t('volunteer_home.empty_state.not_available_msg')}
                  </Text>
                </>
              ) : (
                <>
                  <FontAwesome name="check-circle" size={50} color="#ccc" />
                  <Text style={styles.emptyTitle}>{t('volunteer_home.empty_state.no_trips_title')}</Text>
                  <Text style={styles.emptyText}>
                    {t('volunteer_home.empty_state.no_trips_msg')}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>{t('volunteer_home.tips.title')}</Text>
          <View style={styles.tipItem}>
            <FontAwesome name="check" size={14} color={volunteerColor} />
            <Text style={styles.tipText}>
              {t('volunteer_home.tips.tip1')}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome name="check" size={14} color={volunteerColor} />
            <Text style={styles.tipText}>
              {t('volunteer_home.tips.tip2')}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome name="check" size={14} color={volunteerColor} />
            <Text style={styles.tipText}>
              {t('volunteer_home.tips.tip3')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  availabilitySection: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityText: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  availabilitySubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  switch: {
    marginLeft: 8,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
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
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripRoute: {
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F95DC',
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
    fontSize: 14,
    fontWeight: '500',
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  offerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
