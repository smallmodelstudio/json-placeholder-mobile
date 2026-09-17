import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** The people directory, per `docs/README-plan.md`'s People screen. */
export function usePeople() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => unwrap(apiClient.GET('/users')),
  });
}
