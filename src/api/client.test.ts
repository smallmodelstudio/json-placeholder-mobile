import { http, HttpResponse } from 'msw';

import { config } from '@/config';
import { server } from '@/test/msw/server';

import { ApiError } from './api-error';
import { apiClient, unwrap } from './client';

describe('unwrap', () => {
  it("returns the envelope's data on success", async () => {
    const posts = await unwrap(
      apiClient.GET('/posts', { params: { query: {} } }),
    );

    expect(posts.length).toBeGreaterThan(0);
  });

  it('sends a generated x-correlation-id header', async () => {
    let receivedHeader: string | null = null;
    server.use(
      http.get(`${config.apiUrl}/posts`, ({ request }) => {
        receivedHeader = request.headers.get('x-correlation-id');
        return HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        });
      }),
    );

    await unwrap(apiClient.GET('/posts', { params: { query: {} } }));

    expect(receivedHeader).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('throws an ApiError for a typed error response', async () => {
    const call = unwrap(
      apiClient.GET('/posts/{id}', { params: { path: { id: 999999 } } }),
    );

    await expect(call).rejects.toBeInstanceOf(ApiError);
    await expect(call).rejects.toMatchObject({ status: 404 });

    const error = (await call.catch((thrown: unknown) => thrown)) as ApiError;
    expect(error.correlationId).toBeTruthy();
  });

  it('throws a status-0 ApiError for a network failure', async () => {
    server.use(http.get(`${config.apiUrl}/posts`, () => HttpResponse.error()));

    const call = unwrap(apiClient.GET('/posts', { params: { query: {} } }));

    await expect(call).rejects.toBeInstanceOf(ApiError);
    await expect(call).rejects.toMatchObject({ status: 0 });
  });
});
