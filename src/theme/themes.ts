// Theme definitions for Context Composer
// Simplified to just Dark and Light modes with Stitch design aesthetic

export type ThemeName = 'dark' | 'light';

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    surfaceLight: string;
    surfaceElevated: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    gradientStart: string;
    gradientEnd: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      hero: number;
    };
  };
  cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass' | 'brutal';
  isDark: boolean;
}

// ============================================
// DARK THEME (Stitch-inspired Premium Dark)
// ============================================
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Premium dark mode with purple accents',
  colors: {
    // Base colors - warm dark with purple tint
    background: '#161121',           // Deep purple-black
    surface: '#221a32',              // Purple-tinted surface
    surfaceLight: '#2d2442',         // Lighter purple surface
    surfaceElevated: '#352c4a',      // Elevated elements
    // Primary - vibrant purple
    primary: '#5417cf',              // Purple accent
    primaryLight: '#7b3ff0',         // Lighter purple
    secondary: '#a593c8',            // Muted purple for secondary text
    accent: '#4ECDC4',               // Teal accent
    // Text - high contrast on dark
    text: '#FFFFFF',
    textSecondary: '#a593c8',        // Purple-tinted secondary
    textMuted: '#6b5a8a',            // Muted purple
    textInverse: '#161121',
    // Borders - subtle
    border: 'rgba(255, 255, 255, 0.05)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    // Gradients - for hero cards
    gradientStart: '#221a32',
    gradientEnd: '#161121',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, full: 9999 },
  shadows: {
    // Purple-tinted shadows for depth
    sm: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
    md: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 30, hero: 40 },
  },
  cardStyle: 'elevated',
  isDark: true,
};

// ============================================
// LIGHT THEME (Stitch-inspired Premium Light)
// ============================================
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean light mode with purple accents',
  colors: {
    // Base colors - clean white with subtle purple tint
    background: '#FAFAFA',           // Off-white
    surface: '#FFFFFF',              // Pure white
    surfaceLight: '#F5F3F8',         // Very light purple tint
    surfaceElevated: '#FFFFFF',      // White elevated
    // Primary - vibrant purple (same as dark)
    primary: '#5417cf',              // Purple accent
    primaryLight: '#7b3ff0',         // Lighter purple
    secondary: '#6B5A8A',            // Muted purple
    accent: '#0d9488',               // Teal accent
    // Text - dark for readability
    text: '#1a1025',                 // Dark purple-black
    textSecondary: '#4a3d5c',        // Dark purple secondary
    textMuted: '#7a6b94',            // Muted purple
    textInverse: '#FFFFFF',
    // Borders - subtle
    border: 'rgba(90, 70, 130, 0.1)',
    borderLight: 'rgba(90, 70, 130, 0.05)',
    // Status colors  
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    // Gradients
    gradientStart: '#FFFFFF',
    gradientEnd: '#F5F3F8',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, full: 9999 },
  shadows: {
    // Soft purple-tinted shadows
    sm: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    md: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
    lg: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 30, hero: 40 },
  },
  cardStyle: 'elevated',
  isDark: false,
};

// Theme map for easy access
export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};

export const themeList = Object.values(themes);
