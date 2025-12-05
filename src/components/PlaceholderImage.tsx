import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';

type PlaceholderType = 
  | 'composer' 
  | 'album' 
  | 'era' 
  | 'form' 
  | 'badge' 
  | 'empty' 
  | 'music' 
  | 'default';

interface PlaceholderImageProps {
  type?: PlaceholderType;
  size?: number;
  source?: ImageSourcePropType;
  fallbackText?: string;
  style?: any;
  borderRadius?: number;
}

const TYPE_CONFIG: Record<PlaceholderType, { icon: string; gradient: [string, string] }> = {
  composer: { icon: 'person', gradient: ['#8B5CF6', '#6366F1'] },
  album: { icon: 'disc', gradient: ['#EC4899', '#F43F5E'] },
  era: { icon: 'time', gradient: ['#F59E0B', '#EAB308'] },
  form: { icon: 'musical-notes', gradient: ['#10B981', '#14B8A6'] },
  badge: { icon: 'trophy', gradient: ['#F59E0B', '#D97706'] },
  empty: { icon: 'musical-note', gradient: ['#6B7280', '#9CA3AF'] },
  music: { icon: 'headset', gradient: ['#3B82F6', '#6366F1'] },
  default: { icon: 'image', gradient: ['#6B7280', '#9CA3AF'] },
};

export function PlaceholderImage({ 
  type = 'default', 
  size = 80, 
  source,
  fallbackText,
  style,
  borderRadius,
}: PlaceholderImageProps) {
  const { theme, themeName } = useTheme();
  const config = TYPE_CONFIG[type];
  const isBrutal = themeName === 'neobrutalist';
  
  // If source is provided and valid, try to render the image
  if (source) {
    return (
      <View style={[
        styles.container,
        { 
          width: size, 
          height: size, 
          borderRadius: borderRadius ?? (isBrutal ? 0 : size / 2),
          backgroundColor: theme.colors.surfaceLight,
        },
        isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
        style,
      ]}>
        <Image 
          source={source}
          style={{ 
            width: size, 
            height: size, 
            borderRadius: borderRadius ?? (isBrutal ? 0 : size / 2),
          }}
          resizeMode="cover"
        />
      </View>
    );
  }
  
  // Render placeholder
  return (
    <View style={[
      styles.container,
      { 
        width: size, 
        height: size, 
        borderRadius: borderRadius ?? (isBrutal ? 0 : size / 2),
        backgroundColor: config.gradient[0] + '30',
      },
      isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
      style,
    ]}>
      {fallbackText ? (
        <Text style={[
          styles.fallbackText, 
          { 
            fontSize: size * 0.4,
            color: config.gradient[0],
          }
        ]}>
          {fallbackText.charAt(0).toUpperCase()}
        </Text>
      ) : (
        <Icon 
          name={config.icon} 
          size={size * 0.4} 
          color={config.gradient[0]} 
        />
      )}
    </View>
  );
}

// Composer avatar with initials
export function ComposerAvatar({ 
  name, 
  size = 50, 
  color,
  source,
  style,
}: { 
  name: string; 
  size?: number; 
  color?: string;
  source?: ImageSourcePropType;
  style?: any;
}) {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  const bgColor = color || theme.colors.primary;
  
  if (source) {
    return (
      <Image 
        source={source}
        style={[
          { 
            width: size, 
            height: size, 
            borderRadius: isBrutal ? 0 : size / 2,
          },
          isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }
  
  return (
    <View style={[
      styles.avatar,
      { 
        width: size, 
        height: size, 
        borderRadius: isBrutal ? 0 : size / 2,
        backgroundColor: bgColor + '30',
      },
      isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
      style,
    ]}>
      <Text style={[
        styles.avatarText, 
        { 
          fontSize: size * 0.4,
          color: bgColor,
        }
      ]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// Album artwork placeholder
export function AlbumArtwork({
  title,
  artist,
  size = 120,
  source,
  style,
}: {
  title?: string;
  artist?: string;
  size?: number;
  source?: ImageSourcePropType;
  style?: any;
}) {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  
  if (source) {
    return (
      <Image 
        source={source}
        style={[
          { 
            width: size, 
            height: size, 
            borderRadius: isBrutal ? 0 : 8,
          },
          isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }
  
  return (
    <View style={[
      styles.albumArt,
      { 
        width: size, 
        height: size, 
        borderRadius: isBrutal ? 0 : 8,
        backgroundColor: theme.colors.primary + '20',
      },
      isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
      style,
    ]}>
      <Icon name="disc" size={size * 0.35} color={theme.colors.primary} />
      {title && (
        <Text 
          style={[styles.albumTitle, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {title}
        </Text>
      )}
    </View>
  );
}

// Era/Period banner placeholder
export function EraBanner({
  name,
  color,
  height = 120,
  source,
  style,
}: {
  name?: string;
  color?: string;
  height?: number;
  source?: ImageSourcePropType;
  style?: any;
}) {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  const bgColor = color || theme.colors.primary;
  
  if (source) {
    return (
      <Image 
        source={source}
        style={[
          { 
            width: '100%', 
            height,
            borderRadius: isBrutal ? 0 : 12,
          },
          isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }
  
  return (
    <View style={[
      styles.eraBanner,
      { 
        height,
        borderRadius: isBrutal ? 0 : 12,
        backgroundColor: bgColor + '25',
      },
      isBrutal && { borderWidth: 2, borderColor: theme.colors.border },
      style,
    ]}>
      <Icon name="time" size={32} color={bgColor} />
      {name && (
        <Text style={[styles.eraName, { color: bgColor }]}>
          {name}
        </Text>
      )}
    </View>
  );
}

// Empty state placeholder
export function EmptyState({
  title,
  message,
  icon = 'musical-note',
  style,
}: {
  title?: string;
  message?: string;
  icon?: string;
  style?: any;
}) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.emptyState, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceLight }]}>
        <Icon name={icon} size={48} color={theme.colors.textMuted} />
      </View>
      {title && (
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
      {message && (
        <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackText: {
    fontWeight: 'bold',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
  },
  albumArt: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  albumTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  eraBanner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  eraName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
