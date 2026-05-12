import { useState } from 'react';
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

export default function LoginScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('login.errorFillFields'));
      return;
    }
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      // Handle specific Supabase error messages
      const errorMessage = err?.message || '';

      if (errorMessage.includes('Invalid login credentials')) {
        setError(t('login.errorInvalidCredentials'));
      } else if (errorMessage.includes('Email not confirmed')) {
        setError(errorMessage); // Or a specific translation
      } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('no user')) {
        setError(t('login.errorUserNotFound'));
      } else {
        setError(t('login.errorLoginFailed'));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: `${tintColor}15` }]}>
              <FontAwesome
                name="train"
                size={50}
                color={tintColor}
                accessibilityLabel="BlindLine train logo"
              />
            </View>
            <Text style={styles.appName}>{t('landing.appName')}</Text>
            <Text style={styles.tagline}>{t('landing.tagline')}</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>{t('login.welcome')}</Text>
            <Text style={styles.formSubtitle}>{t('login.signInContinue')}</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('login.emailLabel')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="envelope" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  accessibilityLabel="Email input field"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('login.passwordLabel')}</Text>
              <View style={[styles.inputWrapper, { borderColor: tintColor }]}>
                <FontAwesome name="lock" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder={t('login.passwordPlaceholder')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Password input field"
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

            {/* Error Message */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              accessibilityLabel="Forgot password"
            >
              <Text style={[styles.forgotPasswordText, { color: tintColor }]}>
                {t('login.forgotPassword')}
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: tintColor }]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>{t('login.signingInButton')}</Text>
              ) : (
                <Text style={styles.loginButtonText}>{t('login.signInButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>{t('login.noAccount')}</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity accessibilityLabel="Create a new account">
                <Text style={[styles.registerLink, { color: tintColor }]}>{t('login.signUpLink')}</Text>
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
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    opacity: 0.6,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    opacity: 0.7,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
