import { StyleSheet } from 'react-native';

import { hapticTap, PressableScale } from '@/ui';

import { PhotoImage } from './photo-image';

interface PhotoTileProps {
  readonly thumbnailUrl: string;
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function PhotoTile({
  thumbnailUrl,
  label,
  onPress,
  testID,
}: PhotoTileProps) {
  return (
    <PressableScale
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
    >
      <PhotoImage url={thumbnailUrl} style={styles.tile} />
    </PressableScale>
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
