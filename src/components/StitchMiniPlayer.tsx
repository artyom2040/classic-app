/**
 * StitchMiniPlayer - Floating glassmorphic mini player for Stitch theme
 * 
 * Features:
 * - Floating pill-shaped player with blur backdrop
 * - Spinning album art animation when playing
 * - Compact controls for small screen real estate
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { haptic } from '../utils/haptics';

interface StitchMiniPlayerProps {
  currentTrack: {
    id?: string;
    title?: string;
    artist?: string;
  } | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export function StitchMiniPlayer({
  currentTrack,
  isPlaying,
  isLoading,
  onPlayPause,
}: StitchMiniPlayerProps) {
  const { theme } = useTheme();
  const t = theme;
  const insets = useSafeAreaInsets();

  // Spinning animation for album art
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isPlaying) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [isPlaying, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: insets.bottom + 24 }]}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <View style={styles.inner}>
          {/* Spinning Album Art */}
          <Animated.View style={[styles.albumArt, { transform: [{ rotate: spin }] }]}>
            <View style={styles.albumInner}>
              <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title || 'Unknown'}
            </Text>
            <Text style={styles.nowPlaying}>
              {isPlaying ? 'Now Playing' : 'Paused'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => haptic('light')}
              accessibilityLabel="Previous track"
            >
              <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="small" color={t.colors.primary} />
            ) : (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: t.colors.primary }]}
                onPress={onPlayPause}
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                  style={!isPlaying ? { marginLeft: 2 } : undefined}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => haptic('light')}
              accessibilityLabel="Next track"
            >
              <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    width: '90%',
    maxWidth: 360,
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  blurContainer: {
    backgroundColor: 'rgba(22, 16, 34, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    gap: 12,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  albumInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nowPlaying: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5417cf',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    padding: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5417cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
