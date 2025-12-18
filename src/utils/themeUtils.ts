/**
 * Theme utilities for consistent theming across components
 */

import { Theme } from '../theme/themes';

/**
 * Gets theme-aware colors for common UI elements
 */
export const getThemeColors = (theme: Theme) => ({
  // Background colors
  background: theme.colors.background,
  surface: theme.colors.surface,
  surfaceLight: theme.colors.surfaceLight,
  surfaceElevated: theme.colors.surfaceElevated,
  
  // Text colors
  text: theme.colors.text,
  textSecondary: theme.colors.textSecondary,
  textMuted: theme.colors.textMuted,
  textInverse: theme.colors.textInverse,
  
  // Accent and primary
  primary: theme.colors.primary,
  primaryLight: theme.colors.primaryLight,
  secondary: theme.colors.secondary,
  accent: theme.colors.accent,
  
  // Borders and dividers
  border: theme.colors.border,
  borderLight: theme.colors.borderLight,
  
  // Status colors
  success: theme.colors.success,
  warning: theme.colors.warning,
  error: theme.colors.error,
  
  // Gradients
  gradientStart: theme.colors.gradientStart,
  gradientEnd: theme.colors.gradientEnd,
});

/**
 * Gets theme-aware spacing values
 */
export const getThemeSpacing = (theme: Theme) => theme.spacing;

/**
 * Gets theme-aware border radius values
 */
export const getThemeBorderRadius = (theme: Theme) => theme.borderRadius;

/**
 * Gets theme-aware shadows
 */
export const getThemeShadows = (theme: Theme) => theme.shadows;

/**
 * Gets theme-aware typography
 */
export const getThemeTypography = (theme: Theme) => theme.typography;

/**
 * Creates theme-aware styles for common patterns
 */
export const createThemeStyles = (theme: Theme) => {
  const colors = getThemeColors(theme);
  const spacing = getThemeSpacing(theme);
  const borderRadius = getThemeBorderRadius(theme);
  
  return {
    // Card styles
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    
    // Button styles
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    
    // Input styles
    input: {
      backgroundColor: colors.surfaceLight,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    
    // Badge styles
    badge: {
      backgroundColor: colors.surfaceLight,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    
    // Divider styles
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    
    // Avatar styles
    avatar: {
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
  };
};

/**
 * Gets theme-aware elevation styles
 */
export const getElevationStyles = (theme: Theme, level: 'sm' | 'md' | 'lg' = 'sm') => {
  const shadows = getThemeShadows(theme);
  return shadows[level];
};

/**
 * Checks if theme is dark
 */
export const isDarkTheme = (theme: Theme): boolean => theme.isDark;

/**
 * Gets theme name
 */
export const getThemeName = (theme: Theme): string => theme.name;

/**
 * Creates responsive styles based on theme
 */
export const createResponsiveStyles = (theme: Theme, isDesktop: boolean) => {
  const baseStyles = createThemeStyles(theme);
  
  return {
    ...baseStyles,
    container: {
      ...baseStyles.card,
      ...(isDesktop && {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        marginHorizontal: 'auto',
      }),
    },
  };
};
