import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { 
  ComposerPlaceholder, 
  AlbumPlaceholder, 
  FormPlaceholder,
  MusicNotePlaceholder 
} from './placeholders';

interface NetworkImageProps {
  uri: string | null | undefined;
  size?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  fallbackType?: 'composer' | 'album' | 'era' | 'default';
  fallbackText?: string;
  style?: any;
}

const FALLBACK_COLORS: Record<string, string> = {
  composer: '#8B5CF6',
  album: '#EC4899',
  era: '#F59E0B',
  form: '#10B981',
  default: '#6B7280',
};

export function NetworkImage({
  uri,
  size,
  width,
  height,
  borderRadius,
  fallbackType = 'default',
  fallbackText,
  style,
}: NetworkImageProps) {
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const imageWidth = width || size || 80;
  const imageHeight = height || size || 80;
  const radius = borderRadius ?? (isBrutal ? 0 : Math.min(imageWidth, imageHeight) / 2);
  
  const fallbackColor = FALLBACK_COLORS[fallbackType] || FALLBACK_COLORS.default;
  
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
  
  // Show fallback if no URI or error occurred
  if (!uri || error) {
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
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={t.colors.primary} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: imageWidth,
            height: imageHeight,
            borderRadius: radius,
          },
        ]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        resizeMode="cover"
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontWeight: 'bold',
  },
});
