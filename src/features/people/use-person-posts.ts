import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** A person's posts, for the profile's Posts segment. Only fetched once that segment is selected. */
export function usePersonPosts(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.posts(userId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/users/{id}/posts', {
          params: { path: { id: userId } },
        }),
      ),
    enabled,
  });
}
