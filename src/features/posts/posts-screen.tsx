import { EmptyState, Screen } from '@/ui';

// Placeholder until Phase 3 adds the posts list.
export function PostsScreen() {
  return (
    <Screen>
      <EmptyState
        icon="post-outline"
        title="Posts are coming soon"
        message="This tab will list posts from the API in a later phase."
      />
    </Screen>
  );
}
