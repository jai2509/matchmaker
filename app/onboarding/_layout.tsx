import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="personality" />
      <Stack.Screen name="values" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}