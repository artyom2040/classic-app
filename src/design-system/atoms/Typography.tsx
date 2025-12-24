/**
 * Typography Components
 * Pre-styled text components using the typography system
 */

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography, TypographyVariant, getTypographyStyle, fontFamilies } from '../../theme/typography';
import { fontWeight } from '../../theme/tokens';
import { useFontsLoaded } from '../../context/FontContext';
import { useTheme } from '../../context/ThemeContext';

interface StyledTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  italic?: boolean;
  numberOfLines?: number;
}

/**
 * Base styled text component
 */
export function StyledText({
  variant = 'body',
  color,
  align,
  weight,
  italic,
  style,
  children,
  ...props
}: StyledTextProps) {
  const { fontsLoaded } = useFontsLoaded();
  const { theme } = useTheme();

  const baseStyle = getTypographyStyle(variant, fontsLoaded);

  const textStyle: TextStyle = {
    ...baseStyle,
    color: color || theme.colors.text,
    textAlign: align,
  };

  // Apply weight override if provided
  if (weight && fontsLoaded) {
    const isSans = variant.startsWith('body') || variant.startsWith('h') || variant.startsWith('label') || variant.startsWith('caption') || variant.startsWith('button');
    if (isSans) {
      textStyle.fontFamily = fontFamilies.sans[weight];
      textStyle.fontWeight = fontWeight[weight];
    } else if (variant.startsWith('display') || variant.startsWith('quote')) {
      if (weight === 'bold' || weight === 'semibold') {
        textStyle.fontFamily = fontFamilies.serif.bold;
        textStyle.fontWeight = fontWeight.bold;
      } else {
        textStyle.fontFamily = fontFamilies.serif.regular;
        textStyle.fontWeight = fontWeight.regular;
      }
    }
  }

  if (italic) {
    textStyle.fontStyle = 'italic';
  }

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
}

// ============================================
// DISPLAY COMPONENTS
// ============================================

export function Display1(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="display1" {...props} />;
}

export function Display2(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="display2" {...props} />;
}

// ============================================
// HEADING COMPONENTS
// ============================================

export function H1(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="h1" {...props} />;
}

export function H2(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="h2" {...props} />;
}

export function H3(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="h3" {...props} />;
}

export function H4(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="h4" {...props} />;
}

// ============================================
// BODY COMPONENTS
// ============================================

export function BodyLarge(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="bodyLarge" {...props} />;
}

export function Body(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="body" {...props} />;
}

export function BodySmall(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="bodySmall" {...props} />;
}

// ============================================
// LABEL COMPONENTS
// ============================================

export function LabelLarge(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="labelLarge" {...props} />;
}

export function Label(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="label" {...props} />;
}

export function LabelSmall(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="labelSmall" {...props} />;
}

// ============================================
// CAPTION COMPONENTS
// ============================================

export function Caption(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="caption" {...props} />;
}

export function CaptionSmall(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="captionSmall" {...props} />;
}

export function Tiny(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="captionSmall" {...props} />;
}

// ============================================
// QUOTE COMPONENTS
// ============================================

export function Quote(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="quote" {...props} />;
}

export function QuoteSmall(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="quoteSmall" {...props} />;
}

// ============================================
// BUTTON TEXT COMPONENTS
// ============================================

export function ButtonText(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="button" {...props} />;
}

export function ButtonTextLarge(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="buttonLarge" {...props} />;
}

export function ButtonTextSmall(props: Omit<StyledTextProps, 'variant'>) {
  return <StyledText variant="buttonSmall" {...props} />;
}