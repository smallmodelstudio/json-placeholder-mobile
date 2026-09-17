import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('shows the message and correlation id', async () => {
    await renderWithProviders(
      <ErrorState message="Couldn't load posts" correlationId="abc-123" />,
    );

    expect(screen.getByText("Couldn't load posts")).toBeOnTheScreen();
    expect(screen.getByText('Ref: abc-123')).toBeOnTheScreen();
  });

  it('calls onRetry when the retry button is pressed', async () => {
    const onRetry = jest.fn();
    await renderWithProviders(
      <ErrorState message="Couldn't load posts" onRetry={onRetry} />,
    );

    await fireEvent.press(screen.getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no retry button when onRetry is not given', async () => {
    await renderWithProviders(<ErrorState message="Couldn't load posts" />);

    expect(screen.queryByText('Retry')).not.toBeOnTheScreen();
  });
});
