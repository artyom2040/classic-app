/**
 * Progress Ring Component
 * Circular progress indicator for kickstart completion
 * Based on stitch/kickstart designs
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { H3, Caption } from '../atoms/Typography';

interface ProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Ring size */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom label */
  label?: string;
  /** Custom color */
  color?: string;
  /** Custom style */
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  showPercentage = true,
  label,
  color,
  style,
}: ProgressRingProps) {
  const { theme } = useTheme();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const progressColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <H3 color={theme.colors.text}>{Math.round(progress)}%</H3>
        )}
        {label && (
          <Caption color={theme.colors.textSecondary}>{label}</Caption>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Mini Progress Ring (for smaller displays)
 */
export function MiniProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color,
}: Omit<ProgressRingProps, 'showPercentage' | 'label'>) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      showPercentage={false}
      color={color}
    />
  );
}