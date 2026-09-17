import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

const defaultEdges: readonly Edge[] = ['left', 'right', 'bottom'];

interface ScreenProps {
  readonly children: ReactNode;
  readonly edges?: readonly Edge[];
  readonly padded?: boolean;
}

export function Screen({
  children,
  edges = defaultEdges,
  padded = true,
}: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    padding: 16,
  },
});
