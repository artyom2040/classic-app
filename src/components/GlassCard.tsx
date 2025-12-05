import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderColor?: string;
  noBorder?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 80,
  tint = 'light',
  onPress,
  padding = 'md',
  borderColor,
  noBorder = false,
}: GlassCardProps) {
  const { theme, themeName } = useTheme();
  const isGlass = themeName === 'liquidglass';
  
  const paddingValues = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  // For non-glass themes, fall back to regular card
  if (!isGlass) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={[
          styles.fallbackCard,
          {
            backgroundColor: theme.colors.surface,
            padding: paddingValues[padding],
            borderRadius: theme.borderRadius.lg,
          },
          !noBorder && { borderWidth: 1, borderColor: theme.colors.border },
          theme.shadows.sm,
          style,
        ]}
      >
        {children}
      </Wrapper>
    );
  }

  // Glass effect for liquidglass theme
  const cardContent = (
    <View
      style={[
        styles.glassContainer,
        {
          borderRadius: borderRadius.lg,
          padding: paddingValues[padding],
        },
        !noBorder && {
          borderWidth: 1,
          borderColor: borderColor || 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        // Android fallback - semi-transparent background
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
            },
          ]}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

// Glass-styled section for backgrounds
interface GlassBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassBackground({ children, style, intensity = 60 }: GlassBackgroundProps) {
  const { themeName } = useTheme();
  const isGlass = themeName === 'liquidglass';

  if (!isGlass) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.backgroundContainer, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255, 255, 255, 0.6)' },
          ]}
        />
      )}
      {children}
    </View>
  );
}

// Floating glass pill for badges/tags
interface GlassPillProps {
  children: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export function GlassPill({ children, color, style }: GlassPillProps) {
  const { theme, themeName } = useTheme();
  const isGlass = themeName === 'liquidglass';

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: isGlass 
            ? (color ? `${color}20` : 'rgba(255, 255, 255, 0.5)')
            : (color ? `${color}20` : theme.colors.surfaceLight),
          borderColor: isGlass
            ? (color || 'rgba(255, 255, 255, 0.4)')
            : (color || theme.colors.border),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Glass-styled tab bar background
export function GlassTabBar({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { themeName } = useTheme();
  const isGlass = themeName === 'liquidglass';

  if (!isGlass) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.tabBarContainer, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={100}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
          ]}
        />
      )}
      <View style={styles.tabBarBorder} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackCard: {
    overflow: 'hidden',
  },
  glassContainer: {
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  content: {
    zIndex: 1,
  },
  backgroundContainer: {
    overflow: 'hidden',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tabBarContainer: {
    overflow: 'hidden',
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(60, 60, 67, 0.12)',
  },
});
