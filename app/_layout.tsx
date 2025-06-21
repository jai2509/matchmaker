import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { MatchProvider } from '@/contexts/MatchContext';
import { AIProvider } from '@/contexts/AIContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AIProvider>
        <MatchProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </MatchProvider>
      </AIProvider>
    </AuthProvider>
  );
}