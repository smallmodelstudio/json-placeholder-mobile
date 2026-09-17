import { EmptyState, Screen } from '@/ui';

// Placeholder until Phase 4 adds the people directory.
export function PeopleScreen() {
  return (
    <Screen>
      <EmptyState
        icon="account-group-outline"
        title="People are coming soon"
        message="This tab will list people from the API in a later phase."
      />
    </Screen>
  );
}
