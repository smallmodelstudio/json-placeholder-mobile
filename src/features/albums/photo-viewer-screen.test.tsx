import { screen } from '@testing-library/react-native';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { PhotoViewerScreen } from './photo-viewer-screen';

jest.mock('expo-router', () => ({
  ...jest.requireActual<typeof import('expo-router')>('expo-router'),
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: '1', photoId: '2' }),
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

describe('PhotoViewerScreen', () => {
  it('shows a skeleton while photos are loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums/:id/photos`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: [] });
      }),
    );

    await renderWithProviders(<PhotoViewerScreen />);

    expect(screen.getByTestId('photo-viewer-skeleton')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/albums/:id/photos`, () =>
        HttpResponse.json(errorBody('/albums/1/photos'), { status: 500 }),
      ),
    );

    await renderWithProviders(<PhotoViewerScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();

    server.resetHandlers();

    await screen.findByRole('button', { name: 'Retry' });
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

    await renderWithProviders(<PhotoViewerScreen />);

    expect(await screen.findByText('No photos')).toBeOnTheScreen();
  });

  it('renders the photos, starting from the tapped one', async () => {
    await renderWithProviders(<PhotoViewerScreen />);

    expect(await screen.findByTestId('photo-page-2')).toBeOnTheScreen();
    expect(screen.getByTestId('photo-page-1')).toBeOnTheScreen();
  });
});
