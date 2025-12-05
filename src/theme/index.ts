export const colors = {
  // Primary palette
  primary: '#6366F1',       // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Secondary palette
  secondary: '#F59E0B',     // Amber
  secondaryDark: '#D97706',
  secondaryLight: '#FCD34D',
  
  // Background colors
  background: '#0F0F1A',    // Deep navy
  backgroundLight: '#1A1A2E',
  surface: '#252540',
  surfaceLight: '#363654',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  
  // Accent colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Period colors (matching JSON data)
  periodMedieval: '#8B4513',
  periodRenaissance: '#654321',
  periodBaroque: '#B8860B',
  periodClassical: '#DAA520',
  periodRomantic: '#DC143C',
  periodModern: '#4169E1',
  periodContemporary: '#9932CC',
  
  // Category colors
  categoryTempo: '#10B981',
  categoryForm: '#6366F1',
  categoryHarmony: '#F59E0B',
  categoryTechnique: '#EC4899',
  categoryDynamics: '#EF4444',
  categoryGenre: '#8B5CF6',
  categoryTheory: '#3B82F6',
  
  // Gradients (as arrays for linear gradient)
  gradientPrimary: ['#6366F1', '#8B5CF6'],
  gradientWarm: ['#F59E0B', '#DC143C'],
  gradientCool: ['#3B82F6', '#6366F1'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
