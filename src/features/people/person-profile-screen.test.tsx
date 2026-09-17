import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { PersonProfileScreen } from './person-profile-screen';

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

describe('PersonProfileScreen', () => {
  it('shows a skeleton while the profile is loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/users/:id`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: {} });
      }),
    );

    await renderWithProviders(<PersonProfileScreen />);

    expect(screen.getByTestId('profile-skeleton')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/users/:id`, () =>
        HttpResponse.json(errorBody('/users/1'), { status: 500 }),
      ),
    );

    await renderWithProviders(<PersonProfileScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();
  });

  it('shows contact and company details', async () => {
    await renderWithProviders(<PersonProfileScreen />);

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();
    expect(screen.getByText('@Bret')).toBeOnTheScreen();
    expect(screen.getByText('Sincere@april.biz')).toBeOnTheScreen();
    expect(screen.getByText('1-770-736-8031 x56442')).toBeOnTheScreen();
    expect(screen.getByText('Romaguera-Crona')).toBeOnTheScreen();
    expect(
      screen.getByText('Multi-layered client-server neural-net'),
    ).toBeOnTheScreen();
  });

  it('shows the posts segment by default and navigates to a post on press', async () => {
    const pushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});

    await renderWithProviders(<PersonProfileScreen />);

    expect(await screen.findByText('first post title')).toBeOnTheScreen();
    expect(screen.getByText('second post title')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('first post title'));

    expect(pushSpy).toHaveBeenCalledWith({
      pathname: '/post/[id]',
      params: { id: '1' },
    });
  });

  it('shows the albums segment when selected', async () => {
    await renderWithProviders(<PersonProfileScreen />);

    await screen.findByText('first post title');
    await fireEvent.press(screen.getByRole('button', { name: 'Albums' }));

    expect(await screen.findByText('first album')).toBeOnTheScreen();
    expect(screen.getByText('second album')).toBeOnTheScreen();
  });

  it('shows the todos segment when selected', async () => {
    await renderWithProviders(<PersonProfileScreen />);

    await screen.findByText('first post title');
    await fireEvent.press(screen.getByRole('button', { name: 'Todos' }));

    expect(await screen.findByText('first todo')).toBeOnTheScreen();
    expect(screen.getByText('second todo')).toBeOnTheScreen();
  });

  it('shows an empty state for a segment with no data', async () => {
    server.use(
      http.get(`${config.apiUrl}/users/:id/albums`, ({ request }) =>
        HttpResponse.json({
          data: [],
          meta: {
            timestamp: new Date().toISOString(),
            correlationId: request.headers.get('x-correlation-id') ?? 'x',
          },
        }),
      ),
    );

    await renderWithProviders(<PersonProfileScreen />);

    await screen.findByText('first post title');
    await fireEvent.press(screen.getByRole('button', { name: 'Albums' }));

    expect(await screen.findByText('No albums yet')).toBeOnTheScreen();
  });
});
