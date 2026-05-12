import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const router = useRouter();
  const { user } = useAuth();

  const handleNext = () => {
    if (user?.userType === 'volunteer') {
      router.push('/(onboarding)/volunteer');
    } else {
      router.push('/(onboarding)/vision');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${tintColor}15` }]}>
          <FontAwesome
            name="hand-peace-o"
            size={60}
            color={tintColor}
            accessibilityLabel="Welcome icon"
          />
        </View>

        <Text style={styles.title}>{t('welcome.title')}</Text>

        <Text style={styles.description}>{t('welcome.description')}</Text>

        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={handleNext}
        accessibilityRole="button"
        accessibilityLabel={t('welcome.button')}
      >
        <Text style={styles.buttonText}>{t('welcome.button')}</Text>
        <FontAwesome name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
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
