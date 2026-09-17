import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { PeopleScreen } from './people-screen';

describe('PeopleScreen', () => {
  it('shows a placeholder until people are implemented', async () => {
    await renderWithProviders(<PeopleScreen />);

    expect(screen.getByText('People are coming soon')).toBeOnTheScreen();
  });
});
