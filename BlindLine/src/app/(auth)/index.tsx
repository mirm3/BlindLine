import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function IntroScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: `${tintColor}15` }]}>
          <FontAwesome
            name="train"
            size={70}
            color={tintColor}
            accessibilityLabel="BlindLine train logo"
          />
        </View>

        {/* App Name & Tagline */}
        <Text style={styles.welcomeText}>{t('intro.welcome')}</Text>
        <Text style={styles.appName}>{t('landing.appName')}</Text>
        <Text style={[styles.tagline, { color: tintColor }]}>
          {t('landing.tagline')}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {t('intro.description')}
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/(auth)/landing')}
          accessibilityRole="button"
          accessibilityLabel={t('intro.continue')}
        >
          <Text style={styles.continueButtonText}>{t('intro.continue')}</Text>
          <FontAwesome name="arrow-right" size={18} color="#fff" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
    opacity: 0.7,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  continueButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
