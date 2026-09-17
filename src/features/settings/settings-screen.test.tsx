import { fireEvent, screen } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';

import { renderWithProviders } from '@/test/render';

import { SettingsScreen } from './settings-screen';

function isChecked(instance: TestInstance): boolean {
  const props = instance.props as {
    accessibilityState?: { checked?: boolean };
  };
  return props.accessibilityState?.checked === true;
}

describe('SettingsScreen', () => {
  it('shows the configured API URL', async () => {
    await renderWithProviders(<SettingsScreen />);

    expect(screen.getByText('http://api.test')).toBeOnTheScreen();
  });

  it('selects a theme mode when pressed', async () => {
    await renderWithProviders(<SettingsScreen />);

    const systemButton = screen.getByRole('button', { name: 'System' });
    const darkButton = screen.getByRole('button', { name: 'Dark' });

    expect(isChecked(systemButton)).toBe(true);
    expect(isChecked(darkButton)).toBe(false);

    await fireEvent.press(darkButton);

    expect(isChecked(darkButton)).toBe(true);
  });
});
