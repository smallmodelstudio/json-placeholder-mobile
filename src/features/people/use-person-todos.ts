import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** A person's todos, for the profile's Todos segment. Only fetched once that segment is selected. */
export function usePersonTodos(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.todos(userId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/users/{id}/todos', {
          params: { path: { id: userId } },
        }),
      ),
    enabled,
  });
}
