import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import type { components } from '@/api';
import { EmptyState, ErrorState, Screen, Skeleton } from '@/ui';

import { AlbumCard } from './album-card';
import { albumQueryOptions } from './use-album';
import { useAlbums } from './use-albums';

type Album = components['schemas']['Album'];

function AlbumsSkeleton() {
  return (
    <View style={styles.skeletonGrid} testID="albums-skeleton">
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <Skeleton key={key} height={150} style={styles.skeletonTile} />
      ))}
    </View>
  );
}

export function AlbumsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const albumsQuery = useAlbums();

  function renderItem({ item }: { item: Album }) {
    return (
      <AlbumCard
        title={item.title}
        albumId={item.id}
        onPress={() => {
          void queryClient.prefetchQuery(albumQueryOptions(item.id));
          router.push({
            pathname: '/album/[id]',
            params: { id: String(item.id) },
          });
        }}
      />
    );
  }

  const hasAlbums = albumsQuery.isSuccess && albumsQuery.data.length > 0;

  return (
    <Screen padded={!hasAlbums}>
      {albumsQuery.isPending ? (
        <AlbumsSkeleton />
      ) : albumsQuery.isError ? (
        <ErrorState
          message={albumsQuery.error.message}
          correlationId={albumsQuery.error.correlationId}
          onRetry={() => {
            void albumsQuery.refetch();
          }}
        />
      ) : albumsQuery.data.length === 0 ? (
        <EmptyState
          icon="image-multiple-outline"
          title="No albums yet"
          message="Albums will show up here once there are some to browse."
        />
      ) : (
        <FlashList
          data={albumsQuery.data}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            void albumsQuery.refetch();
          }}
          refreshing={albumsQuery.isRefetching}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 10,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  skeletonTile: {
    width: '44%',
    margin: 6,
    borderRadius: 12,
  },
});
