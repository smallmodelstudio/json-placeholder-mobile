import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys, unwrap } from '@/api';

/**
 * An album's photos, nested under `/albums/:id/photos` per the API contract.
 * Exposed as `queryOptions` too, so the photo grid and the full-screen viewer
 * read the same cache entry: opening a photo never refetches the list the
 * grid already has.
 */
export function albumPhotosQueryOptions(albumId: number) {
  return queryOptions({
    queryKey: queryKeys.albums.photos(albumId),
    queryFn: () =>
      unwrap(
        apiClient.GET('/albums/{id}/photos', {
          params: { path: { id: albumId } },
        }),
      ),
  });
}

export function useAlbumPhotos(albumId: number) {
  return useQuery(albumPhotosQueryOptions(albumId));
}
