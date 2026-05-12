import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTranslation } from 'react-i18next';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { data, setLanguage, submitOnboarding, isSubmitting } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const selected = data.language;

  const OPTIONS = [
    { key: 'nl', label: t('onboarding_language.options.dutch'), icon: 'comment' as const },
    { key: 'en', label: t('onboarding_language.options.english'), icon: 'comment' as const },
    { key: 'fr', label: t('onboarding_language.options.french'), icon: 'comment' as const },
    { key: 'pl', label: t('onboarding_language.options.polish'), icon: 'comment' as const },
    { key: 'tr', label: t('onboarding_language.options.turkish'), icon: 'comment' as const },
    { key: 'skip', label: t('onboarding_language.options.skip'), icon: 'forward' as const },
  ];

  const handleLanguageSelect = (key: string) => {
    setLanguage(key);
    if (key !== 'skip') {
      i18n.changeLanguage(key);
    }
  };

  const handleComplete = async () => {
    if (!selected) return;
    setError(null);
    try {
      await submitOnboarding();
      // Navigation is handled automatically by the root layout's auth redirect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('onboarding_language.error');
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%', backgroundColor: tintColor }]} />
        </View>
        <Text style={styles.progressText}>{t('onboarding_language.progress')}</Text>
      </View>

      {/* Question */}
      <Text style={styles.question}>{t('onboarding_language.question')}</Text>

      {/* Options */}
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionCard,
                isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
              ]}
              onPress={() => handleLanguageSelect(option.key)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
            >
              <FontAwesome
                name={option.icon}
                size={24}
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
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Complete button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: selected && !isSubmitting ? tintColor : '#ccc' },
        ]}
        onPress={handleComplete}
        disabled={!selected || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding_language.completeButton')}
      >
        {isSubmitting ? (
          <Text style={styles.buttonText}>{t('onboarding_language.savingButton')}</Text>
        ) : (
          <>
            <Text style={styles.buttonText}>{t('onboarding_language.completeButton')}</Text>
            <FontAwesome name="check" size={18} color="#fff" />
          </>
        )}
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
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
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
