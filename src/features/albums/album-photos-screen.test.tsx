import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { AlbumPhotosScreen } from './album-photos-screen';

jest.mock('expo-router', () => ({
  ...jest.requireActual<typeof import('expo-router')>('expo-router'),
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

describe('AlbumPhotosScreen', () => {
  it('shows a skeleton while photos are loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums/:id/photos`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: [] });
      }),
    );

    await renderWithProviders(<AlbumPhotosScreen />);

    expect(screen.getByTestId('album-photos-skeleton')).toBeOnTheScreen();
  });

  it('shows an empty state when the album has no photos', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums/:id/photos`, () =>
        HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        }),
      ),
    );

    await renderWithProviders(<AlbumPhotosScreen />);

    expect(await screen.findByText('No photos yet')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums/:id/photos`, () =>
        HttpResponse.json(errorBody('/albums/1/photos'), { status: 500 }),
      ),
    );

    await renderWithProviders(<AlbumPhotosScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByTestId('photo-tile-1')).toBeOnTheScreen();
  });

  it('shows the photo grid and navigates to the viewer on press', async () => {
    const pushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});

    await renderWithProviders(<AlbumPhotosScreen />);

    expect(await screen.findByTestId('photo-tile-1')).toBeOnTheScreen();
    expect(screen.getByTestId('photo-tile-2')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('photo-tile-1'));

    expect(pushSpy).toHaveBeenCalledWith({
      pathname: '/album/[id]/[photoId]',
      params: { id: '1', photoId: '1' },
    });
  });
});
