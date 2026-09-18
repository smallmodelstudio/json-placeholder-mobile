import { screen } from '@testing-library/react-native';

import { lightTheme } from '@/theme';
import { renderWithProviders } from '@/test/render';

import { ColourTile, hexFromPlaceholderUrl } from './colour-tile';

describe('hexFromPlaceholderUrl', () => {
  it('extracts the hex colour from a placeholder photo URL', () => {
    expect(
      hexFromPlaceholderUrl('https://via.placeholder.com/600/92c952'),
    ).toBe('92c952');
    expect(
      hexFromPlaceholderUrl('https://via.placeholder.com/150/771796'),
    ).toBe('771796');
  });

  it('returns undefined for a URL with no hex colour', () => {
    expect(
      hexFromPlaceholderUrl('https://example.com/photo.png'),
    ).toBeUndefined();
  });
});

describe('ColourTile', () => {
  it('renders the given colour', async () => {
    await renderWithProviders(<ColourTile colour="92c952" testID="tile" />);

    expect(screen.getByTestId('tile')).toHaveStyle({
      backgroundColor: '#92c952',
    });
  });

  it('falls back to the theme colour when no colour is given', async () => {
    await renderWithProviders(<ColourTile colour={undefined} testID="tile" />);

    expect(screen.getByTestId('tile')).toHaveStyle({
      backgroundColor: lightTheme.colors.surfaceVariant,
    });
  });
});
