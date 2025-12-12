/**
 * SpotlightCard - Card for monthly spotlight carousel
 * Tall card with image overlay and gradient
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SpotlightCardProps {
  title: string;
  subtitle?: string;
  imageSource?: ImageSourcePropType;
  imageUri?: string;
  onPress?: () => void;
  showPlayIcon?: boolean;
}

export function SpotlightCard({
  title,
  subtitle,
  imageSource,
  imageUri,
  onPress,
  showPlayIcon = true,
}: SpotlightCardProps) {
  const { theme, themeName } = useTheme();
  const isStitch = themeName === 'stitch';

  if (!isStitch) return null;

  const backgroundSource = imageSource || (imageUri ? { uri: imageUri } : undefined);

  const content = (
    <View style={[styles.container, theme.shadows.md]}>
      {backgroundSource ? (
        <ImageBackground
          source={backgroundSource}
          style={styles.imageBackground}
          imageStyle={styles.image}
          resizeMode="cover"
        >
          {/* Gradient overlay - from transparent to dark at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.8)']}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            {/* Play button */}
            {showPlayIcon && (
              <View style={styles.playButtonWrapper}>
                <View style={styles.playButton}>
                  <Ionicons name="play-arrow" size={20} color="#FFFFFF" />
                </View>
              </View>
            )}

            {/* Bottom text content */}
            <View style={styles.textContent}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={['#2d2442', '#221a32']}
          style={[styles.imageBackground, styles.fallback]}
        >
          {/* Play button */}
          {showPlayIcon && (
            <View style={styles.playButtonWrapper}>
              <View style={styles.playButton}>
                <Ionicons name="library-music" size={20} color="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Bottom text content */}
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </LinearGradient>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.wrapper}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    width: 280,
    height: 360,
  },
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#221a32',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  image: {
    opacity: 0.8,
  },
  fallback: {
    justifyContent: 'space-between',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  playButtonWrapper: {
    alignItems: 'flex-start',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  textContent: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
