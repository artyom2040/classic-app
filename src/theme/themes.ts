// Theme definitions for Context Composer

export type ThemeName = 'dark' | 'light' | 'classic' | 'skeuomorphic' | 'neobrutalist' | 'liquidglass' | 'stitch';

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
// DARK THEME (Current Default)
// ============================================
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Midnight',
  description: 'Dark elegance for night listening',
  colors: {
    background: '#0D0D12',
    surface: '#1A1A24',
    surfaceLight: '#252532',
    surfaceElevated: '#2A2A3A',
    primary: '#D4AF37',
    primaryLight: '#E8C860',
    secondary: '#9B7DD4',
    accent: '#4ECDC4',
    text: '#FFFFFF',
    textSecondary: '#B0B0C0',
    textMuted: '#6B6B80',
    textInverse: '#0D0D12',
    border: '#2A2A3A',
    borderLight: '#3A3A4A',
    success: '#4CAF50',
    warning: '#FFB74D',
    error: '#EF5350',
    gradientStart: '#1A1A24',
    gradientEnd: '#0D0D12',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, hero: 36 },
  },
  cardStyle: 'elevated',
  isDark: true,
};

// ============================================
// LIGHT THEME
// ============================================
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Daylight',
  description: 'Clean and bright for easy reading',
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceLight: '#F0F2F5',
    surfaceElevated: '#FFFFFF',
    primary: '#8B6914',
    primaryLight: '#C9A227',
    secondary: '#6B4CA8',
    accent: '#2A9D8F',
    text: '#1A1A2E',
    textSecondary: '#4A4A5A',
    textMuted: '#8A8A9A',
    textInverse: '#FFFFFF',
    border: '#E0E0E8',
    borderLight: '#F0F0F5',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828',
    gradientStart: '#FFFFFF',
    gradientEnd: '#F0F2F5',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, hero: 36 },
  },
  cardStyle: 'elevated',
  isDark: false,
};

// ============================================
// CLASSIC THEME (Warm, Concert Hall Inspired)
// ============================================
export const classicTheme: Theme = {
  name: 'classic',
  displayName: 'Concert Hall',
  description: 'Warm tones inspired by classic venues',
  colors: {
    background: '#1C1410',
    surface: '#2A2018',
    surfaceLight: '#3A2E24',
    surfaceElevated: '#453830',
    primary: '#C9A227',
    primaryLight: '#E8C860',
    secondary: '#8B4513',
    accent: '#CD853F',
    text: '#F5F0E8',
    textSecondary: '#D4C8B8',
    textMuted: '#9A8A7A',
    textInverse: '#1C1410',
    border: '#4A3E34',
    borderLight: '#5A4E44',
    success: '#6B8E23',
    warning: '#DAA520',
    error: '#B22222',
    gradientStart: '#2A2018',
    gradientEnd: '#1C1410',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  },
  typography: {
    fontFamily: 'Georgia',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, hero: 36 },
  },
  cardStyle: 'elevated',
  isDark: true,
};

// ============================================
// SKEUOMORPHIC THEME (Textured, 3D elements)
// ============================================
export const skeuomorphicTheme: Theme = {
  name: 'skeuomorphic',
  displayName: 'Vinyl',
  description: 'Rich textures like vintage equipment',
  colors: {
    background: '#2C2C2C',
    surface: '#3D3D3D',
    surfaceLight: '#4A4A4A',
    surfaceElevated: '#505050',
    primary: '#FFD700',
    primaryLight: '#FFE44D',
    secondary: '#C0C0C0',
    accent: '#FF6B35',
    text: '#F0F0F0',
    textSecondary: '#C8C8C8',
    textMuted: '#888888',
    textInverse: '#1A1A1A',
    border: '#5A5A5A',
    borderLight: '#6A6A6A',
    success: '#32CD32',
    warning: '#FFA500',
    error: '#DC143C',
    gradientStart: '#4A4A4A',
    gradientEnd: '#2C2C2C',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
    lg: { shadowColor: '#000', shadowOffset: { width: 2, height: 10 }, shadowOpacity: 0.7, shadowRadius: 20, elevation: 16 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, hero: 36 },
  },
  cardStyle: 'glass',
  isDark: true,
};

