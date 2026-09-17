import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { ApiError } from './api-error';

const MAX_RETRIES = 3;

function shouldRetry(failureCount: number, error: unknown): boolean {
  return (
    failureCount < MAX_RETRIES && error instanceof ApiError && error.isRetryable
  );
}

/**
 * Per the API contract: retry a 429 (rate limited), a 5xx (upstream/proxy
 * fault) or a network failure with backoff, since those can succeed on a
 * later attempt. Never retry another 4xx — the request itself was wrong, so
 * the response won't change.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
});

// TanStack Query's focusManager only listens for browser events by default.
// On native, wire it to AppState so "refetch on focus" means "refetch when
// the app is foregrounded"; the web target keeps the default window listener.
function onAppStateChange(status: AppStateStatus): void {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

AppState.addEventListener('change', onAppStateChange);
