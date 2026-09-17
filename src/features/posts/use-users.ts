import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/**
 * The full user list, used to look up an author's name for each row in the
 * posts list. `/posts` only returns a `userId`, and the user count is small
 * enough (per the contract) to fetch once rather than once per post.
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => unwrap(apiClient.GET('/users')),
  });
}
