import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { components } from '@/api';
import { EmptyState, ErrorState, hapticTap, Screen, Skeleton } from '@/ui';

import { PhotoTile } from './photo-tile';
import { useAlbum } from './use-album';
import { useAlbumPhotos } from './use-album-photos';

type Photo = components['schemas']['Photo'];
type Album = components['schemas']['Album'];

function AlbumPhotosSkeleton() {
  return (
    <View style={styles.skeletonGrid} testID="album-photos-skeleton">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
        <Skeleton key={key} height={110} style={styles.skeletonTile} />
      ))}
    </View>
  );
}

// The album's title is secondary here: the photos are the point of this
// screen (like a post's comments, per `docs/README-architecture.md`), so the
// header falls back to a generic title rather than blocking the grid on it.
function screenTitle(album: Album | undefined, photoCount: number | undefined) {
  if (album === undefined) {
    return 'Album';
  }
  return photoCount === undefined
    ? album.title
    : `${album.title} · ${photoCount} photos`;
}

export function AlbumPhotosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const albumId = Number(id);
  const router = useRouter();

  const albumQuery = useAlbum(albumId);
  const photosQuery = useAlbumPhotos(albumId);

  function renderItem({ item, index }: { item: Photo; index: number }) {
    return (
      <PhotoTile
        thumbnailUrl={item.thumbnailUrl}
        label={`Photo ${index + 1}`}
        testID={`photo-tile-${item.id}`}
        onPress={() => {
          router.push({
            pathname: '/album/[id]/[photoId]',
            params: { id: String(albumId), photoId: String(item.id) },
          });
        }}
      />
    );
  }

  const hasPhotos = photosQuery.isSuccess && photosQuery.data.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: screenTitle(albumQuery.data, photosQuery.data?.length),
        }}
      />
      <Screen padded={!hasPhotos}>
        <Animated.View
          key={photosQuery.status}
          entering={FadeIn.duration(200)}
          style={styles.fill}
        >
          {photosQuery.isPending ? (
            <AlbumPhotosSkeleton />
          ) : photosQuery.isError ? (
            <ErrorState
              message={photosQuery.error.message}
              correlationId={photosQuery.error.correlationId}
              onRetry={() => {
                void photosQuery.refetch();
              }}
            />
          ) : photosQuery.data.length === 0 ? (
            <EmptyState
              icon="image-off-outline"
              title="No photos yet"
              message="This album doesn't have any photos yet."
            />
          ) : (
            <FlashList
              data={photosQuery.data}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
              numColumns={3}
              contentContainerStyle={styles.listContent}
              onRefresh={() => {
                hapticTap();
                void photosQuery.refetch();
              }}
              refreshing={photosQuery.isRefetching}
            />
          )}
        </Animated.View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  listContent: {
    padding: 6,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
  },
  skeletonTile: {
    width: '29%',
    margin: 4,
    borderRadius: 4,
  },
});
