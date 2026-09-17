import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { lightTheme, ThemeModeProvider } from '@/theme';

// Mirrors the provider tree in the root layout: screens read the theme mode
// from context, and Paper components need a PaperProvider ancestor for
// theming and portals (dialogs, menus, snackbars). Later phases will extend
// this helper with QueryClient and MSW providers.
export function renderWithProviders(ui: ReactElement): Promise<RenderResult> {
  return render(
    <ThemeModeProvider>
      <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
    </ThemeModeProvider>,
  );
}
