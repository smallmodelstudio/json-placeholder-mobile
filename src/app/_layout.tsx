import { Stack } from 'expo-router';

// Importing config here validates the environment as the app starts, so a bad
// EXPO_PUBLIC_API_URL fails immediately instead of on the first request.
import '@/config';

export default function RootLayout() {
  return <Stack screenOptions={{ title: 'JSON Placeholder' }} />;
}
