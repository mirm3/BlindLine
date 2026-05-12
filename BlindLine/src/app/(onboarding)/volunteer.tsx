import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function VolunteerOnboardingScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const router = useRouter();
  const { setOnboardingCompleted } = useAuth();

  const handleComplete = () => {
    setOnboardingCompleted();
    router.replace('/(tabs)/profile');
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#4CAF5015' }]}>
          <FontAwesome
            name="heart"
            size={60}
            color="#4CAF50"
            accessibilityLabel="Volunteer icon"
          />
        </View>

        <Text style={styles.title}>{t('onboarding_volunteer.title')}</Text>

        <Text style={styles.description}>{t('onboarding_volunteer.description')}</Text>

        <Text style={styles.subtitle}>{t('onboarding_volunteer.subtitle')}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleComplete}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding_volunteer.button')}
        >
          <Text style={styles.buttonText}>{t('onboarding_volunteer.button')}</Text>
          <FontAwesome name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding_volunteer.skip')}
        >
          <Text style={styles.skipButtonText}>{t('onboarding_volunteer.skip')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 22,
  },
  footer: {
    gap: 12,
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
  skipButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    opacity: 0.6,
    fontWeight: '500',
  },
});
