import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import type { components } from '@/api';
import { EmptyState, ErrorState, Screen, Skeleton } from '@/ui';

import { PostCard } from './post-card';
import { usePosts } from './use-posts';
import { useUsers } from './use-users';

type Post = components['schemas']['Post'];

function PostsSkeleton() {
  return (
    <View style={styles.skeletonList} testID="posts-skeleton">
      {[0, 1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} width="100%" style={styles.skeletonGap} />
          <Skeleton height={14} width="40%" style={styles.skeletonGap} />
        </View>
      ))}
    </View>
  );
}

export function PostsScreen() {
  const router = useRouter();
  const postsQuery = usePosts();
  const usersQuery = useUsers();

  const authorNamesById = useMemo(() => {
    const byId = new Map<number, string>();
    for (const user of usersQuery.data ?? []) {
      byId.set(user.id, user.name);
    }
    return byId;
  }, [usersQuery.data]);

  function renderItem({ item }: { item: Post }) {
    return (
      <PostCard
        title={item.title}
        excerpt={item.body}
        authorName={authorNamesById.get(item.userId)}
        onPress={() => {
          router.push({
            pathname: '/post/[id]',
            params: { id: String(item.id) },
          });
        }}
      />
    );
  }

  const hasPosts = postsQuery.isSuccess && postsQuery.data.length > 0;

  return (
    <Screen padded={!hasPosts}>
      {postsQuery.isPending ? (
        <PostsSkeleton />
      ) : postsQuery.isError ? (
        <ErrorState
          message={postsQuery.error.message}
          correlationId={postsQuery.error.correlationId}
          onRetry={() => {
            void postsQuery.refetch();
          }}
        />
      ) : postsQuery.data.length === 0 ? (
        <EmptyState
          icon="post-outline"
          title="No posts yet"
          message="Posts will show up here once there are some to read."
        />
      ) : (
        <FlashList
          data={postsQuery.data}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            void postsQuery.refetch();
          }}
          refreshing={postsQuery.isRefetching}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 12,
  },
  skeletonGap: {
    marginTop: 8,
  },
});
