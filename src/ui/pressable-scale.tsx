import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<ComponentProps<typeof Pressable>, 'ref'>;

/** A `Pressable` that scales down slightly while pressed, for grid tiles that have no Paper ripple of their own. */
export function PressableScale({
  onPressIn,
  onPressOut,
  style,
  ...pressableProps
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...pressableProps}
      onPressIn={(event) => {
        scale.set(withTiming(0.96, { duration: 100 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withTiming(1, { duration: 100 }));
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
