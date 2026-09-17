import { fireEvent, screen } from '@testing-library/react-native';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { PostDetailScreen } from './post-detail-screen';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: '1' }),
}));

function errorBody(path: string) {
  return {
    statusCode: 500,
    message: 'Something upstream broke',
    error: 'Internal Server Error',
    path,
    timestamp: new Date().toISOString(),
    correlationId: 'test-correlation-id',
  };
}

describe('PostDetailScreen', () => {
  it('shows a skeleton while the post is loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts/:id`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: {} });
      }),
    );

    await renderWithProviders(<PostDetailScreen />);

    expect(screen.getByTestId('post-detail-skeleton')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts/:id`, () =>
        HttpResponse.json(errorBody('/posts/1'), { status: 500 }),
      ),
    );

    await renderWithProviders(<PostDetailScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('first post title')).toBeOnTheScreen();
  });

  it('shows the post with its author and comments', async () => {
    await renderWithProviders(<PostDetailScreen />);

    expect(await screen.findByText('first post title')).toBeOnTheScreen();
    expect(screen.getByText('By Leanne Graham')).toBeOnTheScreen();
    expect(screen.getByText('first post body')).toBeOnTheScreen();
    expect(screen.getByText('first comment')).toBeOnTheScreen();
    expect(screen.getByText('second comment')).toBeOnTheScreen();
  });

  it('shows an unknown-author fallback when the author fails to load', async () => {
    server.use(
      http.get(`${config.apiUrl}/users/:id`, () =>
        HttpResponse.json(errorBody('/users/1'), { status: 500 }),
      ),
    );

    await renderWithProviders(<PostDetailScreen />);

    expect(await screen.findByText('Unknown author')).toBeOnTheScreen();
  });

  it('shows an empty state when a post has no comments', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts/:id/comments`, () =>
        HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        }),
      ),
    );

    await renderWithProviders(<PostDetailScreen />);

    expect(await screen.findByText('No comments yet')).toBeOnTheScreen();
  });
});
