import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';

import { ThemeModeProvider, useThemeMode } from './theme-mode';

function ModePicker() {
  const { mode, colorScheme, setMode } = useThemeMode();

  return (
    <>
      <Text>mode: {mode}</Text>
      <Text>colorScheme: {colorScheme}</Text>
      <TouchableOpacity onPress={() => setMode('dark')}>
        <Text>Use dark</Text>
      </TouchableOpacity>
    </>
  );
}

describe('ThemeModeProvider', () => {
  it('defaults to following the system colour scheme', async () => {
    await render(
      <ThemeModeProvider>
        <ModePicker />
      </ThemeModeProvider>,
    );

    expect(screen.getByText('mode: system')).toBeOnTheScreen();
    expect(screen.getByText('colorScheme: light')).toBeOnTheScreen();
  });

  it('overrides the colour scheme when a mode is set', async () => {
    await render(
      <ThemeModeProvider>
        <ModePicker />
      </ThemeModeProvider>,
    );

    await fireEvent.press(screen.getByText('Use dark'));

    expect(screen.getByText('mode: dark')).toBeOnTheScreen();
    expect(screen.getByText('colorScheme: dark')).toBeOnTheScreen();
  });
});

describe('useThemeMode', () => {
  it('throws when used outside a ThemeModeProvider', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(render(<ModePicker />)).rejects.toThrow(
      'useThemeMode must be used within a ThemeModeProvider',
    );

    consoleError.mockRestore();
  });
});
