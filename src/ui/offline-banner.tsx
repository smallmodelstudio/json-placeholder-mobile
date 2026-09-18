import { StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Text, useTheme } from 'react-native-paper';

/**
 * A banner shown across every screen when the device has no network
 * connection. `isConnected === false` is the only state that renders it —
 * `null` (not yet known) and `true` render nothing, so the banner doesn't
 * flash on to app start before the first check resolves.
 */
export function OfflineBanner() {
  const { isConnected } = useNetInfo();
  const theme = useTheme();

  if (isConnected !== false) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(200)}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: theme.colors.errorContainer }]}
    >
      <Text
        variant="labelMedium"
        style={{ color: theme.colors.onErrorContainer }}
      >
        You&apos;re offline. Showing what&apos;s already loaded.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
