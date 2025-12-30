/**
 * Enhanced Card Component
 * Modern card with gradient overlays and better shadows
 */

import React, { ReactNode } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { hapticSelection } from '../../utils/haptics';

interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Elevation level (none, sm, md, lg, xl) */
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Enable gradient overlay */
  gradient?: boolean;
  /** Gradient colors (defaults to theme gradient) */
  gradientColors?: readonly [string, string, ...string[]];
  /** Gradient direction */
  gradientDirection?: 'vertical' | 'horizontal' | 'diagonal';
  /** Border radius override */
  borderRadius?: number;
  /** Padding */
  padding?: number;
  /** Make card pressable */
  onPress?: () => void;
  /** Disable press feedback */
  activeOpacity?: number;
  /** Accessibility label for screen readers (required for pressable cards) */
  accessibilityLabel?: string;
  /** Accessibility hint describing the action */
  accessibilityHint?: string;
}

export function Card({
  children,
  style,
  elevation = 'md',
  gradient = false,
  gradientColors,
  gradientDirection = 'vertical',
  borderRadius,
  padding = 16,
  onPress,
  activeOpacity = 0.8,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius ?? theme.borderRadius.lg,
    padding,
    overflow: 'hidden',
    ...(elevation !== 'none' && theme.shadows[elevation]),
  };

  const getGradientProps = () => {
    const colors = gradientColors || theme.gradients.purpleDark;

    switch (gradientDirection) {
      case 'horizontal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
      case 'diagonal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      case 'vertical':
      default:
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    }
  };

  const content = gradient ? (
    <LinearGradient
      colors={gradientColors || theme.gradients.purpleDark}
      {...getGradientProps()}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </LinearGradient>
  ) : (
    children
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          hapticSelection();
          onPress();
        }}
        activeOpacity={activeOpacity}
        style={[cardStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{content}</View>;
}

/**
 * Card with gradient overlay (for hero cards)
 */
interface GradientCardProps extends Omit<CardProps, 'gradient'> {
  /** Overlay opacity */
  overlayOpacity?: number;
}

export function GradientCard({
  children,
  overlayOpacity = 0.8,
  gradientColors,
  gradientDirection,
  ...props
}: GradientCardProps) {
  const { theme } = useTheme();

  const overlayColors = gradientColors || [
    'transparent',
    theme.overlays.dark,
  ];

  return (
    <Card {...props} padding={0}>
      {children}
      <LinearGradient
        colors={overlayColors as any}
        start={{ x: 0, y: 0 }}
        end={gradientDirection === 'horizontal' ? { x: 1, y: 0 } : { x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity, pointerEvents: 'none' }]}
      />
    </Card>
  );
}

/**
 * Elevated card with accent border
 */
interface AccentCardProps extends CardProps {
  /** Accent color for top border */
  accentColor: string;
  /** Accent border width */
  accentWidth?: number;
}

export function AccentCard({
  accentColor,
  accentWidth = 3,
  style,
  ...props
}: AccentCardProps) {
  return (
    <Card
      {...props}
      style={[
        {
          borderTopWidth: accentWidth,
          borderTopColor: accentColor,
        },
        style,
      ]}
    />
  );
}