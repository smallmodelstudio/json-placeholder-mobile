import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { PostsScreen } from './posts-screen';

describe('PostsScreen', () => {
  it('shows a placeholder until posts are implemented', async () => {
    await renderWithProviders(<PostsScreen />);

    expect(screen.getByText('Posts are coming soon')).toBeOnTheScreen();
  });
});
