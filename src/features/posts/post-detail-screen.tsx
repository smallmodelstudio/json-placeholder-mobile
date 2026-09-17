import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

import { EmptyState, ErrorState, Screen, Skeleton } from '@/ui';

import { CommentCard } from './comment-card';
import { usePost } from './use-post';
import { usePostAuthor } from './use-post-author';
import { usePostComments } from './use-post-comments';

function PostDetailSkeleton() {
  return (
    <View testID="post-detail-skeleton">
      <Skeleton height={28} width="80%" />
      <Skeleton height={16} width="40%" style={styles.skeletonGap} />
      <Skeleton height={16} width="100%" style={styles.skeletonGap} />
      <Skeleton height={16} width="100%" style={styles.skeletonGap} />
      <Skeleton height={16} width="60%" style={styles.skeletonGap} />
    </View>
  );
}

function CommentsSkeleton() {
  return (
    <View>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} height={56} style={styles.skeletonGap} />
      ))}
    </View>
  );
}

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);

  const postQuery = usePost(postId);
  const authorQuery = usePostAuthor(postQuery.data?.userId);
  const commentsQuery = usePostComments(postId);

  return (
    <>
      <Stack.Screen options={{ title: postQuery.data?.title ?? 'Post' }} />
      <Screen>
        {postQuery.isPending ? (
          <PostDetailSkeleton />
        ) : postQuery.isError ? (
          <ErrorState
            message={postQuery.error.message}
            correlationId={postQuery.error.correlationId}
            onRetry={() => {
              void postQuery.refetch();
            }}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="headlineSmall">{postQuery.data.title}</Text>

            {authorQuery.isPending ? (
              <Skeleton height={16} width="40%" style={styles.author} />
            ) : (
              <Text variant="labelLarge" style={styles.author}>
                {authorQuery.isError
                  ? 'Unknown author'
                  : `By ${authorQuery.data.name}`}
              </Text>
            )}

            <Text variant="bodyLarge" style={styles.body}>
              {postQuery.data.body}
            </Text>

            <Text variant="titleMedium" style={styles.commentsHeading}>
              Comments
            </Text>
            {commentsQuery.isPending ? (
              <CommentsSkeleton />
            ) : commentsQuery.isError ? (
              <ErrorState
                message={commentsQuery.error.message}
                correlationId={commentsQuery.error.correlationId}
                onRetry={() => {
                  void commentsQuery.refetch();
                }}
              />
            ) : commentsQuery.data.length === 0 ? (
              <EmptyState
                icon="comment-outline"
                title="No comments yet"
                message="Be the first to say something about this post."
              />
            ) : (
              commentsQuery.data.map((comment) => (
                <CommentCard
                  key={comment.id}
                  name={comment.name}
                  email={comment.email}
                  body={comment.body}
                />
              ))
            )}
          </ScrollView>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  author: {
    marginTop: 8,
  },
  body: {
    marginTop: 16,
  },
  commentsHeading: {
    marginTop: 24,
    marginBottom: 12,
  },
  skeletonGap: {
    marginTop: 12,
  },
});
