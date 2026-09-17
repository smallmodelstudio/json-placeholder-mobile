import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/**
 * A post's author, fetched by the `userId` on the post. Only enabled once
 * `userId` is known, so the detail screen can fetch its post and author in
 * parallel without waiting on the post to resolve first.
 */
export function usePostAuthor(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? 0),
    queryFn: () =>
      unwrap(
        apiClient.GET('/users/{id}', {
          params: { path: { id: userId ?? 0 } },
        }),
      ),
    enabled: userId !== undefined,
  });
}
