import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** The posts list, per `docs/README-plan.md`'s Posts screen. */
export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => unwrap(apiClient.GET('/posts')),
  });
}
