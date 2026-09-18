import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/** The full album list, for the albums grid. */
export function useAlbums() {
  return useQuery({
    queryKey: queryKeys.albums.list(),
    queryFn: () => unwrap(apiClient.GET('/albums')),
  });
}
