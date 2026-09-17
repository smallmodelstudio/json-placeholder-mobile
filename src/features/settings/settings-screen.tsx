import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

import { config } from '@/config';
import { Screen } from '@/ui';
import { useThemeMode, type ThemeMode } from '@/theme';

const modeOptions: { readonly value: ThemeMode; readonly label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const { mode, setMode } = useThemeMode();

  return (
    <Screen>
      <View style={styles.section}>
        <Text variant="titleMedium">Theme</Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => {
            setMode(value);
          }}
          buttons={modeOptions}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">API URL</Text>
        <Text variant="bodyMedium">{config.apiUrl}</Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">App version</Text>
        <Text variant="bodyMedium">
          {Constants.expoConfig?.version ?? 'Unknown'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    marginBottom: 24,
  },
});
