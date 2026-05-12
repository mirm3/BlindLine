import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTranslation } from 'react-i18next';

export default function AssistanceScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const router = useRouter();
  const { data, setAssistanceNeeds } = useOnboarding();

  const selected = data.assistanceNeeds;

  const OPTIONS = [
    { key: 'finding_platform', label: t('onboarding_assistance.options.finding_platform'), icon: 'map-signs' as const },
    { key: 'boarding_train', label: t('onboarding_assistance.options.boarding_train'), icon: 'train' as const },
    { key: 'finding_seat', label: t('onboarding_assistance.options.finding_seat'), icon: 'ticket' as const },
    { key: 'guidance_station', label: t('onboarding_assistance.options.guidance_station'), icon: 'building' as const },
    { key: 'announcements', label: t('onboarding_assistance.options.announcements'), icon: 'bullhorn' as const },
  ];

  const toggleOption = (key: string) => {
    if (selected.includes(key)) {
      setAssistanceNeeds(selected.filter((item) => item !== key));
    } else {
      setAssistanceNeeds([...selected, key]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '75%', backgroundColor: tintColor }]} />
        </View>
        <Text style={styles.progressText}>{t('onboarding_assistance.progress')}</Text>
      </View>

      {/* Question */}
      <Text style={styles.question}>{t('onboarding_assistance.question')}</Text>
      <Text style={styles.hint}>{t('onboarding_assistance.hint')}</Text>

      {/* Options */}
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected.includes(option.key);
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionCard,
                isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
              ]}
              onPress={() => toggleOption(option.key)}
              accessibilityRole="checkbox"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: isSelected }}
            >
              <FontAwesome
                name={option.icon}
                size={22}
                color={isSelected ? tintColor : '#999'}
              />
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: tintColor, fontWeight: '600' },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <FontAwesome
                  name="check-circle"
                  size={22}
                  color={tintColor}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={() => router.push('/(onboarding)/language')}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding_assistance.nextButton')}
      >
        <Text style={styles.buttonText}>{t('onboarding_assistance.nextButton')}</Text>
        <FontAwesome name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.5,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    opacity: 0.5,
    marginBottom: 24,
  },
  options: {
    flex: 1,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 12,
    padding: 18,
    gap: 16,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  button: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
