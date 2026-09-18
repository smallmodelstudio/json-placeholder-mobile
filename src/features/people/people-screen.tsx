import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Searchbar } from 'react-native-paper';

import type { components } from '@/api';
import { EmptyState, ErrorState, hapticTap, Screen, Skeleton } from '@/ui';

import { PersonCard } from './person-card';
import { personQueryOptions } from './use-person';
import { usePeople } from './use-people';
import { useDebouncedValue } from './use-debounced-value';

type User = components['schemas']['User'];

function matches(person: User, term: string): boolean {
  return (
    person.name.toLowerCase().includes(term) ||
    person.username.toLowerCase().includes(term) ||
    person.email.toLowerCase().includes(term)
  );
}

function PeopleSkeleton() {
  return (
    <View style={styles.skeletonList} testID="people-skeleton">
      {[0, 1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <Skeleton height={20} width="60%" />
          <Skeleton height={14} width="40%" style={styles.skeletonGap} />
          <Skeleton height={14} width="70%" style={styles.skeletonGap} />
        </View>
      ))}
    </View>
  );
}

export function PeopleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const peopleQuery = usePeople();
  const [query, setQuery] = useState('');
  const debouncedTerm = useDebouncedValue(query, 250).trim().toLowerCase();

  const people = useMemo(() => {
    const all = peopleQuery.data ?? [];
    return debouncedTerm === ''
      ? all
      : all.filter((person) => matches(person, debouncedTerm));
  }, [peopleQuery.data, debouncedTerm]);

  function renderItem({ item, index }: { item: User; index: number }) {
    return (
      <PersonCard
        name={item.name}
        username={item.username}
        email={item.email}
        testID={`person-card-${index}`}
        onPress={() => {
          void queryClient.prefetchQuery(personQueryOptions(item.id));
          router.push({
            pathname: '/person/[id]',
            params: { id: String(item.id) },
          });
        }}
      />
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.searchBar}>
        <Searchbar
          placeholder="Search people"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search people"
        />
      </View>

      <Animated.View
        key={peopleQuery.status}
        entering={FadeIn.duration(200)}
        style={styles.fill}
      >
        {peopleQuery.isPending ? (
          <PeopleSkeleton />
        ) : peopleQuery.isError ? (
          <ErrorState
            message={peopleQuery.error.message}
            correlationId={peopleQuery.error.correlationId}
            onRetry={() => {
              void peopleQuery.refetch();
            }}
          />
        ) : people.length === 0 ? (
          <EmptyState
            icon="account-search-outline"
            title={debouncedTerm === '' ? 'No people yet' : 'No matches'}
            message={
              debouncedTerm === ''
                ? 'People will show up here once there are some to meet.'
                : `No one matches "${debouncedTerm}".`
            }
          />
        ) : (
          <FlashList
            data={people}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            onRefresh={() => {
              hapticTap();
              void peopleQuery.refetch();
            }}
            refreshing={peopleQuery.isRefetching}
          />
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  searchBar: {
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  skeletonList: {
    gap: 12,
    padding: 16,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 12,
  },
  skeletonGap: {
    marginTop: 8,
  },
});
