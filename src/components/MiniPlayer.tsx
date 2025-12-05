import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useAudio, formatTime } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';
import { haptic } from '../utils/haptics';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const { theme, themeName, isGlass } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  
  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    pause,
    resume,
    stop,
  } = useAudio();

  // Don't render if no track
  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = async () => {
    haptic('light');
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const handleClose = async () => {
    haptic('light');
    await stop();
  };

  const renderContent = () => (
    <>
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: t.colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%`, backgroundColor: t.colors.primary }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* Track info */}
        <View style={styles.trackInfo}>
          <View style={[styles.albumArt, { backgroundColor: t.colors.primary + '30' }]}>
            <Ionicons name="musical-notes" size={20} color={t.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: t.colors.text }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.composer, { color: t.colors.textMuted }]} numberOfLines={1}>
              {currentTrack.composer}
            </Text>
          </View>
        </View>

        {/* Time */}
        <Text style={[styles.time, { color: t.colors.textMuted }]}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>

        {/* Controls */}
        <View style={styles.controls}>
          {isLoading ? (
            <ActivityIndicator size="small" color={t.colors.primary} />
          ) : (
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: t.colors.primary }]}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: t.colors.surfaceLight }]}
            onPress={handleClose}
          >
            <Ionicons name="close" size={18} color={t.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // Glass theme with blur
  if (isGlass) {
    return (
      <View style={[styles.container, { bottom: insets.bottom + 88 }]}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {renderContent()}
        </BlurView>
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        { 
          bottom: insets.bottom + 88,
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
        },
        isBrutal && { borderWidth: 2, borderRadius: 0 },
        !isBrutal && t.shadows.md,
      ]}
    >
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  composer: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  time: {
    fontSize: fontSize.xs,
    marginRight: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
