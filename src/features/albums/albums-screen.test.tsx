import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { AlbumsScreen } from './albums-screen';

function errorBody() {
  return {
    statusCode: 500,
    message: 'Something upstream broke',
    error: 'Internal Server Error',
    path: '/albums',
    timestamp: new Date().toISOString(),
    correlationId: 'test-correlation-id',
  };
}

describe('AlbumsScreen', () => {
  it('shows a skeleton while loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: [] });
      }),
    );

    await renderWithProviders(<AlbumsScreen />);

    expect(screen.getByTestId('albums-skeleton')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no albums', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums`, () =>
        HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        }),
      ),
    );

    await renderWithProviders(<AlbumsScreen />);

    expect(await screen.findByText('No albums yet')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums`, () =>
        HttpResponse.json(errorBody(), { status: 500 }),
      ),
    );

    await renderWithProviders(<AlbumsScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Ref: test-correlation-id')).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('first album')).toBeOnTheScreen();
  });

  it('shows albums and navigates to the photo grid on press', async () => {
    const pushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});

    await renderWithProviders(<AlbumsScreen />);

    expect(await screen.findByText('first album')).toBeOnTheScreen();
    expect(screen.getByText('second album')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('first album'));

    expect(pushSpy).toHaveBeenCalledWith({
      pathname: '/album/[id]',
      params: { id: '1' },
    });
  });
});
