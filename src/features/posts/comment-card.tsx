import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface CommentCardProps {
  readonly name: string;
  readonly email: string;
  readonly body: string;
}

export function CommentCard({ name, email, body }: CommentCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{name}</Text>
      <Text
        variant="bodySmall"
        style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
      >
        {email}
      </Text>
      <Text variant="bodyMedium" style={styles.body}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  email: {
    marginTop: 2,
  },
  body: {
    marginTop: 6,
  },
});
