/**
 * Enhanced Button Component
 * Modern button with variants, sizes, and animations
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ButtonText, ButtonTextLarge, ButtonTextSmall } from './Typography';
import { hapticSelection } from '../../utils/haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
type ButtonSize = 'small' | 'medium' | 'large';

interface EnhancedButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text */
  title: string;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Accessibility hint describing the action */
  accessibilityHint?: string;
  /** Enable scale animation on press (default: true) */
  animated?: boolean;
  /** Scale amount when pressed (default: 0.97) */
  pressScale?: number;
}

const springConfig = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
};

export function EnhancedButton({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  animated = true,
  pressScale = 0.97,
  ...props
}: EnhancedButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (animated) {
      scale.value = withSpring(pressScale, springConfig);
    }
  }, [animated, pressScale, scale]);

  const handlePressOut = useCallback(() => {
    if (animated) {
      scale.value = withSpring(1, springConfig);
    }
  }, [animated, scale]);

  const handlePress = (e: GestureResponderEvent) => {
    if (!disabled && !loading) {
      hapticSelection();
      onPress?.(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Accessibility state for screen readers
  const accessibilityState = {
    disabled: disabled || loading,
    busy: loading,
  };

  // Size configurations
  const sizeConfig = {
    small: {
      height: 36,
      paddingHorizontal: 16,
      iconSize: 16,
      TextComponent: ButtonTextSmall,
    },
    medium: {
      height: 48,
      paddingHorizontal: 24,
      iconSize: 20,
      TextComponent: ButtonText,
    },
    large: {
      height: 56,
      paddingHorizontal: 32,
      iconSize: 24,
      TextComponent: ButtonTextLarge,
    },
  };

  const config = sizeConfig[size];
  const TextComponent = config.TextComponent;

  // Variant styles
  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: config.height,
      paddingHorizontal: config.paddingHorizontal,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          ...theme.shadows.md,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceElevated,
          ...theme.shadows.sm,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return baseStyle;
      default:
        return baseStyle;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return theme.colors.textInverse;
      case 'secondary':
        return theme.colors.text;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  const buttonStyle = getVariantStyle();
  const textColor = getTextColor();

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={config.iconSize} color={textColor} />
          )}
          <TextComponent color={textColor} style={textStyle}>
            {title}
          </TextComponent>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={config.iconSize} color={textColor} />
          )}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        style={animated ? animatedStyle : undefined}
        {...props}
      >
        <LinearGradient
          colors={theme.gradients.purple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyle, style, disabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      style={[buttonStyle, style, disabled && styles.disabled, animated && animatedStyle]}
      {...props}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});