import { useState } from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { ColourTile, hexFromPlaceholderUrl } from '@/ui';

interface PhotoImageProps {
  readonly url: string;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * A photo tile: attempts to load the real image, with the hex colour
 * JSONPlaceholder encodes in the URL as both the loading placeholder and the
 * permanent fallback. The upstream host (via.placeholder.com) no longer
 * serves images, so every load fails in practice and the colour tile is what
 * renders — but the real `Image` is still attempted, so a photo starts
 * rendering for real again for free if the upstream host ever comes back.
 */
export function PhotoImage({ url, style }: PhotoImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <ColourTile colour={hexFromPlaceholderUrl(url)} style={style}>
      {!failed && (
        <Image
          source={url}
          style={StyleSheet.absoluteFill}
          onError={() => {
            setFailed(true);
          }}
          transition={200}
        />
      )}
    </ColourTile>
  );
}
