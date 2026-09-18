import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';

import type { components } from '@/api';
import { EmptyState, ErrorState, Screen, Skeleton } from '@/ui';

import { useAlbumPhotos } from './use-album-photos';
import { ZoomablePhoto } from './zoomable-photo';

type Photo = components['schemas']['Photo'];

export function PhotoViewerScreen() {
  const { id, photoId } = useLocalSearchParams<{
    id: string;
    photoId: string;
  }>();
  const albumId = Number(id);
  const { width } = useWindowDimensions();

  const photosQuery = useAlbumPhotos(albumId);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // The viewer is only reachable by tapping a tile in the photo grid, so this
  // query is always already resolved and cached by the time it mounts here —
  // no separate "wait for data, then find the index" step is needed.
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      (photosQuery.data ?? []).findIndex(
        (photo) => String(photo.id) === photoId,
      ),
    ),
  );

  function renderItem({ item }: { item: Photo }) {
    return (
      <View testID={`photo-page-${item.id}`} style={[styles.page, { width }]}>
        <ZoomablePhoto
          url={item.url}
          onZoomChange={(zoomed) => {
            setScrollEnabled(!zoomed);
          }}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title:
            photosQuery.data === undefined
              ? 'Photo'
              : `${index + 1} of ${photosQuery.data.length}`,
        }}
      />
      <Screen padded={false}>
        {photosQuery.isPending ? (
          <View testID="photo-viewer-skeleton" style={styles.page}>
            <Skeleton height="100%" />
          </View>
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
            title="No photos"
            message="This album doesn't have any photos to view."
          />
        ) : (
          <FlashList
            data={photosQuery.data}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            initialScrollIndex={index}
            onMomentumScrollEnd={(event) => {
              setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
            }}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
