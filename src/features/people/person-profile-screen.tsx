import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { List, SegmentedButtons, Text } from 'react-native-paper';

import type { ApiError, components } from '@/api';
import {
  EmptyState,
  ErrorState,
  hapticSelect,
  hapticTap,
  Screen,
  Skeleton,
} from '@/ui';

import { usePerson } from './use-person';
import { usePersonAlbums } from './use-person-albums';
import { usePersonPosts } from './use-person-posts';
import { usePersonTodos } from './use-person-todos';

type Post = components['schemas']['Post'];
type Album = components['schemas']['Album'];
type Todo = components['schemas']['Todo'];
type Segment = 'posts' | 'albums' | 'todos';

const segmentOptions: { readonly value: Segment; readonly label: string }[] = [
  { value: 'posts', label: 'Posts' },
  { value: 'albums', label: 'Albums' },
  { value: 'todos', label: 'Todos' },
];

function ProfileSkeleton() {
  return (
    <View testID="profile-skeleton" style={styles.padded}>
      <Skeleton height={28} width="60%" />
      <Skeleton height={16} width="40%" style={styles.skeletonGap} />
      <Skeleton height={48} style={styles.skeletonGap} />
      <Skeleton height={48} style={styles.skeletonGap} />
    </View>
  );
}

interface SegmentSectionProps<T> {
  readonly query: UseQueryResult<T[], ApiError>;
  readonly emptyIcon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly keyExtractor: (item: T) => string;
  readonly renderItem: (item: T) => ReactNode;
}

function SegmentSection<T>({
  query,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  keyExtractor,
  renderItem,
}: SegmentSectionProps<T>) {
  if (query.isPending) {
    return (
      <View testID="segment-skeleton">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={48} style={styles.skeletonGap} />
        ))}
      </View>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        message={query.error.message}
        correlationId={query.error.correlationId}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (query.data.length === 0) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
    );
  }

  return (
    <>
      {query.data.map((item) => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
    </>
  );
}

export function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const personId = Number(id);
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('posts');

  const personQuery = usePerson(personId);
  const postsQuery = usePersonPosts(personId, segment === 'posts');
  const albumsQuery = usePersonAlbums(personId, segment === 'albums');
  const todosQuery = usePersonTodos(personId, segment === 'todos');

  return (
    <>
      <Stack.Screen options={{ title: personQuery.data?.name ?? 'Profile' }} />
      <Screen padded={false}>
        <Animated.View
          key={personQuery.status}
          entering={FadeIn.duration(200)}
          style={styles.fill}
        >
          {personQuery.isPending ? (
            <ProfileSkeleton />
          ) : personQuery.isError ? (
            <ErrorState
              message={personQuery.error.message}
              correlationId={personQuery.error.correlationId}
              onRetry={() => {
                void personQuery.refetch();
              }}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              <Text variant="headlineSmall">{personQuery.data.name}</Text>
              <Text variant="bodyMedium" style={styles.username}>
                @{personQuery.data.username}
              </Text>

              <List.Item
                title={personQuery.data.email}
                left={(props) => <List.Icon {...props} icon="email-outline" />}
                accessibilityLabel={`Email ${personQuery.data.email}`}
                onPress={() => {
                  hapticTap();
                  void Linking.openURL(`mailto:${personQuery.data.email}`);
                }}
              />
              <List.Item
                title={personQuery.data.phone}
                left={(props) => <List.Icon {...props} icon="phone-outline" />}
                accessibilityLabel={`Phone ${personQuery.data.phone}`}
                onPress={() => {
                  hapticTap();
                  void Linking.openURL(`tel:${personQuery.data.phone}`);
                }}
              />
              <List.Item
                title={personQuery.data.website}
                left={(props) => <List.Icon {...props} icon="web" />}
                accessibilityLabel={`Website ${personQuery.data.website}`}
                onPress={() => {
                  hapticTap();
                  void Linking.openURL(`https://${personQuery.data.website}`);
                }}
              />
              <List.Item
                title={personQuery.data.company.name}
                description={personQuery.data.company.catchPhrase}
                left={(props) => (
                  <List.Icon {...props} icon="briefcase-outline" />
                )}
              />
              <List.Item
                title={`${personQuery.data.address.street}, ${personQuery.data.address.city}`}
                description={personQuery.data.address.zipcode}
                left={(props) => (
                  <List.Icon {...props} icon="map-marker-outline" />
                )}
              />

              <SegmentedButtons
                value={segment}
                onValueChange={(value) => {
                  hapticSelect();
                  setSegment(value);
                }}
                buttons={segmentOptions}
                style={styles.segmented}
              />

              {segment === 'posts' && (
                <SegmentSection<Post>
                  query={postsQuery}
                  emptyIcon="post-outline"
                  emptyTitle="No posts yet"
                  emptyMessage={`${personQuery.data.name} hasn't written anything yet.`}
                  keyExtractor={(post) => String(post.id)}
                  renderItem={(post) => (
                    <List.Item
                      title={post.title}
                      description={post.body}
                      onPress={() => {
                        hapticTap();
                        router.push({
                          pathname: '/post/[id]',
                          params: { id: String(post.id) },
                        });
                      }}
                    />
                  )}
                />
              )}

              {segment === 'albums' && (
                <SegmentSection<Album>
                  query={albumsQuery}
                  emptyIcon="image-multiple-outline"
                  emptyTitle="No albums yet"
                  emptyMessage={`${personQuery.data.name} hasn't created any albums yet.`}
                  keyExtractor={(album) => String(album.id)}
                  renderItem={(album) => (
                    <List.Item
                      title={album.title}
                      left={(props) => (
                        <List.Icon {...props} icon="image-outline" />
                      )}
                    />
                  )}
                />
              )}

              {segment === 'todos' && (
                <SegmentSection<Todo>
                  query={todosQuery}
                  emptyIcon="checkbox-marked-circle-outline"
                  emptyTitle="No todos yet"
                  emptyMessage={`${personQuery.data.name} hasn't added any todos yet.`}
                  keyExtractor={(todo) => String(todo.id)}
                  renderItem={(todo) => (
                    <List.Item
                      title={todo.title}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={
                            todo.completed
                              ? 'checkbox-marked-outline'
                              : 'checkbox-blank-outline'
                          }
                        />
                      )}
                    />
                  )}
                />
              )}
            </ScrollView>
          )}
        </Animated.View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  padded: {
    padding: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  username: {
    marginTop: 4,
  },
  segmented: {
    marginTop: 24,
    marginBottom: 12,
  },
  skeletonGap: {
    marginTop: 12,
  },
});
