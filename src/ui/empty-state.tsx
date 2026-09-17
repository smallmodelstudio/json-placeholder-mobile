import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  readonly icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  readonly title: string;
  readonly message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessibilityRole="text">
      <MaterialCommunityIcons
        name={icon}
        size={48}
        color={theme.colors.onSurfaceVariant}
      />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {message !== undefined && (
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          {message}
        </Text>
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
});
