import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { View as RNView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { createTripRequest } from '@/services/tripService';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';

// Belgian train stations
const STATIONS = [
  'Brussels-Central',
  'Brussels-Midi',
  'Brussels-North',
  'Antwerp-Central',
  'Ghent-Sint-Pieters',
  'Bruges',
  'Leuven',
  'Liège-Guillemins',
  'Charleroi-South',
  'Namur',
  'Mechelen',
  'Ostend',
  'Hasselt',
  'Mons',
  'Kortrijk',
];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 4;

export default function RequestTripScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const { user } = useAuth();

  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState<'departure' | 'arrival' | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState({ top: 0, left: 0, width: 0 });
  const departureRef = useRef<any>(null);
  const arrivalRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteDepartures, setFavoriteDepartures] = useState<string[]>([]);
  const [favoriteArrivals, setFavoriteArrivals] = useState<string[]>([]);

  const showDepartureDropdown = activeDropdown === 'departure';
  const showArrivalDropdown = activeDropdown === 'arrival';

  const openDropdown = (which: 'departure' | 'arrival') => {
    const ref = which === 'departure' ? departureRef : arrivalRef;
    ref.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      containerRef.current?.measureInWindow((cx: number, cy: number) => {
        setDropdownAnchor({ top: y + height + 4 - cy, left: x - cx, width });
        setActiveDropdown(which);
      });
    });
  };

  const closeDropdown = () => setActiveDropdown(null);

  useEffect(() => {
    const fetchFavoriteStations = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('trip_request')
          .select('departure_station, arrival_station')
          .eq('vip_user_id', user.id);

        if (!data || data.length === 0) return;

        // Count frequency of each station
        const depCount: Record<string, number> = {};
        const arrCount: Record<string, number> = {};
        data.forEach((row) => {
          depCount[row.departure_station] = (depCount[row.departure_station] || 0) + 1;
          arrCount[row.arrival_station] = (arrCount[row.arrival_station] || 0) + 1;
        });

        const top2 = (counts: Record<string, number>) =>
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([station]) => station);

        setFavoriteDepartures(top2(depCount));
        setFavoriteArrivals(top2(arrCount));
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    fetchFavoriteStations();
  }, [user]);

  const filterStations = (query: string) => {
    if (!query) return STATIONS;
    const filtered = STATIONS.filter((station) =>
      station.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.length > 0 ? filtered : STATIONS;
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!departureStation) {
      setError(t('request_trip.validation.error_dep'));
      return;
    }
    if (!arrivalStation) {
      setError(t('request_trip.validation.error_arr'));
      return;
    }
    if (departureStation === arrivalStation) {
      setError(t('request_trip.validation.error_same'));
      return;
    }
    if (departureDate <= new Date()) {
      setError(t('request_trip.validation.error_future'));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await createTripRequest({
        vipUserId: user.id,
        departureStation,
        arrivalStation,
        departureTime: departureDate.toISOString(),
      });

      Alert.alert(
        t('request_trip.alerts.success_title'),
        t('request_trip.alerts.success_msg'),
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/two') }]
      );
    } catch (err: any) {
      const message = err.message || t('request_trip.alerts.error_msg');
      setError(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || departureDate;
    setShowDatePicker(Platform.OS === 'ios');
    const updated = new Date(currentDate);
    updated.setHours(departureDate.getHours());
    updated.setMinutes(departureDate.getMinutes());
    setDepartureDate(updated);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || departureDate;
    setShowTimePicker(Platform.OS === 'ios');
    const updated = new Date(departureDate);
    updated.setHours(currentTime.getHours());
    updated.setMinutes(currentTime.getMinutes());
    setDepartureDate(updated);
  };

  const dropdownBg = colorScheme === 'dark' ? '#1c1c1e' : '#fff';

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RNView ref={containerRef} style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.container}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={[styles.iconContainer, { backgroundColor: `${tintColor}15` }]}>
              <FontAwesome name="train" size={32} color={tintColor} />
            </View>
            <Text style={styles.title}>{t('request_trip.header')}</Text>
            <Text style={styles.subtitle}>{t('request_trip.subtitle')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Departure Station */}
            <View style={styles.inputContainer}>
              <View style={styles.stationLabelContainer}>
                <Text style={styles.inputLabel}>{t('request_trip.labels.departure')}</Text>
                {favoriteDepartures.length > 0 && (
                  <View style={styles.favoritesContainer}>
                    {favoriteDepartures.map((fav) => (
                      <TouchableOpacity
                        key={fav}
                        style={[styles.favoriteBadge, { backgroundColor: `${tintColor}15` }]}
                        onPress={() => setDepartureStation(fav)}
                      >
                        <FontAwesome name="star" size={10} color={tintColor} />
                        <Text style={[styles.favoriteText, { color: tintColor }]}>{fav}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <RNView
                ref={departureRef}
                style={[styles.inputWrapper, { borderColor: tintColor }]}
              >
                <FontAwesome name="circle-o" size={16} color={tintColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { color: textColor }]}
                  value={departureStation}
                  onChangeText={(text) => {
                    setDepartureStation(text);
                    openDropdown('departure');
                  }}
                  onFocus={() => {
                    openDropdown('departure');
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}
                  placeholder={t('request_trip.placeholders.departure')}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => showDepartureDropdown ? closeDropdown() : openDropdown('departure')}>
                  <FontAwesome name={showDepartureDropdown ? 'chevron-up' : 'chevron-down'} size={14} color="#999" />
                </TouchableOpacity>
              </RNView>
            </View>

            {/* Arrival Station */}
            <View style={styles.inputContainer}>
              <View style={styles.stationLabelContainer}>
                <Text style={styles.inputLabel}>{t('request_trip.labels.arrival')}</Text>
                {favoriteArrivals.length > 0 && (
                  <View style={styles.favoritesContainer}>
                    {favoriteArrivals.map((fav) => (
                      <TouchableOpacity
                        key={fav}
                        style={[styles.favoriteBadge, { backgroundColor: `${tintColor}15` }]}
                        onPress={() => setArrivalStation(fav)}
                      >
                        <FontAwesome name="star" size={10} color={tintColor} />
                        <Text style={[styles.favoriteText, { color: tintColor }]}>{fav}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <RNView
                ref={arrivalRef}
                style={[styles.inputWrapper, { borderColor: tintColor }]}
              >
                <FontAwesome name="map-marker" size={18} color={tintColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { color: textColor }]}
                  value={arrivalStation}
                  onChangeText={(text) => {
                    setArrivalStation(text);
                    openDropdown('arrival');
                  }}
                  onFocus={() => {
                    openDropdown('arrival');
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}
                  placeholder={t('request_trip.placeholders.arrival')}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => showArrivalDropdown ? closeDropdown() : openDropdown('arrival')}>
                  <FontAwesome name={showArrivalDropdown ? 'chevron-up' : 'chevron-down'} size={14} color="#999" />
                </TouchableOpacity>
              </RNView>
            </View>

            {/* Date Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('request_trip.labels.date')}</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { borderColor: tintColor }]}
                onPress={() => {
                  setShowDatePicker(true);
                  setShowTimePicker(false);
                  closeDropdown();
                  Keyboard.dismiss();
                }}
              >
                <FontAwesome name="calendar" size={16} color={tintColor} style={styles.inputIcon} />
                <Text style={styles.inputText}>{formatDate(departureDate)}</Text>
                <FontAwesome name="chevron-down" size={14} color="#999" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={departureDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.pickerDoneText, { color: tintColor }]}>Done</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Time Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('request_trip.labels.time')}</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { borderColor: tintColor }]}
                onPress={() => {
                  setShowTimePicker(true);
                  setShowDatePicker(false);
                  closeDropdown();
                  Keyboard.dismiss();
                }}
              >
                <FontAwesome name="clock-o" size={18} color={tintColor} style={styles.inputIcon} />
                <Text style={styles.inputText}>{formatTime(departureDate)}</Text>
                <FontAwesome name="chevron-down" size={14} color="#999" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={departureDate}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
              {Platform.OS === 'ios' && showTimePicker && (
                <TouchableOpacity style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                  <Text style={[styles.pickerDoneText, { color: tintColor }]}>Done</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={16} color="#E53935" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: tintColor }]}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityLabel={t('request_trip.button')}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="paper-plane" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>{t('request_trip.button')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>{t('request_trip.next_steps.title')}</Text>
            <View style={styles.infoItem}>
              <View style={[styles.infoNumber, { backgroundColor: tintColor }]}>
                <Text style={styles.infoNumberText}>1</Text>
              </View>
              <Text style={styles.infoText}>{t('request_trip.next_steps.step1')}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoNumber, { backgroundColor: tintColor }]}>
                <Text style={styles.infoNumberText}>2</Text>
              </View>
              <Text style={styles.infoText}>{t('request_trip.next_steps.step2')}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoNumber, { backgroundColor: tintColor }]}>
                <Text style={styles.infoNumberText}>3</Text>
              </View>
              <Text style={styles.infoText}>{t('request_trip.next_steps.step3')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Dropdown overlay — sibling to ScrollView, never nested inside it */}
      {activeDropdown !== null && (
        <RNView style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop: transparent, closes dropdown on outside tap */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeDropdown}
            activeOpacity={1}
          />
          {/* Dropdown list positioned under the active input */}
          <RNView style={[
            styles.dropdown,
            { top: dropdownAnchor.top, left: dropdownAnchor.left, width: dropdownAnchor.width, backgroundColor: dropdownBg },
          ]}>
            <ScrollView
              style={{ maxHeight: ITEM_HEIGHT * VISIBLE_ITEMS }}
              keyboardShouldPersistTaps="always"
              bounces={false}
            >
              {filterStations(activeDropdown === 'departure' ? departureStation : arrivalStation).map((station) => (
                <TouchableOpacity
                  key={station}
                  style={styles.dropdownItem}
                  onPress={() => {
                    if (activeDropdown === 'departure') setDepartureStation(station);
                    else setArrivalStation(station);
                    closeDropdown();
                  }}
                >
                  <Text style={styles.dropdownText}>{station}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </RNView>
        </RNView>
      )}
      </RNView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stationLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoritesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  favoriteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  favoriteText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  dropdownText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 10,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
