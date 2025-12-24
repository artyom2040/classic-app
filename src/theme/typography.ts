/**
 * Typography System - Enhanced with WorkSans & NotoSerif
 * Provides consistent text styles across the app
 */

import { TextStyle } from 'react-native';
import { fontSize, fontWeight, lineHeight } from './tokens';

// ============================================
// FONT FAMILIES
// ============================================
export const fontFamilies = {
  // Serif - for elegant headings and quotes
  serif: {
    regular: 'NotoSerif_400Regular',
    bold: 'NotoSerif_700Bold',
  },
  // Sans - for body text and UI
  sans: {
    regular: 'WorkSans_400Regular',
    medium: 'WorkSans_500Medium',
    semibold: 'WorkSans_600SemiBold',
    bold: 'WorkSans_700Bold',
  },
  // System fallback
  system: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
} as const;

// ============================================
// TEXT STYLES
// ============================================

// Display styles (largest, for hero sections)
export const displayStyles = {
  display1: {
    fontFamily: fontFamilies.serif.bold,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,
  
  display2: {
    fontFamily: fontFamilies.serif.bold,
    fontSize: fontSize.hero,
    lineHeight: fontSize.hero * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,
};

// Heading styles
export const headingStyles = {
  h1: {
    fontFamily: fontFamilies.sans.bold,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  } as TextStyle,
  
  h2: {
    fontFamily: fontFamilies.sans.bold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.normal,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  } as TextStyle,
  
  h3: {
    fontFamily: fontFamilies.sans.semibold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  } as TextStyle,
  
  h4: {
    fontFamily: fontFamilies.sans.semibold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    fontWeight: fontWeight.semibold,
  } as TextStyle,
};

// Body text styles
export const bodyStyles = {
  bodyLarge: {
    fontFamily: fontFamilies.sans.regular,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
    fontWeight: fontWeight.regular,
  } as TextStyle,
  
  body: {
    fontFamily: fontFamilies.sans.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.relaxed,
    fontWeight: fontWeight.regular,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: fontFamilies.sans.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.regular,
  } as TextStyle,
};

// Label styles (for UI elements)
export const labelStyles = {
  labelLarge: {
    fontFamily: fontFamilies.sans.medium,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.1,
  } as TextStyle,
  
  label: {
    fontFamily: fontFamilies.sans.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  } as TextStyle,
  
  labelSmall: {
    fontFamily: fontFamilies.sans.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
};

// Caption styles (smallest text)
export const captionStyles = {
  caption: {
    fontFamily: fontFamilies.sans.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.regular,
  } as TextStyle,
  
  captionSmall: {
    fontFamily: fontFamilies.sans.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: fontWeight.regular,
  } as TextStyle,
};

// Quote styles (serif for elegance)
export const quoteStyles = {
  quote: {
    fontFamily: fontFamilies.serif.regular,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
    fontWeight: fontWeight.regular,
    fontStyle: 'italic' as const,
  } as TextStyle,
  
  quoteSmall: {
    fontFamily: fontFamilies.serif.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.relaxed,
    fontWeight: fontWeight.regular,
    fontStyle: 'italic' as const,
  } as TextStyle,
};

// Button text styles
export const buttonStyles = {
  buttonLarge: {
    fontFamily: fontFamilies.sans.semibold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  } as TextStyle,
  
  button: {
    fontFamily: fontFamilies.sans.semibold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  } as TextStyle,
  
  buttonSmall: {
    fontFamily: fontFamilies.sans.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  } as TextStyle,
};

// ============================================
// COMBINED TYPOGRAPHY OBJECT
// ============================================
export const typography = {
  ...displayStyles,
  ...headingStyles,
  ...bodyStyles,
  ...labelStyles,
  ...captionStyles,
  ...quoteStyles,
  ...buttonStyles,
} as const;

// Type export
export type TypographyVariant = keyof typeof typography;

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Get typography style by variant name
 * Falls back to system font if custom fonts not loaded
 */
export function getTypographyStyle(
  variant: TypographyVariant,
  fontsLoaded: boolean = true
): TextStyle {
  const style = typography[variant];
  
  if (!fontsLoaded) {
    // Fallback to system font
    return {
      ...style,
      fontFamily: 'System',
    };
  }
  
  return style;
}