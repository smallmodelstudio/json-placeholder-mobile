import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** A single post, for the post detail screen. */
export function usePost(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/posts/{id}', { params: { path: { id: postId } } }),
      ),
  });
}
