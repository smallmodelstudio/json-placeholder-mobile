import type { ApiError } from '@/api';

// Every query in the app fails with an ApiError — `unwrap` never throws
// anything else — so every `useQuery().error` is typed as one instead of the
// default `Error`.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}
