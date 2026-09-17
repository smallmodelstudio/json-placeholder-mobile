import { ApiError } from './api-error';

describe('ApiError', () => {
  describe('fromErrorResponse', () => {
    it('parses a well-formed error body', () => {
      const error = ApiError.fromErrorResponse(
        new Response(null, { status: 404 }),
        {
          statusCode: 404,
          message: 'Post 999 not found',
          error: 'Not Found',
          path: '/posts/999',
          timestamp: '2026-01-01T00:00:00.000Z',
          correlationId: 'abc-123',
        },
      );

      expect(error.message).toBe('Post 999 not found');
      expect(error.status).toBe(404);
      expect(error.correlationId).toBe('abc-123');
      expect(error.body?.error).toBe('Not Found');
    });

    it('joins an array message into one string', () => {
      const error = ApiError.fromErrorResponse(
        new Response(null, { status: 400 }),
        {
          statusCode: 400,
          message: [
            'userId must be a positive integer',
            'userId must not be empty',
          ],
          error: 'Bad Request',
          path: '/posts',
          timestamp: '2026-01-01T00:00:00.000Z',
          correlationId: 'abc-123',
        },
      );

      expect(error.message).toBe(
        'userId must be a positive integer, userId must not be empty',
      );
    });

    it('falls back to the response status for an unrecognised body', () => {
      const error = ApiError.fromErrorResponse(
        new Response(null, { status: 502 }),
        '<html>Bad gateway</html>',
      );

      expect(error.status).toBe(502);
      expect(error.message).toBe('Request failed with status 502');
      expect(error.correlationId).toBeUndefined();
      expect(error.body).toBeUndefined();
    });
  });

  describe('fromNetworkError', () => {
    it('uses an Error cause message', () => {
      const error = ApiError.fromNetworkError(new Error('Failed to fetch'));

      expect(error.status).toBe(0);
      expect(error.message).toBe('Failed to fetch');
    });

    it('falls back to a generic message for a non-Error cause', () => {
      const error = ApiError.fromNetworkError('boom');

      expect(error.status).toBe(0);
      expect(error.message).toBe('Network request failed');
    });
  });

  describe('isRetryable', () => {
    it.each([
      [0, true],
      [429, true],
      [500, true],
      [503, true],
      [400, false],
      [404, false],
    ])('status %i is retryable: %s', (status, expected) => {
      expect(new ApiError('message', status).isRetryable).toBe(expected);
    });
  });
});
