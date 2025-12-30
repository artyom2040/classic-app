/**
 * IconButton - Accessible icon-only button component
 * Ensures proper accessibility for buttons that only display icons
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { hapticSelection } from '../../utils/haptics';

type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost';
type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Icon name from Ionicons (required) */
  icon: keyof typeof Ionicons.glyphMap;
  /** Accessibility label describing the button action (required for a11y) */
  accessibilityLabel: string;
  /** Button variant */
  variant?: IconButtonVariant;
  /** Button size */
  size?: IconButtonSize;
  /** Icon color override */
  color?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Accessibility hint for additional context */
  accessibilityHint?: string;
}

/**
 * IconButton - Use this for icon-only buttons to ensure accessibility
 *
 * @example
 * <IconButton
 *   icon="search"
 *   accessibilityLabel="Search"
 *   accessibilityHint="Opens the search screen"
 *   onPress={handleSearch}
 * />
 */
export function IconButton({
  icon,
  accessibilityLabel,
  accessibilityHint,
  variant = 'default',
  size = 'medium',
  color,
  style,
  disabled,
  onPress,
  ...props
}: IconButtonProps) {
  const { theme } = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    if (!disabled) {
      hapticSelection();
      onPress?.(e);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: { containerSize: 32, iconSize: 18, hitSlop: 8 },
    medium: { containerSize: 40, iconSize: 22, hitSlop: 10 },
    large: { containerSize: 48, iconSize: 26, hitSlop: 12 },
  };

  const config = sizeConfig[size];

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const base: ViewStyle = {
      width: config.containerSize,
      height: config.containerSize,
      borderRadius: config.containerSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: theme.colors.primary };
      case 'secondary':
        return { ...base, backgroundColor: theme.colors.surfaceElevated };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return { ...base, backgroundColor: theme.colors.surfaceLight };
    }
  };

  // Get icon color
  const getIconColor = (): string => {
    if (color) return color;
    if (variant === 'primary') return theme.colors.textInverse;
    return theme.colors.text;
  };

  const hitSlop = {
    top: config.hitSlop,
    bottom: config.hitSlop,
    left: config.hitSlop,
    right: config.hitSlop,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={hitSlop}
      style={[
        getVariantStyles(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Ionicons
        name={icon}
        size={config.iconSize}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
