import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ColourTileProps {
  readonly colour: string | undefined;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly children?: ReactNode;
}

/** A solid-colour tile, falling back to the theme's own surface colour when `colour` is missing. */
export function ColourTile({
  colour,
  style,
  testID,
  children,
}: ColourTileProps) {
  const theme = useTheme();
  const backgroundColor =
    colour === undefined
      ? theme.colors.surfaceVariant
      : colour.startsWith('#')
        ? colour
        : `#${colour}`;

  return (
    <View testID={testID} style={[styles.tile, { backgroundColor }, style]}>
      {children}
    </View>
  );
}

/** Extracts the hex colour JSONPlaceholder encodes in a photo URL (`.../600/92c952` -> `92c952`). */
export function hexFromPlaceholderUrl(url: string): string | undefined {
  const match = /([0-9a-fA-F]{6})(?=\/?(?:$|[?#]))/.exec(url);
  return match?.[0];
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
