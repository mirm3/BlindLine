import { useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;

  const [userType, setUserType] = useState<'traveler' | 'volunteer' | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, isLoading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleRegister = async () => {
    if (!userType) {
      setError(t('register.error_user_type'));
      return;
    }
    if (!email || !password) {
      setError(t('register.error_required'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.error_password_match'));
      return;
    }
    if (password.length < 6) {
      setError(t('register.error_password_length'));
      return;
    }
    setError(null);
    try {
      await signUp({ email, password, phone, userType });
      // Redirect is handled by AuthContext and RootLayoutNav
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('register.error_failed');
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                style={styles.backButton}
                accessibilityLabel={t('register.back_to_login')}
              >
                <FontAwesome name="arrow-left" size={20} color={textColor} />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: `${tintColor}15` }]}>
              <FontAwesome
                name="train"
                size={40}
                color={tintColor}
                accessibilityLabel="BlindLine train logo"
              />
            </View>
            <Text style={styles.formTitle}>{t('register.title')}</Text>
            <Text style={styles.formSubtitle}>{t('register.subtitle')}</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <Text style={styles.inputLabel}>{t('register.user_type_label')}</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'traveler' && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                ]}
                onPress={() => setUserType('traveler')}
                accessibilityRole="button"
                accessibilityState={{ selected: userType === 'traveler' }}
                accessibilityLabel={t('register.traveler_accessibility')}
              >
                <FontAwesome
                  name="eye-slash"
                  size={24}
                  color={userType === 'traveler' ? tintColor : '#999'}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'traveler' && { color: tintColor, fontWeight: '600' },
                  ]}
                >
                  {t('profile.user_type.traveler')}
                </Text>
                <Text style={styles.userTypeSubtext}>{t('register.traveler_subtext')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'volunteer' && { borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' },
                ]}
                onPress={() => setUserType('volunteer')}
                accessibilityRole="button"
                accessibilityState={{ selected: userType === 'volunteer' }}
                accessibilityLabel={t('register.volunteer_accessibility')}
              >
                <FontAwesome
                  name="heart"
                  size={24}
                  color={userType === 'volunteer' ? '#4CAF50' : '#999'}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'volunteer' && { color: '#4CAF50', fontWeight: '600' },
                  ]}
                >
                  {t('profile.user_type.volunteer')}
                </Text>
                <Text style={styles.userTypeSubtext}>{t('register.volunteer_subtext')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Registration Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('profile.fields.email')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="envelope" size={16} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  accessibilityLabel={t('profile.fields.email')}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('profile.fields.phone')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="phone" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('profile.fields.placeholder_phone')}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={phone}
                  onChangeText={setPhone}
                  accessibilityLabel={t('profile.fields.phone')}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('login.passwordLabel')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="lock" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('login.passwordPlaceholder')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="password"
                  textContentType="newPassword"
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel={t('login.passwordLabel')}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={18}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('register.confirm_password')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="lock" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('register.confirm_password_placeholder')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="password"
                  textContentType="newPassword"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  accessibilityLabel={t('register.confirm_password')}
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {t('register.terms_prefix')}{' '}
                <Text style={[styles.termsLink, { color: tintColor }]}>{t('register.terms_link')}</Text>
                {' '}{t('register.terms_and')}{' '}
                <Text style={[styles.termsLink, { color: tintColor }]}>{t('register.privacy_link')}</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                { backgroundColor: userType === 'volunteer' ? '#4CAF50' : tintColor },
              ]}
              onPress={handleRegister}
              disabled={isLoading || !userType}
              accessibilityRole="button"
              accessibilityLabel={t('register.button')}
            >
              {isLoading ? (
                <Text style={styles.registerButtonText}>{t('register.button_loading')}</Text>
              ) : (
                <Text style={styles.registerButtonText}>{t('register.button')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>{t('login.noAccount')} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity accessibilityLabel={t('login.signInButton')}>
                <Text style={[styles.loginLink, { color: tintColor }]}>{t('login.signInButton')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
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
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  userTypeSection: {
    marginBottom: 20,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  userTypeSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  formSection: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    marginBottom: 8,
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
  },
  registerButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 16,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
