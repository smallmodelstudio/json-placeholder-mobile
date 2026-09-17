import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { PostsScreen } from './posts-screen';

function errorBody() {
  return {
    statusCode: 500,
    message: 'Something upstream broke',
    error: 'Internal Server Error',
    path: '/posts',
    timestamp: new Date().toISOString(),
    correlationId: 'test-correlation-id',
  };
}

describe('PostsScreen', () => {
  it('shows a skeleton while loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: [] });
      }),
    );

    await renderWithProviders(<PostsScreen />);

    expect(screen.getByTestId('posts-skeleton')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no posts', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts`, () =>
        HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        }),
      ),
    );

    await renderWithProviders(<PostsScreen />);

    expect(await screen.findByText('No posts yet')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/posts`, () =>
        HttpResponse.json(errorBody(), { status: 500 }),
      ),
    );

    await renderWithProviders(<PostsScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Ref: test-correlation-id')).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('first post title')).toBeOnTheScreen();
  });

  it('shows posts with their author and navigates to the detail screen on press', async () => {
    const pushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});

    await renderWithProviders(<PostsScreen />);

    expect(await screen.findByText('first post title')).toBeOnTheScreen();
    // Leanne Graham wrote two of the fixture posts, Ervin Howell one.
    expect(screen.getAllByText('By Leanne Graham')).toHaveLength(2);
    expect(screen.getByText('By Ervin Howell')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('first post title'));

    expect(pushSpy).toHaveBeenCalledWith({
      pathname: '/post/[id]',
      params: { id: '1' },
    });
  });
});
