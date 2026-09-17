import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface PostCardProps {
  readonly title: string;
  readonly excerpt: string;
  readonly authorName: string | undefined;
  readonly onPress: () => void;
}

export function PostCard({
  title,
  excerpt,
  authorName,
  onPress,
}: PostCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode="contained">
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={2}>
          {title}
        </Text>
        <Text variant="bodyMedium" numberOfLines={2} style={styles.excerpt}>
          {excerpt}
        </Text>
        {authorName !== undefined && (
          <Text variant="labelMedium" style={styles.author}>
            By {authorName}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  excerpt: {
    marginTop: 4,
  },
  author: {
    marginTop: 8,
  },
});
