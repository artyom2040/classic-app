/**
 * Design Tokens - Enhanced for Stitch UI
 * Centralized design values for consistency across the app
 */

// ============================================
// SPACING SCALE
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================
// TYPOGRAPHY SCALE
// ============================================
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 30,
  xxxl: 36,
  hero: 40,
  display: 48,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
} as const;

// ============================================
// SHADOWS (Platform-specific with web boxShadow)
// ============================================
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: 'none',
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 18,
    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.25)',
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 24,
    boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.3)',
  },
} as const;

// Purple-tinted shadows for dark theme
export const purpleShadows = {
  sm: {
    shadowColor: '#5417cf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    boxShadow: '0px 2px 8px rgba(84, 23, 207, 0.15)',
  },
  md: {
    shadowColor: '#5417cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    boxShadow: '0px 4px 16px rgba(84, 23, 207, 0.2)',
  },
  lg: {
    shadowColor: '#5417cf',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    boxShadow: '0px 8px 24px rgba(84, 23, 207, 0.25)',
  },
  xl: {
    shadowColor: '#5417cf',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 18,
    boxShadow: '0px 12px 32px rgba(84, 23, 207, 0.3)',
  },
} as const;

// ============================================
// OPACITY LEVELS
// ============================================
export const opacity = {
  disabled: 0.38,
  inactive: 0.54,
  secondary: 0.74,
  active: 0.87,
  full: 1,
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
} as const;

// ============================================
// GRADIENTS
// ============================================
export const gradients = {
  purple: ['#5417cf', '#7b3ff0'],
  purpleDark: ['#221a32', '#161121'],
  purpleLight: ['#7b3ff0', '#a593c8'],
  teal: ['#0d9488', '#4ECDC4'],
  sunset: ['#5417cf', '#FF6B6B', '#4ECDC4'],
  midnight: ['#161121', '#221a32', '#352c4a'],
} as const;

// ============================================
// OVERLAY COLORS
// ============================================
export const overlays = {
  dark: 'rgba(22, 17, 33, 0.8)',
  darkHeavy: 'rgba(22, 17, 33, 0.95)',
  light: 'rgba(255, 255, 255, 0.8)',
  lightHeavy: 'rgba(255, 255, 255, 0.95)',
  shimmer: 'rgba(255, 255, 255, 0.1)',
  highlight: 'rgba(84, 23, 207, 0.15)',
  purpleGlow: 'rgba(84, 23, 207, 0.3)',
} as const;

// ============================================
// BREAKPOINTS (for responsive design)
// ============================================
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// ============================================
// ICON SIZES
// ============================================
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

// Type exports for TypeScript
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSize;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Gradient = keyof typeof gradients;
export type Overlay = keyof typeof overlays;