import { StyleSheet, Text, View } from 'react-native';

import { config } from '@/config';

// Placeholder until Phase 1 adds the theme and tabs.
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JSON Placeholder</Text>
      <Text>API: {config.apiUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
