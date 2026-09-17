import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Button, Text, useTheme } from 'react-native-paper';

interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly correlationId?: string;
  readonly onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  correlationId,
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessibilityRole="alert">
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={theme.colors.error}
      />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
      {correlationId !== undefined && (
        <Text
          variant="bodySmall"
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          Ref: {correlationId}
        </Text>
      )}
      {onRetry !== undefined && (
        <Button mode="contained-tonal" onPress={onRetry} style={styles.retry}>
          Retry
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  retry: {
    marginTop: 8,
  },
});
