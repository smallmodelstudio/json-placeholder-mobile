import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { hapticTap } from '@/ui';

interface PersonCardProps {
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly onPress: () => void;
}

export function PersonCard({
  name,
  username,
  email,
  onPress,
}: PersonCardProps) {
  return (
    <Card
      style={styles.card}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      mode="contained"
      accessibilityLabel={`${name}, @${username}`}
    >
      <Card.Content>
        <Text variant="titleMedium">{name}</Text>
        <Text variant="bodyMedium" style={styles.username}>
          @{username}
        </Text>
        <Text variant="labelMedium" style={styles.email}>
          {email}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  username: {
    marginTop: 4,
  },
  email: {
    marginTop: 8,
  },
});
