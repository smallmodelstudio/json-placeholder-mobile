import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { lightTheme, ThemeModeProvider } from '@/theme';

// Mirrors the provider tree in the root layout: screens read the theme mode
// from context, Paper components need a PaperProvider ancestor for theming
// and portals (dialogs, menus, snackbars), and query hooks need a
// QueryClientProvider. Each render gets its own QueryClient with retries off,
// so a test asserting an error state doesn't sit through the retry backoff.
export function renderWithProviders(ui: ReactElement): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
      </ThemeModeProvider>
    </QueryClientProvider>,
  );
}