// ============================================
// NEOBRUTALIST THEME (Bold, Raw, High Contrast)
// ============================================
export const neobrutalistTheme: Theme = {
  name: 'neobrutalist',
  displayName: 'Brutalist',
  description: 'Bold, raw, and unapologetically loud',
  colors: {
    background: '#FFFEF0',
    surface: '#FFFFFF',
    surfaceLight: '#FFF8DC',
    surfaceElevated: '#FFFFFF',
    primary: '#FF5722',
    primaryLight: '#FF8A65',
    secondary: '#000000',
    accent: '#FFEB3B',
    text: '#000000',
    textSecondary: '#333333',
    textMuted: '#666666',
    textInverse: '#FFFFFF',
    border: '#000000',
    borderLight: '#333333',
    success: '#00C853',
    warning: '#FFD600',
    error: '#FF1744',
    gradientStart: '#FFFEF0',
    gradientEnd: '#FFF8DC',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, full: 9999 },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
    lg: { shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 10, sm: 12, md: 14, lg: 17, xl: 22, xxl: 32, hero: 42 },
  },
  cardStyle: 'brutal',
  isDark: false,
};

// ============================================
// LIQUID GLASS THEME (Apple-style Glassmorphism)
// ============================================
export const liquidGlassTheme: Theme = {
  name: 'liquidglass',
  displayName: 'Liquid Glass',
  description: 'Translucent, airy, Apple-inspired design',
  colors: {
    // Base colors - soft, muted, with transparency in mind
    background: '#F2F2F7',           // iOS system gray 6
    surface: 'rgba(255, 255, 255, 0.72)',  // Glass white
    surfaceLight: 'rgba(255, 255, 255, 0.5)',
    surfaceElevated: 'rgba(255, 255, 255, 0.85)',
    // Accent colors - vibrant but refined
    primary: '#007AFF',              // iOS blue
    primaryLight: '#5AC8FA',         // iOS light blue
    secondary: '#AF52DE',            // iOS purple
    accent: '#FF9500',               // iOS orange
    // Text - high contrast on glass
    text: '#1C1C1E',                 // iOS label
    textSecondary: '#3C3C43',        // iOS secondary label (99% opacity)
    textMuted: '#8E8E93',            // iOS tertiary label
    textInverse: '#FFFFFF',
    // Borders - subtle, light
    border: 'rgba(60, 60, 67, 0.12)', // iOS separator
    borderLight: 'rgba(60, 60, 67, 0.06)',
    // Status colors
    success: '#34C759',              // iOS green
    warning: '#FF9500',              // iOS orange
    error: '#FF3B30',                // iOS red
    // Gradients
    gradientStart: 'rgba(255, 255, 255, 0.8)',
    gradientEnd: 'rgba(242, 242, 247, 0.9)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, full: 9999 },
  shadows: {
    // Soft, diffused shadows for glass effect
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 8 },
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28, hero: 34 },
  },
  cardStyle: 'glass',
  isDark: false,
};

// ============================================
// STITCH THEME (Google Design-Inspired, Premium Dark)
// ============================================
export const stitchTheme: Theme = {
  name: 'stitch',
  displayName: 'Stitch',
  description: 'Premium dark with deep purple accents',
  colors: {
    // Base colors - warm dark with purple tint
    background: '#161121',           // Deep purple-black
    surface: '#221a32',              // Purple-tinted surface
    surfaceLight: '#2d2442',         // Lighter purple surface
    surfaceElevated: '#352c4a',      // Elevated elements
    // Primary - vibrant purple
    primary: '#5417cf',              // Google Stitch purple
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
  borderRadius: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, full: 9999 },  // More rounded
  shadows: {
    // Purple-tinted shadows for depth
    sm: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
    md: { shadowColor: '#5417cf', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 },
  },
  typography: {
    fontFamily: 'System',  // Will use Noto Serif when fonts are loaded
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 30, hero: 40 },
  },
  cardStyle: 'elevated',
  isDark: true,
};

// Theme map for easy access
export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  classic: classicTheme,
  skeuomorphic: skeuomorphicTheme,
  neobrutalist: neobrutalistTheme,
  liquidglass: liquidGlassTheme,
  stitch: stitchTheme,
};

export const themeList = Object.values(themes);

