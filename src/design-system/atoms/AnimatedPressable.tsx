/**
 * AnimatedPressable - Pressable component with smooth scale animation feedback
 * Uses react-native-reanimated for butter-smooth 60fps animations
 */

import React, { ReactNode, useCallback } from 'react';
import {
  Pressable,
  ViewStyle,
  StyleProp,
  PressableStateCallbackType,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { hapticSelection } from '../../utils/haptics';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  /** Content to render inside the pressable */
  children: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Scale amount when pressed (default: 0.97) */
  pressScale?: number;
  /** Enable haptic feedback (default: true) */
  hapticFeedback?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Hit slop for touch area */
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

const springConfig = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
};

/**
 * AnimatedPressable provides smooth scale feedback on press
 *
 * @example
 * <AnimatedPressable onPress={handlePress} pressScale={0.95}>
 *   <Text>Press Me</Text>
 * </AnimatedPressable>
 */
export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  pressScale = 0.97,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
  hitSlop,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(pressScale, springConfig);
  }, [pressScale, scale]);

  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, springConfig);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (hapticFeedback) {
      hapticSelection();
    }
    onPress?.();
  }, [hapticFeedback, onPress]);

  const handleLongPress = useCallback(() => {
    if (hapticFeedback) {
      hapticSelection();
    }
    onLongPress?.();
  }, [hapticFeedback, onLongPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableView
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      disabled={disabled}
      style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={hitSlop}
    >
      {children}
    </AnimatedPressableView>
  );
}

/**
 * Hook to add scale animation to any component
 * Returns animated style and press handlers
 */
export function useScaleAnimation(pressScale = 0.97) {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(pressScale, springConfig);
  }, [pressScale, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}
