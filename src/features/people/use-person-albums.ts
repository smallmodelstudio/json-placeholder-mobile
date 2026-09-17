import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** A person's albums, for the profile's Albums segment. Only fetched once that segment is selected. */
export function usePersonAlbums(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.albums(userId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/users/{id}/albums', {
          params: { path: { id: userId } },
        }),
      ),
    enabled,
  });
}
