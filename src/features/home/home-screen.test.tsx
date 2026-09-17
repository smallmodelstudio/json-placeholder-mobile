import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from './home-screen';

describe('HomeScreen', () => {
  it('shows the configured API URL', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('API: http://api.test')).toBeOnTheScreen();
  });
});
