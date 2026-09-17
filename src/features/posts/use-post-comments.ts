import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** A post's comments, nested under `/posts/:id/comments` per the API contract. */
export function usePostComments(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/posts/{id}/comments', {
          params: { path: { id: postId } },
        }),
      ),
  });
}
