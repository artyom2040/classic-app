import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useNetworkStatus } from '../hooks';
import { spacing, fontSize, borderRadius } from '../theme';

interface OfflineIndicatorProps {
  /** Show even when online (for testing) */
  forceShow?: boolean;
  /** Callback when user taps retry */
  onRetry?: () => void;
}

/**
 * Displays a banner at the top of the screen when offline.
 * Automatically shows/hides with animation based on network status.
 */
export function OfflineIndicator({ forceShow, onRetry }: OfflineIndicatorProps) {
  const { theme } = useTheme();
  const { isOffline, refresh } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const shouldShow = forceShow || isOffline;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: shouldShow ? 0 : -100,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [shouldShow, slideAnim]);

  const handleRetry = async () => {
    await refresh();
    onRetry?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          paddingTop: insets.top + spacing.xs,
          backgroundColor: theme.colors.error,
          pointerEvents: shouldShow ? 'auto' : 'none',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={20} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>Some features may be unavailable</Text>
        </View>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Ionicons name="refresh" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/**
 * A minimal offline dot indicator for use in headers or compact spaces.
 */
export function OfflineDot() {
  const { theme } = useTheme();
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View
      style={[styles.dot, { backgroundColor: theme.colors.error }]}
      accessibilityLabel="Offline"
      accessibilityRole="text"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
});
