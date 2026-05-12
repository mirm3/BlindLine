import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="vision" />
        <Stack.Screen name="mobility" />
        <Stack.Screen name="assistance" />
        <Stack.Screen name="language" />
        <Stack.Screen name="volunteer" />
      </Stack>
    </OnboardingProvider>
  );
}
