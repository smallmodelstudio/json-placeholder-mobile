import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the title and message', async () => {
    await renderWithProviders(
      <EmptyState
        icon="post-outline"
        title="Nothing here"
        message="Check back later"
      />,
    );

    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
    expect(screen.getByText('Check back later')).toBeOnTheScreen();
  });

  it('omits the message when none is given', async () => {
    await renderWithProviders(
      <EmptyState icon="post-outline" title="Nothing here" />,
    );

    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
  });
});
