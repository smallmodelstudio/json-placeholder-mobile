import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';

import { PeopleScreen } from './people-screen';

function errorBody() {
  return {
    statusCode: 500,
    message: 'Something upstream broke',
    error: 'Internal Server Error',
    path: '/users',
    timestamp: new Date().toISOString(),
    correlationId: 'test-correlation-id',
  };
}

describe('PeopleScreen', () => {
  it('shows a skeleton while loading', async () => {
    server.use(
      http.get(`${config.apiUrl}/users`, async () => {
        await delay('infinite');
        return HttpResponse.json({ data: [] });
      }),
    );

    await renderWithProviders(<PeopleScreen />);

    expect(screen.getByTestId('people-skeleton')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no people', async () => {
    server.use(
      http.get(`${config.apiUrl}/users`, () =>
        HttpResponse.json({
          data: [],
          meta: { timestamp: new Date().toISOString(), correlationId: 'x' },
        }),
      ),
    );

    await renderWithProviders(<PeopleScreen />);

    expect(await screen.findByText('No people yet')).toBeOnTheScreen();
  });

  it('shows an error state and recovers on retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/users`, () =>
        HttpResponse.json(errorBody(), { status: 500 }),
      ),
    );

    await renderWithProviders(<PeopleScreen />);

    expect(
      await screen.findByText('Something upstream broke'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Ref: test-correlation-id')).toBeOnTheScreen();

    server.resetHandlers();

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();
  });

  it('shows people and navigates to the profile screen on press', async () => {
    const pushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});

    await renderWithProviders(<PeopleScreen />);

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();
    expect(screen.getByText('Ervin Howell')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Leanne Graham'));

    expect(pushSpy).toHaveBeenCalledWith({
      pathname: '/person/[id]',
      params: { id: '1' },
    });
  });

  it('filters the directory by a debounced search term', async () => {
    await renderWithProviders(<PeopleScreen />);

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Search people'),
      'erv',
    );

    await waitFor(() => {
      expect(screen.queryByText('Leanne Graham')).not.toBeOnTheScreen();
    });
    expect(screen.getByText('Ervin Howell')).toBeOnTheScreen();
  });

  it('shows a no-matches state for a search with no results', async () => {
    await renderWithProviders(<PeopleScreen />);

    expect(await screen.findByText('Leanne Graham')).toBeOnTheScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Search people'),
      'nobody-matches-this',
    );

    expect(await screen.findByText('No matches')).toBeOnTheScreen();
  });
});
