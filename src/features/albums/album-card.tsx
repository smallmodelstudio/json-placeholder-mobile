import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ColourTile, hapticTap, PressableScale } from '@/ui';

// A fixed, pleasant palette to hash an album's cover colour from. There's no
// cheap way to show a real cover photo for every album in the grid — that
// would mean either one nested fetch per album (~100 of them) or fetching all
// 5,000 `/photos` up front, against the contract's "lists aren't paginated,
// prefer nested routes" guidance — so the grid shows a stable colour instead,
// and the album's own photo grid shows real photo colours once opened.
const coverPalette: readonly string[] = [
  '#F2B8B5',
  '#F6C177',
  '#F9E28C',
  '#A8D8B9',
  '#8FC1E3',
  '#B8A9E0',
  '#E8A9C9',
  '#9FD8CB',
];
const defaultCover = '#8FC1E3';

interface AlbumCardProps {
  readonly title: string;
  readonly albumId: number;
  readonly onPress: () => void;
  readonly testID: string;
}

export function AlbumCard({ title, albumId, onPress, testID }: AlbumCardProps) {
  const colour = coverPalette[albumId % coverPalette.length] ?? defaultCover;

  return (
    <PressableScale
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${title} album`}
      testID={testID}
    >
      <ColourTile colour={colour} style={styles.tile}>
        <Text variant="titleSmall" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </ColourTile>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
  },
  tile: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
  },
  title: {
    color: '#1B1B1B',
  },
});
