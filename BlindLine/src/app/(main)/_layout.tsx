import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function MainLayout() {
  const { isAuthenticated, isOnboardingCompleted } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/landing" />;
  }

  if (!isOnboardingCompleted) {
    return <Redirect href="/assistance" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="match-traveler" options={{ headerShown: false }} />
    </Stack>
  );
}
