import { randomUUID } from 'expo-crypto';
import createClient, { type Middleware } from 'openapi-fetch';

import { config } from '@/config';

import { ApiError } from './api-error';
import type { paths } from './schema';

const correlationIdMiddleware: Middleware = {
  onRequest({ request }) {
    request.headers.set('x-correlation-id', randomUUID());
    return request;
  },
};

/** Typed HTTP client for the proxy API. Screens don't call this directly — see `unwrap`. */
export const apiClient = createClient<paths>({ baseUrl: config.apiUrl });
apiClient.use(correlationIdMiddleware);

/**
 * Unwraps an `apiClient` call: returns the proxy's `{ data, meta }` envelope's
 * `data`, or throws an `ApiError`. Covers both the typed error responses the
 * contract declares and a request that never got a response at all (offline,
 * DNS failure, …), which openapi-fetch surfaces as a rejected promise instead
 * of `{ error }`.
 */
export async function unwrap<T, E>(
  call: Promise<{ data?: { data: T }; error?: E; response: Response }>,
): Promise<T> {
  const { data, error, response } = await call.catch(
    (cause: unknown): never => {
      throw ApiError.fromNetworkError(cause);
    },
  );

  if (error !== undefined) {
    throw ApiError.fromErrorResponse(response, error);
  }
  if (data === undefined) {
    throw ApiError.fromNetworkError(new Error('Response had no body'));
  }
  return data.data;
}
