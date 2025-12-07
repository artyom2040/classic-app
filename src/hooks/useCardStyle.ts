import { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardStyleOptions {
  /** Top border accent color */
  accentColor?: string;
  /** Whether to use elevated shadow (default: true) */
  elevated?: boolean;
  /** Custom border radius */
  borderRadius?: number;
  /** Disable all borders */
  noBorder?: boolean;
}

interface CardStyles {
  /** Main card style object */
  cardStyle: ViewStyle;
  /** Whether current theme is brutalist */
  isBrutal: boolean;
  /** Whether current theme is liquid glass */
  isGlass: boolean;
  /** The current theme object */
  theme: ReturnType<typeof useTheme>['theme'];
}

/**
 * Hook that provides consistent card styling across all themes.
 * Handles brutalist borders, glass effects, and shadows automatically.
 * 
 * @example
 * const { cardStyle, isGlass, isBrutal } = useCardStyle();
 * <View style={[cardStyle, { padding: 16 }]}>
 * 
 * @example With accent color
 * const { cardStyle } = useCardStyle({ accentColor: theme.colors.primary });
 */
export function useCardStyle(options: CardStyleOptions = {}): CardStyles {
  const { theme, themeName } = useTheme();
  const isBrutal = themeName === 'neobrutalist';
  const isGlass = themeName === 'liquidglass';

  const cardStyle = useMemo<ViewStyle>(() => {
    const { accentColor, elevated = true, borderRadius, noBorder } = options;

    const baseStyle: ViewStyle = {
      backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.6)' : theme.colors.surface,
      borderRadius: borderRadius ?? theme.borderRadius.lg,
      overflow: 'hidden',
    };

    // Brutalist theme: bold borders, no shadows
    if (isBrutal) {
      return {
        ...baseStyle,
        borderRadius: 0,
        borderWidth: noBorder ? 0 : 3,
        borderColor: theme.colors.border,
      };
    }

    // Glass theme: translucent with subtle border
    if (isGlass) {
      return {
        ...baseStyle,
        borderWidth: noBorder ? 0 : 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
      };
    }

    // Default theme: subtle shadow or outlined
    return {
      ...baseStyle,
      ...(elevated && !noBorder ? theme.shadows.sm : {}),
    };
  }, [theme, isBrutal, isGlass, options.accentColor, options.elevated, options.borderRadius, options.noBorder]);

  return {
    cardStyle,
    isBrutal,
    isGlass,
    theme,
  };
}

/**
 * Get card style with top accent border
 */
export function useAccentCardStyle(accentColor: string, options: Omit<CardStyleOptions, 'accentColor'> = {}) {
  const { cardStyle, ...rest } = useCardStyle(options);
  
  const accentCardStyle = useMemo<ViewStyle>(() => ({
    ...cardStyle,
    borderTopWidth: 3,
    borderTopColor: accentColor,
  }), [cardStyle, accentColor]);

  return {
    cardStyle: accentCardStyle,
    ...rest,
  };
}
