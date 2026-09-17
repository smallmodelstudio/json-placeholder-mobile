import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/**
 * A person's profile. Exposed as `queryOptions` rather than only a hook so
 * the directory can prefetch the same cache entry with `queryClient.prefetchQuery`
 * on row press, ahead of the profile screen mounting.
 */
export function personQueryOptions(userId: number) {
  return queryOptions({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/users/{id}', { params: { path: { id: userId } } }),
      ),
  });
}

export function usePerson(userId: number) {
  return useQuery(personQueryOptions(userId));
}
