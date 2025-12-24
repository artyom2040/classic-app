/**
 * Hero Card Component
 * Large, immersive card with image background and gradient overlay
 * Based on stitch/curated_home_screen designs
 */

import React from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Display2, H3, Body, Label } from '../atoms/Typography';
import { hapticSelection } from '../../utils/haptics';

interface HeroCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Background image */
  image: ImageSourcePropType;
  /** Badge text (e.g., "New", "Featured") */
  badge?: string;
  /** Badge color */
  badgeColor?: string;
  /** Icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Height of the card */
  height?: number;
  /** Gradient overlay colors */
  gradientColors?: readonly [string, string, ...string[]];
  /** On press handler */
  onPress?: () => void;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
}

export function HeroCard({
  title,
  subtitle,
  description,
  image,
  badge,
  badgeColor,
  icon,
  height = 280,
  gradientColors,
  onPress,
  style,
}: HeroCardProps) {
  const { theme } = useTheme();

  const defaultGradient: readonly [string, string, string] = [
    'rgba(22, 17, 33, 0)',
    'rgba(22, 17, 33, 0.7)',
    'rgba(22, 17, 33, 0.95)',
  ];

  const handlePress = () => {
    if (onPress) {
      hapticSelection();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={!onPress}
      style={[styles.container, { height }, theme.shadows.lg, style]}
    >
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={gradientColors || defaultGradient}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Badge */}
            {badge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeColor || theme.colors.primary },
                ]}
              >
                <Label color={theme.colors.textInverse}>{badge}</Label>
              </View>
            )}

            {/* Content */}
            <View style={styles.textContent}>
              {subtitle && (
                <Body color={theme.colors.textSecondary} style={styles.subtitle}>
                  {subtitle}
                </Body>
              )}

              <Display2 color={theme.colors.textInverse} numberOfLines={2}>
                {title}
              </Display2>

              {description && (
                <Body
                  color={theme.colors.textSecondary}
                  numberOfLines={2}
                  style={styles.description}
                >
                  {description}
                </Body>
              )}

              {/* Icon indicator */}
              {icon && (
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={icon}
                    size={24}
                    color={theme.colors.textInverse}
                  />
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  imageStyle: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  textContent: {
    gap: 8,
  },
  subtitle: {
    marginBottom: 4,
  },
  description: {
    marginTop: 8,
  },
  iconContainer: {
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});