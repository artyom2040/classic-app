/**
 * AnimatedScreen - Screen wrapper with entrance animations
 * Provides smooth fade-in, slide-up, and scale animations for screens
 */

import React, { ReactNode, useEffect } from 'react';
import { ViewStyle, StyleProp, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

type AnimationType = 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'fadeSlideUp';

interface AnimatedScreenProps {
  /** Screen content */
  children: ReactNode;
  /** Animation type */
  animation?: AnimationType;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Whether to animate (useful for conditional animation) */
  animate?: boolean;
}

const springConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

/**
 * AnimatedScreen wraps screen content with entrance animations
 *
 * @example
 * <AnimatedScreen animation="fadeSlideUp" delay={100}>
 *   <YourScreenContent />
 * </AnimatedScreen>
 */
export function AnimatedScreen({
  children,
  animation = 'fadeSlideUp',
  duration = 400,
  delay = 0,
  style,
  animate = true,
}: AnimatedScreenProps) {
  const progress = useSharedValue(animate ? 0 : 1);
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (animate) {
      progress.value = withDelay(
        delay,
        animation === 'scale' || animation === 'slideUp'
          ? withSpring(1, springConfig)
          : withTiming(1, {
              duration,
              easing: Easing.out(Easing.cubic),
            })
      );
    }
  }, [animate, delay, duration, animation, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animation) {
      case 'fade':
        return {
          opacity: progress.value,
        };

      case 'slideUp':
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.8, 1]),
          transform: [
            {
              translateY: interpolate(
                progress.value,
                [0, 1],
                [height * 0.1, 0],
                Extrapolation.CLAMP
              ),
            },
          ],
        };

      case 'slideRight':
        return {
          opacity: progress.value,
          transform: [
            {
              translateX: interpolate(
                progress.value,
                [0, 1],
                [-50, 0],
                Extrapolation.CLAMP
              ),
            },
          ],
        };

      case 'scale':
        return {
          opacity: progress.value,
          transform: [
            {
              scale: interpolate(
                progress.value,
                [0, 1],
                [0.95, 1],
                Extrapolation.CLAMP
              ),
            },
          ],
        };

      case 'fadeSlideUp':
      default:
        return {
          opacity: progress.value,
          transform: [
            {
              translateY: interpolate(
                progress.value,
                [0, 1],
                [20, 0],
                Extrapolation.CLAMP
              ),
            },
          ],
        };
    }
  });

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedItem - For staggered list item animations
 */
interface AnimatedItemProps {
  children: ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
  /** Delay between each item animation */
  staggerDelay?: number;
}

export function AnimatedItem({
  children,
  index,
  style,
  staggerDelay = 50,
}: AnimatedItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = index * staggerDelay;
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, springConfig));
  }, [index, staggerDelay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/**
 * Hook for creating custom entrance animations
 */
export function useEntranceAnimation(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, springConfig));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}
