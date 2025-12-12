/**
 * Accent Color System
 * Allows users to customize the primary accent color across themes
 */

export type AccentColorName = 'purple' | 'blue' | 'teal' | 'pink' | 'orange' | 'gold';

export interface AccentColor {
    name: AccentColorName;
    displayName: string;
    primary: string;
    primaryLight: string;
    shadowColor: string;
    gradientStart: string;
    gradientEnd: string;
}

export const accentColors: Record<AccentColorName, AccentColor> = {
    purple: {
        name: 'purple',
        displayName: 'Royal Purple',
        primary: '#5417cf',
        primaryLight: '#7b3ff0',
        shadowColor: '#5417cf',
        gradientStart: '#5417cf',
        gradientEnd: '#7b3ff0',
    },
    blue: {
        name: 'blue',
        displayName: 'Ocean Blue',
        primary: '#2563eb',
        primaryLight: '#3b82f6',
        shadowColor: '#2563eb',
        gradientStart: '#2563eb',
        gradientEnd: '#3b82f6',
    },
    teal: {
        name: 'teal',
        displayName: 'Teal Wave',
        primary: '#0d9488',
        primaryLight: '#14b8a6',
        shadowColor: '#0d9488',
        gradientStart: '#0d9488',
        gradientEnd: '#14b8a6',
    },
    pink: {
        name: 'pink',
        displayName: 'Rose Pink',
        primary: '#db2777',
        primaryLight: '#ec4899',
        shadowColor: '#db2777',
        gradientStart: '#db2777',
        gradientEnd: '#ec4899',
    },
    orange: {
        name: 'orange',
        displayName: 'Sunset Orange',
        primary: '#ea580c',
        primaryLight: '#f97316',
        shadowColor: '#ea580c',
        gradientStart: '#ea580c',
        gradientEnd: '#f97316',
    },
    gold: {
        name: 'gold',
        displayName: 'Classic Gold',
        primary: '#d97706',
        primaryLight: '#f59e0b',
        shadowColor: '#d97706',
        gradientStart: '#d97706',
        gradientEnd: '#f59e0b',
    },
};

export const accentColorList = Object.values(accentColors);
