import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PhotoImage } from './photo-image';

const maxScale = 4;

interface ZoomablePhotoProps {
  readonly url: string;
  readonly onZoomChange?: (zoomed: boolean) => void;
}

/** Pinch-to-zoom around a photo tile, from 1x up to 4x; double-tap toggles between 1x and 2x. */
export function ZoomablePhoto({ url, onZoomChange }: ZoomablePhotoProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  function reportZoom(zoomed: boolean) {
    onZoomChange?.(zoomed);
  }

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(
        maxScale,
        Math.max(1, savedScale.value * event.scale),
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(reportZoom)(scale.value > 1);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = scale.value > 1 ? 1 : 2;
      scale.value = withSpring(next);
      savedScale.value = next;
      runOnJS(reportZoom)(next > 1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(doubleTap, pinch)}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <PhotoImage url={url} style={styles.tile} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tile: {
    flex: 1,
    borderRadius: 0,
  },
});
