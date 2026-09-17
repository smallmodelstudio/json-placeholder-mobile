import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { AlbumsScreen } from './albums-screen';

describe('AlbumsScreen', () => {
  it('shows a placeholder until albums are implemented', async () => {
    await renderWithProviders(<AlbumsScreen />);

    expect(screen.getByText('Albums are coming soon')).toBeOnTheScreen();
  });
});
