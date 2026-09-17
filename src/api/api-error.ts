import { z } from 'zod';

const ErrorBodySchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
  path: z.string(),
  timestamp: z.string(),
  correlationId: z.string(),
});

export type ErrorBody = z.infer<typeof ErrorBodySchema>;

/**
 * A failed API call, normalised from the proxy's error envelope
 * (`{ statusCode, message, error, path, timestamp, correlationId }`). A
 * response that doesn't match that shape — a network failure, an upstream
 * outage returning HTML — becomes an ApiError with `status` 0 instead.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly correlationId: string | undefined;
  readonly body: ErrorBody | undefined;

  constructor(
    message: string,
    status: number,
    options?: { correlationId?: string; body?: ErrorBody },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.correlationId = options?.correlationId;
    this.body = options?.body;
  }

  /** Whether the query client should retry the request that produced this error. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }

  static fromErrorResponse(response: Response, error: unknown): ApiError {
    const result = ErrorBodySchema.safeParse(error);
    if (!result.success) {
      return new ApiError(
        `Request failed with status ${String(response.status)}`,
        response.status,
      );
    }

    const body = result.data;
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    return new ApiError(message, body.statusCode, {
      correlationId: body.correlationId,
      body,
    });
  }

  static fromNetworkError(cause: unknown): ApiError {
    const message =
      cause instanceof Error ? cause.message : 'Network request failed';
    return new ApiError(message, 0);
  }
}
