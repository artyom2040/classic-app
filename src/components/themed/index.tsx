/**
 * Centralized Themed Components
 * 
 * Use these components instead of raw React Native components
 * to automatically get theme-aware styling.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollViewProps,
  TouchableOpacityProps,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../theme';

// ============ Themed View Components ============

interface ThemedViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'surface' | 'surfaceLight';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  children, 
  style, 
  variant = 'default' 
}) => {
  const { theme } = useTheme();
  
  const bgColors = {
    default: theme.colors.background,
    surface: theme.colors.surface,
    surfaceLight: theme.colors.surfaceLight,
  };

  return (
    <View style={[{ backgroundColor: bgColors[variant] }, style]}>
      {children}
    </View>
  );
};

// ============ Themed ScrollView ============

interface ThemedScrollViewProps extends ScrollViewProps {
  children?: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const ThemedScrollView: React.FC<ThemedScrollViewProps> = ({ 
  children, 
  style,
  contentStyle,
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <ScrollView 
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={[{ padding: spacing.md }, contentStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// ============ Themed Text Components ============

interface ThemedTextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: 'default' | 'secondary' | 'muted' | 'primary' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  weight?: 'normal' | '500' | '600' | 'bold';
  numberOfLines?: number;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  style, 
  variant = 'default',
  size = 'md',
  weight = 'normal',
  numberOfLines,
}) => {
  const { theme } = useTheme();
  
  const colors = {
    default: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    primary: theme.colors.primary,
    error: theme.colors.error,
  };

  const sizes = {
    xs: fontSize.xs,
    sm: fontSize.sm,
    md: fontSize.md,
    lg: fontSize.lg,
    xl: fontSize.xl,
    xxl: fontSize.xxl,
    xxxl: fontSize.xxxl,
  };

  return (
    <Text 
      style={[
        { color: colors[variant], fontSize: sizes[size], fontWeight: weight },
        style
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

// ============ Themed Card ============

interface ThemedCardProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderLeft?: string; // Optional accent color for left border
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ 
  children, 
  style, 
  onPress,
  variant = 'elevated',
  padding = 'md',
  borderLeft,
}) => {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  
  const paddingValues = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: isBrutal ? 0 : borderRadius.lg,
    padding: paddingValues[padding],
    ...(variant === 'outlined' || isBrutal
      ? { borderWidth: isBrutal ? 3 : 1, borderColor: theme.colors.border }
      : theme.shadows.sm
    ),
    ...(borderLeft ? { borderLeftWidth: 4, borderLeftColor: borderLeft } : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[cardStyle, style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

// ============ Themed Button ============
// @deprecated Use `Button` from '@/components' instead - it has better loading/disabled states

interface ThemedButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  children,
  title,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  ...props 
}) => {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  
  const sizeStyles = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
    md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    outline: { 
      backgroundColor: 'transparent', 
      borderWidth: 2, 
      borderColor: theme.colors.primary 
    },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
  };

  return (
    <TouchableOpacity 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: isBrutal ? 0 : borderRadius.md,
          gap: spacing.xs,
          ...(isBrutal && { borderWidth: 3, borderColor: theme.colors.border }),
        },
        sizeStyles[size],
        variantStyles[variant],
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {icon}
      {title && (
        <Text style={{ 
          color: textColors[variant], 
          fontSize: size === 'sm' ? fontSize.sm : fontSize.md,
          fontWeight: '600',
        }}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
};

// ============ Themed Input ============

interface ThemedInputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({ 
  style,
  icon,
  ...props 
}) => {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  
  return (
    <View style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: isBrutal ? 0 : borderRadius.lg,
        paddingHorizontal: spacing.md,
        height: 48,
        ...(isBrutal 
          ? { borderWidth: 3, borderColor: theme.colors.border }
          : theme.shadows.sm
        ),
      },
      style,
    ]}>
      {icon}
      <TextInput
        style={{
          flex: 1,
          fontSize: fontSize.md,
          color: theme.colors.text,
          marginLeft: icon ? spacing.sm : 0,
        }}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
    </View>
  );
};

// ============ Themed Badge ============

interface ThemedBadgeProps {
  children?: React.ReactNode;
  label?: string;
  color?: string;
  variant?: 'filled' | 'outline';
}

export const ThemedBadge: React.FC<ThemedBadgeProps> = ({ 
  children,
  label,
  color,
  variant = 'filled',
}) => {
  const { theme } = useTheme();
  const badgeColor = color || theme.colors.primary;
  
  return (
    <View style={{
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.full,
      backgroundColor: variant === 'filled' ? badgeColor + '30' : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: badgeColor,
    }}>
      <Text style={{
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: badgeColor,
      }}>
        {label || children}
      </Text>
    </View>
  );
};

// ============ Themed Divider ============

export const ThemedDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[{
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: spacing.md,
    }, style]} />
  );
};

// ============ Themed Section Header ============

interface ThemedSectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const ThemedSectionHeader: React.FC<ThemedSectionHeaderProps> = ({ 
  title,
  action,
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    }}>
      <Text style={{
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: theme.colors.text,
      }}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={{
            fontSize: fontSize.sm,
            color: theme.colors.primary,
            fontWeight: '500',
          }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============ Themed Icon Container ============

interface ThemedIconContainerProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
}

export const ThemedIconContainer: React.FC<ThemedIconContainerProps> = ({ 
  children,
  color,
  size = 40,
}) => {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.primary;
  
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: iconColor + '30',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {children}
    </View>
  );
};

// ============ Export useTheme for convenience ============
export { useTheme } from '../../context/ThemeContext';
