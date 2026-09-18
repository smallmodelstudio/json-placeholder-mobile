import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { hapticTap } from '@/ui';

interface PostCardProps {
  readonly title: string;
  readonly excerpt: string;
  readonly authorName: string | undefined;
  readonly onPress: () => void;
  readonly testID: string;
}

export function PostCard({
  title,
  excerpt,
  authorName,
  onPress,
  testID,
}: PostCardProps) {
  return (
    <Card
      style={styles.card}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      mode="contained"
      accessibilityLabel={
        authorName === undefined ? title : `${title}, by ${authorName}`
      }
      testID={testID}
    >
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
