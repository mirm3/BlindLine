import { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

type AvailWindow = { dow: number; start: string; end: string };
type Route = { from: string; to: string };

const STATIONS = [
  'Brussels-Central', 'Brussels-Midi', 'Brussels-North', 'Antwerp-Central',
  'Ghent-Sint-Pieters', 'Bruges', 'Leuven', 'Liège-Guillemins',
  'Charleroi-South', 'Namur', 'Mechelen', 'Ostend', 'Hasselt', 'Mons', 'Kortrijk',
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const { user, signOut } = useAuth();

  const DAY_LABELS: string[] = useMemo(() => t('profile.days', { returnObjects: true }) as string[], [t]);

  const VISION_OPTIONS = useMemo(() => [
    { key: 'completely_blind', label: t('onboarding_vision.options.completely_blind'), icon: 'eye-slash' as const },
    { key: 'low_vision', label: t('onboarding_vision.options.low_vision'), icon: 'low-vision' as const },
    { key: 'skip', label: t('onboarding_vision.options.skip'), icon: 'user-secret' as const },
  ], [t]);

  const MOBILITY_OPTIONS = useMemo(() => [
    { key: 'yes', label: t('onboarding_mobility.options.yes'), icon: 'check' as const },
    { key: 'no', label: t('onboarding_mobility.options.no'), icon: 'close' as const },
  ], [t]);

  const ASSISTANCE_OPTIONS = useMemo(() => [
    { key: 'finding_platform', label: t('onboarding_assistance.options.finding_platform'), icon: 'map-signs' as const },
    { key: 'boarding_train', label: t('onboarding_assistance.options.boarding_train'), icon: 'train' as const },
    { key: 'finding_seat', label: t('onboarding_assistance.options.finding_seat'), icon: 'ticket' as const },
    { key: 'guidance_station', label: t('onboarding_assistance.options.guidance_station'), icon: 'building' as const },
    { key: 'announcements', label: t('onboarding_assistance.options.announcements'), icon: 'bullhorn' as const },
  ], [t]);

  const LANGUAGE_OPTIONS = useMemo(() => [
    { key: 'nl', label: t('onboarding_language.options.dutch'), icon: 'comment' as const },
    { key: 'en', label: t('onboarding_language.options.english'), icon: 'comment' as const },
    { key: 'fr', label: t('onboarding_language.options.french'), icon: 'comment' as const },
    { key: 'pl', label: t('onboarding_language.options.polish'), icon: 'comment' as const },
    { key: 'tr', label: t('onboarding_language.options.turkish'), icon: 'comment' as const },
  ], [t]);

  const CONTACT_OPTIONS = useMemo(() => [
    { key: 'phone', label: t('profile.contact_methods.phone'), icon: 'phone' as const },
    { key: 'sms', label: t('profile.contact_methods.sms'), icon: 'envelope' as const },
  ], [t]);

  // Profile info editing
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences state (travelers only)
  const [visualImpairment, setVisualImpairment] = useState<string | null>(null);
  const [mobilityAids, setMobilityAids] = useState<string[]>([]);
  const [assistanceNeeds, setAssistanceNeeds] = useState<string[]>([]);
  const [language, setLanguage] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsChanged, setPrefsChanged] = useState(false);

  const [origPrefs, setOrigPrefs] = useState({
    visualImpairment: null as string | null,
    mobilityAids: [] as string[],
    assistanceNeeds: [] as string[],
    language: null as string | null,
  });

  const isTraveler = user?.userType === 'traveler';
  const isVolunteer = user?.userType === 'volunteer';

  // Volunteer profile state
  const [availability, setAvailability] = useState<AvailWindow[]>([]);
  const [preferredRoutes, setPreferredRoutes] = useState<Route[]>([]);
  const [volunteerLanguages, setVolunteerLanguages] = useState<string[]>([]);
  const [volunteerAssistance, setVolunteerAssistance] = useState<string[]>([]);
  const [volunteerContact, setVolunteerContact] = useState<string | null>(null);
  const [isSavingVolunteer, setIsSavingVolunteer] = useState(false);
  const [volunteerChanged, setVolunteerChanged] = useState(false);

  const [origVolunteerPrefs, setOrigVolunteerPrefs] = useState({
    availability: [] as AvailWindow[],
    preferredRoutes: [] as Route[],
    languages: [] as string[],
    assistance: [] as string[],
    contact: null as string | null,
  });

  // Availability form state
  const [availFormVisible, setAvailFormVisible] = useState(false);
  const [availFormDow, setAvailFormDow] = useState<number | null>(null);
  const [availFormStart, setAvailFormStart] = useState('08:00');
  const [availFormEnd, setAvailFormEnd] = useState('18:00');

  // Route form state
  const [routeFormVisible, setRouteFormVisible] = useState(false);
  const [routeFormFrom, setRouteFormFrom] = useState('');
  const [routeFormTo, setRouteFormTo] = useState('');

  // Active inline dropdown: 'availStart' | 'availEnd' | 'routeFrom' | 'routeTo' | null
  const [activePicker, setActivePicker] = useState<string | null>(null);

  const loadTravelerPreferences = useCallback(async () => {
    if (!user || !isTraveler) return;
    const { data } = await supabase
      .from('vip_profile')
      .select('preferences, mobility_aids')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      let parsedPrefs: { visual_impairment?: string; assistance_needs?: string[]; language?: string } = {};
      let parsedMobility: string[] = [];

      if (data.preferences) {
        try {
          parsedPrefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences;
        } catch { /* ignore */ }
      }
      if (data.mobility_aids) {
        try {
          parsedMobility = typeof data.mobility_aids === 'string' ? JSON.parse(data.mobility_aids) : data.mobility_aids;
        } catch { /* ignore */ }
      }

      const vi = parsedPrefs.visual_impairment ?? null;
      const an = parsedPrefs.assistance_needs ?? [];
      const lang = parsedPrefs.language ?? null;

      setVisualImpairment(vi);
      setMobilityAids(parsedMobility);
      setAssistanceNeeds(an);
      setLanguage(lang);
      setOrigPrefs({ visualImpairment: vi, mobilityAids: parsedMobility, assistanceNeeds: an, language: lang });
      setPrefsChanged(false);
    }
  }, [user, isTraveler]);

  const loadVolunteerProfile = useCallback(async () => {
    if (!user || !isVolunteer) return;
    const { data } = await supabase
      .from('volunteer_profile')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      let parsedPrefs: {
        availability?: AvailWindow[];
        preferred_routes?: Route[];
        languages?: string[];
        assistance?: string[];
        contact?: string;
      } = {};

      if (data.preferences) {
        try {
          parsedPrefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences;
        } catch { /* ignore */ }
      }

      const avail: AvailWindow[] = Array.isArray(parsedPrefs.availability) ? parsedPrefs.availability : [];
      const routes: Route[] = Array.isArray(parsedPrefs.preferred_routes) ? parsedPrefs.preferred_routes : [];
      const languages: string[] = Array.isArray(parsedPrefs.languages) ? parsedPrefs.languages : [];
      const assistance: string[] = Array.isArray(parsedPrefs.assistance) ? parsedPrefs.assistance : [];
      const contact = parsedPrefs.contact ?? null;

      setAvailability(avail);
      setPreferredRoutes(routes);
      setVolunteerLanguages(languages);
      setVolunteerAssistance(assistance);
      setVolunteerContact(contact);
      setOrigVolunteerPrefs({ availability: avail, preferredRoutes: routes, languages, assistance, contact });
      setVolunteerChanged(false);
    }
  }, [user, isVolunteer]);

  useEffect(() => {
    loadTravelerPreferences();
  }, [loadTravelerPreferences]);

  useEffect(() => {
    loadVolunteerProfile();
  }, [loadVolunteerProfile]);

  // Detect preference changes (traveler)
  useEffect(() => {
    if (!isTraveler) return;
    const changed =
      visualImpairment !== origPrefs.visualImpairment ||
      language !== origPrefs.language ||
      JSON.stringify(mobilityAids.slice().sort()) !== JSON.stringify(origPrefs.mobilityAids.slice().sort()) ||
      JSON.stringify(assistanceNeeds.slice().sort()) !== JSON.stringify(origPrefs.assistanceNeeds.slice().sort());
    setPrefsChanged(changed);
  }, [visualImpairment, mobilityAids, assistanceNeeds, language, origPrefs, isTraveler]);

  // Detect volunteer changes
  useEffect(() => {
    if (!isVolunteer) return;
    const changed =
      JSON.stringify(availability) !== JSON.stringify(origVolunteerPrefs.availability) ||
      JSON.stringify(preferredRoutes) !== JSON.stringify(origVolunteerPrefs.preferredRoutes) ||
      volunteerContact !== origVolunteerPrefs.contact ||
      JSON.stringify(volunteerLanguages.slice().sort()) !== JSON.stringify(origVolunteerPrefs.languages.slice().sort()) ||
      JSON.stringify(volunteerAssistance.slice().sort()) !== JSON.stringify(origVolunteerPrefs.assistance.slice().sort());
    setVolunteerChanged(changed);
  }, [availability, preferredRoutes, volunteerLanguages, volunteerAssistance, volunteerContact, origVolunteerPrefs, isVolunteer]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ email: email || null, phone: phone || null })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditingProfile(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('profile.alerts.error_profile');
      Alert.alert(t('profile.alerts.error_title'), message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSavingPrefs(true);
    try {
      const preferences = {
        visual_impairment: visualImpairment,
        assistance_needs: assistanceNeeds,
        language,
      };

      const { error } = await supabase
        .from('vip_profile')
        .update({ preferences, mobility_aids: mobilityAids })
        .eq('user_id', user.id);

      if (error) throw error;

      if (language && language !== 'skip') {
        i18n.changeLanguage(language);
      }

      setOrigPrefs({ visualImpairment, mobilityAids, assistanceNeeds, language });
      setPrefsChanged(false);
      Alert.alert(t('profile.alerts.saved_title'), t('profile.alerts.traveler_msg'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('profile.alerts.error_prefs');
      Alert.alert(t('profile.alerts.error_title'), message);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSaveVolunteerProfile = async () => {
    if (!user) return;
    setIsSavingVolunteer(true);
    try {
      const preferences = {
        active: true,
        availability,
        preferred_routes: preferredRoutes,
        languages: volunteerLanguages,
        assistance: volunteerAssistance,
        contact: volunteerContact,
      };

      const { error } = await supabase
        .from('volunteer_profile')
        .update({ preferences })
        .eq('user_id', user.id);

      if (error) throw error;

      setOrigVolunteerPrefs({
        availability,
        preferredRoutes,
        languages: volunteerLanguages,
        assistance: volunteerAssistance,
        contact: volunteerContact,
      });
      setVolunteerChanged(false);
      Alert.alert(t('profile.alerts.saved_title'), t('profile.alerts.volunteer_msg'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('profile.alerts.error_volunteer');
      Alert.alert(t('profile.alerts.error_title'), message);
    } finally {
      setIsSavingVolunteer(false);
    }
  };

  const toggleMultiOption = (
    current: string[],
    setter: (v: string[]) => void,
    key: string,
  ) => {
    if (current.includes(key)) {
      setter(current.filter((k) => k !== key));
    } else {
      setter([...current, key]);
    }
  };

  const handleAddAvailability = () => {
    if (availFormDow === null) {
      Alert.alert(t('profile.availability_form.error_day_title'), t('profile.availability_form.error_day_msg'));
      return;
    }
    if (!availFormStart || !availFormEnd) {
      Alert.alert(t('profile.availability_form.error_time_title'), t('profile.availability_form.error_time_msg'));
      return;
    }
    if (availFormStart >= availFormEnd) {
      Alert.alert(t('profile.availability_form.error_range_title'), t('profile.availability_form.error_range_msg'));
      return;
    }
    setAvailability([...availability, { dow: availFormDow, start: availFormStart, end: availFormEnd }]);
    setAvailFormDow(null);
    setAvailFormStart('08:00');
    setAvailFormEnd('18:00');
    setAvailFormVisible(false);
    setActivePicker(null);
  };

  const handleAddRoute = () => {
    if (!routeFormFrom) {
      Alert.alert(t('profile.route_form.error_dep_title'), t('profile.route_form.error_dep_msg'));
      return;
    }
    if (!routeFormTo) {
      Alert.alert(t('profile.route_form.error_arr_title'), t('profile.route_form.error_arr_msg'));
      return;
    }
    const duplicate = preferredRoutes.some(r => r.from === routeFormFrom && r.to === routeFormTo);
    if (duplicate) {
      Alert.alert(t('profile.route_form.error_dup_title'), t('profile.route_form.error_dup_msg'));
      return;
    }
    setPreferredRoutes([...preferredRoutes, { from: routeFormFrom, to: routeFormTo }]);
    setRouteFormFrom('');
    setRouteFormTo('');
    setRouteFormVisible(false);
    setActivePicker(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('profile.alerts.error_logout');
      Alert.alert(t('profile.alerts.error_title'), message);
    }
  };

  const togglePicker = (id: string) => {
    setActivePicker(prev => (prev === id ? null : id));
  };

  const renderInlineDropdown = (
    pickerId: string,
    options: string[],
    value: string,
    onSelect: (v: string) => void,
    placeholder: string,
  ) => {
    const isOpen = activePicker === pickerId;
    return (
      <View>
        <TouchableOpacity
          style={[styles.dropdownButton, isOpen && { borderColor: tintColor }]}
          onPress={() => togglePicker(pickerId)}
        >
          <Text style={[styles.dropdownButtonText, !value && styles.dropdownPlaceholder]}>
            {value || placeholder}
          </Text>
          <FontAwesome name={isOpen ? 'chevron-up' : 'chevron-down'} size={12} color="#666" />
        </TouchableOpacity>
        {isOpen && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, opt === value && { backgroundColor: `${tintColor}15` }]}
                onPress={() => { onSelect(opt); setActivePicker(null); }}
              >
                <Text style={[styles.dropdownItemText, opt === value && { color: tintColor, fontWeight: '600' }]}>
                  {opt}
                </Text>
                {opt === value && <FontAwesome name="check" size={12} color={tintColor} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* Avatar & User Info */}
        <View style={styles.headerSection}>
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            <FontAwesome name="user" size={40} color="#fff" />
          </View>
          <Text style={styles.userEmail}>{user?.email || t('profile.no_email')}</Text>
          <View
            style={[
              styles.userTypeBadge,
              { backgroundColor: isTraveler ? `${tintColor}20` : '#4CAF5020' },
            ]}
          >
            <FontAwesome
              name={isTraveler ? 'eye-slash' : 'heart'}
              size={14}
              color={isTraveler ? tintColor : '#4CAF50'}
            />
            <Text style={[styles.userTypeText, { color: isTraveler ? tintColor : '#4CAF50' }]}>
              {isTraveler ? t('profile.user_type.traveler') : t('profile.user_type.volunteer')}
            </Text>
          </View>
        </View>

        {/* Profile Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.sections.info')}</Text>
            {!isEditingProfile ? (
              <TouchableOpacity
                onPress={() => setIsEditingProfile(true)}
                accessibilityLabel={t('profile.actions.edit')}
              >
                <FontAwesome name="pencil" size={16} color={tintColor} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsEditingProfile(false);
                  setEmail(user?.email ?? '');
                  setPhone(user?.phone ?? '');
                }}
                accessibilityLabel={t('profile.actions.cancel')}
              >
                <Text style={[styles.cancelText, { color: '#E53935' }]}>{t('profile.actions.cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('profile.fields.email')}</Text>
            {isEditingProfile ? (
              <TextInput
                style={[styles.fieldInput, { color: textColor, borderColor: tintColor }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t('profile.fields.placeholder_email')}
                placeholderTextColor="#999"
                accessibilityLabel={t('profile.fields.email')}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.email || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('profile.fields.phone')}</Text>
            {isEditingProfile ? (
              <TextInput
                style={[styles.fieldInput, { color: textColor, borderColor: tintColor }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t('profile.fields.placeholder_phone')}
                placeholderTextColor="#999"
                accessibilityLabel={t('profile.fields.phone')}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || t('profile.fields.not_set')}</Text>
            )}
          </View>

          {isEditingProfile && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
              accessibilityRole="button"
              accessibilityLabel={t('profile.actions.save_changes')}
            >
              <Text style={styles.saveButtonText}>
                {isSavingProfile ? t('profile.actions.saving') : t('profile.actions.save_changes')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Traveler Preferences */}
        {isTraveler && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.sections.preferences')}</Text>

            <Text style={styles.prefGroupLabel}>{t('onboarding_vision.question')}</Text>
            <View style={styles.optionsList}>
              {VISION_OPTIONS.map((opt) => {
                const selected = visualImpairment === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => setVisualImpairment(opt.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={20} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.prefGroupLabel}>{t('onboarding_mobility.question')}</Text>
            <View style={styles.optionsList}>
              {MOBILITY_OPTIONS.map((opt) => {
                const selected = mobilityAids.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => setMobilityAids([opt.key])}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={20} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                    {selected && (
                      <FontAwesome name="check-circle" size={20} color={tintColor} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.prefGroupLabel}>{t('onboarding_assistance.question')}</Text>
            <Text style={styles.prefGroupHint}>{t('onboarding_assistance.hint')}</Text>
            <View style={styles.optionsList}>
              {ASSISTANCE_OPTIONS.map((opt) => {
                const selected = assistanceNeeds.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => toggleMultiOption(assistanceNeeds, setAssistanceNeeds, opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={18} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                    {selected && (
                      <FontAwesome name="check-circle" size={20} color={tintColor} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.prefGroupLabel}>{t('onboarding_language.question')}</Text>
            <View style={styles.optionsList}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = language === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => setLanguage(opt.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={20} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {prefsChanged && (
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSavePreferences}
                disabled={isSavingPrefs}
                accessibilityRole="button"
                accessibilityLabel={t('profile.actions.save_preferences')}
              >
                <Text style={styles.saveButtonText}>
                  {isSavingPrefs ? t('profile.actions.saving') : t('profile.actions.save_preferences')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Volunteer Profile */}
        {isVolunteer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.sections.volunteer')}</Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{t('profile.volunteer_info.why_title')}</Text>
              <Text style={styles.infoText}>{t('profile.volunteer_info.why_text')}</Text>
            </View>

            {/* Availability Windows */}
            <Text style={styles.prefGroupLabel}>{t('profile.volunteer_info.availability_title')}</Text>

            {availability.length > 0 && (
              <View style={styles.chipList}>
                {availability.map((w, i) => (
                  <View key={i} style={styles.windowChip}>
                    <Text style={styles.windowChipText}>
                      {DAY_LABELS[w.dow]}  {w.start}–{w.end}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAvailability(availability.filter((_, idx) => idx !== i))}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <FontAwesome name="times" size={12} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!availFormVisible ? (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: tintColor }]}
                onPress={() => { setAvailFormVisible(true); setActivePicker(null); }}
              >
                <FontAwesome name="plus" size={14} color={tintColor} />
                <Text style={[styles.addButtonText, { color: tintColor }]}>{t('profile.volunteer_info.add_window')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.formCard}>
                {/* Day selector */}
                <Text style={styles.formLabel}>{t('profile.availability_form.day')}</Text>
                <View style={styles.dayRow}>
                  {DAY_LABELS.map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dayChip,
                        availFormDow === idx && { backgroundColor: tintColor, borderColor: tintColor },
                      ]}
                      onPress={() => setAvailFormDow(idx)}
                    >
                      <Text style={[styles.dayChipText, availFormDow === idx && { color: '#fff' }]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Time range */}
                <View style={styles.timeRow}>
                  <View style={styles.timeField}>
                    <Text style={styles.formLabel}>{t('profile.availability_form.from')}</Text>
                    {renderInlineDropdown(
                      'availStart',
                      TIME_OPTIONS,
                      availFormStart,
                      setAvailFormStart,
                      '08:00',
                    )}
                  </View>
                  <View style={styles.timeField}>
                    <Text style={styles.formLabel}>{t('profile.availability_form.to')}</Text>
                    {renderInlineDropdown(
                      'availEnd',
                      TIME_OPTIONS,
                      availFormEnd,
                      setAvailFormEnd,
                      '18:00',
                    )}
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.formActionBtn, { backgroundColor: tintColor }]}
                    onPress={handleAddAvailability}
                  >
                    <Text style={styles.formActionBtnText}>{t('profile.volunteer_info.add_window')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formCancelBtn}
                    onPress={() => { setAvailFormVisible(false); setActivePicker(null); }}
                  >
                    <Text style={styles.formCancelBtnText}>{t('profile.actions.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Preferred Routes */}
            <Text style={[styles.prefGroupLabel, { marginTop: 20 }]}>{t('profile.volunteer_info.routes_title')}</Text>

            {preferredRoutes.length > 0 && (
              <View style={styles.chipList}>
                {preferredRoutes.map((r, i) => (
                  <View key={i} style={styles.windowChip}>
                    <FontAwesome name="arrow-right" size={10} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.windowChipText}>{r.from} → {r.to}</Text>
                    <TouchableOpacity
                      onPress={() => setPreferredRoutes(preferredRoutes.filter((_, idx) => idx !== i))}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <FontAwesome name="times" size={12} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!routeFormVisible ? (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: tintColor }]}
                onPress={() => { setRouteFormVisible(true); setActivePicker(null); }}
              >
                <FontAwesome name="plus" size={14} color={tintColor} />
                <Text style={[styles.addButtonText, { color: tintColor }]}>{t('profile.volunteer_info.add_route')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>{t('profile.route_form.from')}</Text>
                {renderInlineDropdown(
                  'routeFrom',
                  STATIONS,
                  routeFormFrom,
                  setRouteFormFrom,
                  t('request_trip.placeholders.departure'),
                )}

                <Text style={[styles.formLabel, { marginTop: 12 }]}>{t('profile.route_form.to')}</Text>
                {renderInlineDropdown(
                  'routeTo',
                  STATIONS.filter(s => s !== routeFormFrom),
                  routeFormTo,
                  setRouteFormTo,
                  t('request_trip.placeholders.arrival'),
                )}

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.formActionBtn, { backgroundColor: tintColor }]}
                    onPress={handleAddRoute}
                  >
                    <Text style={styles.formActionBtnText}>{t('profile.volunteer_info.add_route_btn')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formCancelBtn}
                    onPress={() => { setRouteFormVisible(false); setActivePicker(null); }}
                  >
                    <Text style={styles.formCancelBtnText}>{t('profile.actions.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Languages */}
            <Text style={[styles.prefGroupLabel, { marginTop: 20 }]}>{t('profile.volunteer_info.languages_title')}</Text>
            <Text style={styles.prefGroupHint}>{t('profile.volunteer_info.languages_hint')}</Text>
            <View style={styles.optionsList}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = volunteerLanguages.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => toggleMultiOption(volunteerLanguages, setVolunteerLanguages, opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={20} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                    {selected && (
                      <FontAwesome name="check-circle" size={20} color={tintColor} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assistance */}
            <Text style={styles.prefGroupLabel}>{t('profile.volunteer_info.assisting_title')}</Text>
            <Text style={styles.prefGroupHint}>{t('profile.volunteer_info.assisting_hint')}</Text>
            <View style={styles.optionsList}>
              {ASSISTANCE_OPTIONS.map((opt) => {
                const selected = volunteerAssistance.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => toggleMultiOption(volunteerAssistance, setVolunteerAssistance, opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={18} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                    {selected && (
                      <FontAwesome name="check-circle" size={20} color={tintColor} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Preferred Contact */}
            <Text style={styles.prefGroupLabel}>{t('profile.volunteer_info.contact_title')}</Text>
            <View style={styles.optionsList}>
              {CONTACT_OPTIONS.map((opt) => {
                const selected = volunteerContact === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionCard,
                      selected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                    ]}
                    onPress={() => setVolunteerContact(opt.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.label}
                  >
                    <FontAwesome name={opt.icon} size={20} color={selected ? tintColor : '#999'} />
                    <Text style={[styles.optionLabel, selected && { color: tintColor, fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {volunteerChanged && (
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSaveVolunteerProfile}
                disabled={isSavingVolunteer}
                accessibilityRole="button"
                accessibilityLabel={t('profile.actions.save_volunteer')}
              >
                <Text style={styles.saveButtonText}>
                  {isSavingVolunteer ? t('profile.actions.saving') : t('profile.actions.save_volunteer')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('profile.actions.logout')}
        >
          <FontAwesome name="sign-out" size={20} color="#E53935" />
          <Text style={styles.logoutText}>{t('profile.actions.logout')}</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldInput: {
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  prefGroupLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  prefGroupHint: {
    fontSize: 13,
    opacity: 0.5,
    marginBottom: 8,
  },
  optionsList: {
    gap: 8,
    marginBottom: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(47, 149, 220, 0.08)',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5393520',
  },
  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
  // Availability & Route chips (display)
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  windowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  windowChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Inline form card
  formCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    padding: 14,
    marginBottom: 4,
    backgroundColor: 'rgba(128,128,128,0.03)',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  // Day selector
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  dayChip: {
    borderWidth: 1.5,
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Time row
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timeField: {
    flex: 1,
  },
  // Inline dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownPlaceholder: {
    opacity: 0.4,
  },
  dropdownList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    borderRadius: 10,
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.08)',
  },
  dropdownItemText: {
    fontSize: 14,
  },
  // Form action buttons
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  formActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  formActionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  formCancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
});
