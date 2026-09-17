import { type Theme as NavigationTheme } from 'expo-router';
import {
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  type MD3Theme,
} from 'react-native-paper';

// Applied uniformly first, then overridden per-variant below so headings and
// emphasised text stand out from body copy.
const baseFonts = configureFonts({
  config: { fontFamily: 'Inter_400Regular' },
});

const boldVariants = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'titleLarge',
] as const;

const semiBoldVariants = ['titleMedium', 'titleSmall', 'labelLarge'] as const;

const fonts = { ...baseFonts };
for (const variant of boldVariants) {
  fonts[variant] = { ...baseFonts[variant], fontFamily: 'Inter_700Bold' };
}
for (const variant of semiBoldVariants) {
  fonts[variant] = { ...baseFonts[variant], fontFamily: 'Inter_600SemiBold' };
}

export const lightTheme: MD3Theme = { ...MD3LightTheme, fonts };
export const darkTheme: MD3Theme = { ...MD3DarkTheme, fonts };

// expo-router vendors its own React Navigation fork and doesn't accept
// @react-navigation/native's Theme type, so the navigation theme is built by
// hand from the Paper theme instead of using Paper's adaptNavigationTheme.
function buildNavigationTheme(
  materialTheme: MD3Theme,
  dark: boolean,
): NavigationTheme {
  return {
    dark,
    colors: {
      primary: materialTheme.colors.primary,
      background: materialTheme.colors.background,
      card: materialTheme.colors.elevation.level2,
      text: materialTheme.colors.onSurface,
      border: materialTheme.colors.outline,
      notification: materialTheme.colors.error,
    },
    fonts: {
      regular: {
        fontFamily: materialTheme.fonts.bodyMedium.fontFamily,
        fontWeight: materialTheme.fonts.bodyMedium.fontWeight ?? 'normal',
      },
      medium: {
        fontFamily: materialTheme.fonts.titleMedium.fontFamily,
        fontWeight: materialTheme.fonts.titleMedium.fontWeight ?? 'normal',
      },
      bold: {
        fontFamily: materialTheme.fonts.headlineSmall.fontFamily,
        fontWeight: materialTheme.fonts.headlineSmall.fontWeight ?? 'bold',
      },
      heavy: {
        fontFamily: materialTheme.fonts.headlineLarge.fontFamily,
        fontWeight: materialTheme.fonts.headlineLarge.fontWeight ?? 'bold',
      },
    },
  };
}

export const lightNavigationTheme: NavigationTheme = buildNavigationTheme(
  lightTheme,
  false,
);
export const darkNavigationTheme: NavigationTheme = buildNavigationTheme(
  darkTheme,
  true,
);

export type { NavigationTheme };
