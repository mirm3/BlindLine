import 'react-native-url-polyfill/auto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../core/i18n';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start with the auth flow
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </I18nextProvider>
  );
}

function RootLayoutNav() {
  const { t, i18n: i18nInstance } = useTranslation();
  const colorScheme = useColorScheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Sync i18n language with user preference
  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== i18nInstance.language) {
      i18nInstance.changeLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in → go to intro
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but still in auth screens → check onboarding
      if (!user?.onboardingCompleted) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && inOnboardingGroup) {
      // In onboarding screens → redirect out if already completed
      if (user?.onboardingCompleted) {
        if (user?.userType === 'volunteer') {
          router.replace('/(tabs)/profile');
        } else {
          router.replace('/(tabs)');
        }
      }
    } else if (isAuthenticated && !inOnboardingGroup && !inAuthGroup) {
      // Authenticated, not in auth or onboarding → check if onboarding is needed
      if (!user?.onboardingCompleted) {
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [isAuthenticated, isLoading, segments, user?.onboardingCompleted, user?.userType]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="request-trip"
          options={{
            title: t('request_trip.header'),
            headerShown: true,
            headerBackTitle: t('common.return'),
          }}
        />
        <Stack.Screen
          name="traveler-location"
          options={{
            title: t('location_sharing.screen_title'),
            headerShown: true,
            headerBackTitle: t('common.return'),
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
