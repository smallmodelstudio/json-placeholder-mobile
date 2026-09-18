import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/**
 * A single album. Exposed as `queryOptions` rather than only a hook so the
 * grid can prefetch the same cache entry on row press, per `personQueryOptions`.
 */
export function albumQueryOptions(albumId: number) {
  return queryOptions({
    queryKey: queryKeys.albums.detail(albumId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/albums/{id}', { params: { path: { id: albumId } } }),
      ),
  });
}

export function useAlbum(albumId: number) {
  return useQuery(albumQueryOptions(albumId));
}
