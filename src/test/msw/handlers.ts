import { http, HttpResponse } from 'msw';

import { config } from '@/config';

import { albums, comments, photos, posts, todos, users } from './fixtures';

const baseUrl = config.apiUrl;

function meta(request: Request) {
  return {
    timestamp: new Date().toISOString(),
    correlationId:
      request.headers.get('x-correlation-id') ?? 'test-correlation-id',
  };
}

function notFound(request: Request, url: URL) {
  return HttpResponse.json(
    {
      statusCode: 404,
      message: 'The requested resource does not exist upstream.',
      error: 'Not Found',
      path: url.pathname,
      ...meta(request),
    },
    { status: 404 },
  );
}

function idParam(params: { id?: string | readonly string[] }): number {
  return Number(params.id);
}

/**
 * Handlers for the GET endpoints the app calls, matching the proxy's
 * `{ data, meta }` envelope. The app is read-only, so there are no handlers
 * for the contract's write endpoints.
 */
export const handlers = [
  http.get(`${baseUrl}/posts`, ({ request }) => {
    const userId = new URL(request.url).searchParams.get('userId');
    const data = userId
      ? posts.filter((post) => post.userId === Number(userId))
      : posts;
    return HttpResponse.json({ data, meta: meta(request) });
  }),

  http.get(`${baseUrl}/posts/:id`, ({ request, params }) => {
    const post = posts.find((candidate) => candidate.id === idParam(params));
    const url = new URL(request.url);
    if (!post) {
      return notFound(request, url);
    }
    return HttpResponse.json({ data: post, meta: meta(request) });
  }),

  http.get(`${baseUrl}/posts/:id/comments`, ({ request, params }) => {
    const postId = idParam(params);
    const data = comments.filter((comment) => comment.postId === postId);
    return HttpResponse.json({ data, meta: meta(request) });
  }),

  http.get(`${baseUrl}/users`, ({ request }) =>
    HttpResponse.json({ data: users, meta: meta(request) }),
  ),

  http.get(`${baseUrl}/users/:id`, ({ request, params }) => {
    const user = users.find((candidate) => candidate.id === idParam(params));
    const url = new URL(request.url);
    if (!user) {
      return notFound(request, url);
    }
    return HttpResponse.json({ data: user, meta: meta(request) });
  }),

  http.get(`${baseUrl}/users/:id/posts`, ({ request, params }) => {
    const userId = idParam(params);
    return HttpResponse.json({
      data: posts.filter((post) => post.userId === userId),
      meta: meta(request),
    });
  }),

  http.get(`${baseUrl}/users/:id/albums`, ({ request, params }) => {
    const userId = idParam(params);
    return HttpResponse.json({
      data: albums.filter((album) => album.userId === userId),
      meta: meta(request),
    });
  }),

  http.get(`${baseUrl}/users/:id/todos`, ({ request, params }) => {
    const userId = idParam(params);
    return HttpResponse.json({
      data: todos.filter((todo) => todo.userId === userId),
      meta: meta(request),
    });
  }),

  http.get(`${baseUrl}/albums`, ({ request }) =>
    HttpResponse.json({ data: albums, meta: meta(request) }),
  ),

  http.get(`${baseUrl}/albums/:id/photos`, ({ request, params }) => {
    const albumId = idParam(params);
    return HttpResponse.json({
      data: photos.filter((photo) => photo.albumId === albumId),
      meta: meta(request),
    });
  }),
];
