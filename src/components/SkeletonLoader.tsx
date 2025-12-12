import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ 
  width: w = '100%', 
  height = 16, 
  borderRadius: br = 4,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: w,
          height,
          borderRadius: br,
          backgroundColor: theme.colors.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  const { theme, themeName, isDark } = useTheme();
  const isBrutal = false;
  
  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.colors.surface },
      isBrutal ? { borderWidth: 2, borderColor: theme.colors.border } : {},
    ]}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.cardContent}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonHeroCard() {
  const { theme, themeName, isDark } = useTheme();
  const isBrutal = false;
  
  return (
    <View style={[
      styles.heroCard,
      { backgroundColor: theme.colors.surface },
      isBrutal ? { borderWidth: 2, borderColor: theme.colors.border } : {},
    ]}>
      <Skeleton width={100} height={24} />
      <Skeleton width="80%" height={32} style={{ marginTop: spacing.md }} />
      <Skeleton width="100%" height={16} style={{ marginTop: spacing.sm }} />
      <Skeleton width="60%" height={16} style={{ marginTop: 4 }} />
    </View>
  );
}

export function SkeletonListItem() {
  const { theme, themeName, isDark } = useTheme();
  const isBrutal = false;
  
  return (
    <View style={[
      styles.listItem,
      { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
      isBrutal ? { borderWidth: 2, borderColor: theme.colors.border } : {},
    ]}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  const { theme, themeName, isDark } = useTheme();
  const isBrutal = false;
  const itemWidth = (width - spacing.md * 3) / 2;
  
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View 
          key={i}
          style={[
            styles.gridItem,
            { 
              width: itemWidth, 
              backgroundColor: theme.colors.surface,
            },
            isBrutal ? { borderWidth: 2, borderColor: theme.colors.border } : {},
          ]}
        >
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width="60%" height={14} style={{ marginTop: spacing.sm }} />
          <Skeleton width="40%" height={10} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonComposerDetail() {
  return (
    <View style={styles.composerDetail}>
      <View style={styles.composerHeader}>
        <Skeleton width={100} height={100} borderRadius={50} />
        <Skeleton width={200} height={28} style={{ marginTop: spacing.md }} />
        <Skeleton width={100} height={16} style={{ marginTop: spacing.xs }} />
        <View style={styles.tagRow}>
          <Skeleton width={80} height={24} borderRadius={12} />
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      </View>
      <View style={styles.section}>
        <Skeleton width={120} height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={100} borderRadius={borderRadius.lg} />
      </View>
      <View style={styles.section}>
        <Skeleton width={100} height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={60} borderRadius={borderRadius.md} />
        <Skeleton width="100%" height={60} borderRadius={borderRadius.md} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  heroCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  composerDetail: {
    padding: spacing.md,
  },
  composerHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
});
