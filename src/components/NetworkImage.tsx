import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import {
  ComposerPlaceholder,
  AlbumPlaceholder,
  FormPlaceholder,
  MusicNotePlaceholder
} from './placeholders';

interface NetworkImageProps {
  uri?: string | number | null | undefined;
  source?: any; // versatile type to handle requires and expo-image sources
  size?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  fallbackType?: 'composer' | 'album' | 'era' | 'default';
  fallbackText?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
}

const FALLBACK_COLORS: Record<string, string> = {
  composer: '#8B5CF6',
  album: '#EC4899',
  era: '#F59E0B',
  form: '#10B981',
  default: '#6B7280',
  // ...
};

export function NetworkImage({
  uri,
  source,
  size,
  width,
  height,
  borderRadius,
  fallbackType = 'default',
  fallbackText,
  style,
  contentFit = 'cover',
  priority = 'normal',
  cachePolicy = 'memory-disk',
}: NetworkImageProps) {
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const isBrutal = false;

  const [error, setError] = useState(false);

  const imageWidth = width || size || 80;
  const imageHeight = height || size || 80;
  // Default to a small border radius (8) instead of circular - circular should be explicitly requested
  const radius = borderRadius ?? (isBrutal ? 0 : 8);

  const fallbackColor = FALLBACK_COLORS[fallbackType] || FALLBACK_COLORS.default;

  // Resolve the actual source for expo-image
  // If source is provided, use it.
  // If uri is a number (local require), use it directly.
  // If uri is a string, use { uri }.
  // If uri is anything else (e.g. object), it might be wrong, so ignore it or try to use it if it's a valid source.
  let finalSource = source;

  if (!finalSource) {
    if (typeof uri === 'number') {
      finalSource = uri;
    } else if (typeof uri === 'string' && uri) {
      finalSource = { uri };
    } else if (typeof uri === 'object' && uri !== null) {
      finalSource = uri;
    }
  }

  // Render appropriate SVG placeholder based on type
  const renderPlaceholder = () => {
    const size = Math.min(imageWidth, imageHeight);

    switch (fallbackType) {
      case 'composer':
        return <ComposerPlaceholder size={size} color={fallbackColor} name={fallbackText} />;
      case 'album':
        return <AlbumPlaceholder size={size} color={fallbackColor} />;
      case 'era':
        return <MusicNotePlaceholder size={size} color={fallbackColor} />;
      default:
        return <MusicNotePlaceholder size={size} color={fallbackColor} />;
    }
  };

  // Show fallback if no source/URI or error occurred
  if (!finalSource || (error && !source)) { // Don't show error for local sources as easily
    return (
      <View style={[
        styles.fallback,
        {
          width: imageWidth,
          height: imageHeight,
          borderRadius: radius,
          overflow: 'hidden',
        },
        isBrutal && { borderWidth: 2, borderColor: t.colors.border },
        style,
      ]}>
        {renderPlaceholder()}
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      {
        width: imageWidth,
        height: imageHeight,
        borderRadius: radius,
        backgroundColor: t.colors.surfaceLight,
      },
      isBrutal && { borderWidth: 2, borderColor: t.colors.border },
      style,
    ]}>
      <Image
        source={finalSource}
        style={[
          styles.image,
          {
            width: imageWidth,
            height: imageHeight,
            borderRadius: radius,
          },
        ]}
        onError={() => setError(true)}
        contentFit={contentFit}
        priority={priority}
        cachePolicy={cachePolicy}
        transition={200}
        placeholder={null}
        recyclingKey={typeof finalSource === 'string' ? finalSource : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
