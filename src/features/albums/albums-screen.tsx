import { EmptyState, Screen } from '@/ui';

// Placeholder until Phase 5 adds the album grid.
export function AlbumsScreen() {
  return (
    <Screen>
      <EmptyState
        icon="image-multiple-outline"
        title="Albums are coming soon"
        message="This tab will list albums from the API in a later phase."
      />
    </Screen>
  );
}
