import { useEffect } from 'react';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';

// Importing config here validates the environment as the app starts, so a bad
// EXPO_PUBLIC_API_URL fails immediately instead of on the first request.
import '@/config';
import { queryClient } from '@/api';
import {
  darkNavigationTheme,
  darkTheme,
  lightNavigationTheme,
  lightTheme,
  ThemeModeProvider,
  useThemeMode,
} from '@/theme';

void SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === 'dark';

  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <NavigationThemeProvider
        value={isDark ? darkNavigationTheme : lightNavigationTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </NavigationThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}
