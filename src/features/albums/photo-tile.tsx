import { Pressable, StyleSheet } from 'react-native';

import { PhotoImage } from './photo-image';

interface PhotoTileProps {
  readonly thumbnailUrl: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function PhotoTile({ thumbnailUrl, onPress, testID }: PhotoTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      testID={testID}
    >
      <PhotoImage url={thumbnailUrl} style={styles.tile} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
  },
  tile: {
    flex: 1,
    borderRadius: 4,
  },
});
