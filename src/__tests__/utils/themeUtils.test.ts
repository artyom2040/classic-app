/**
 * Tests for theme utilities
 */

import {
    getThemeColors,
    getThemeSpacing,
    getThemeBorderRadius,
    createThemeStyles,
    isDarkTheme,
    getThemeName,
    createResponsiveStyles
} from '../../utils/themeUtils';
import { darkTheme, lightTheme } from '../../theme/themes';

describe('Theme Utilities', () => {
    describe('getThemeColors', () => {
        it('should return all theme colors for dark theme', () => {
            const colors = getThemeColors(darkTheme);

            expect(colors.background).toBe(darkTheme.colors.background);
            expect(colors.primary).toBe(darkTheme.colors.primary);
            expect(colors.text).toBe(darkTheme.colors.text);
            expect(colors.error).toBe(darkTheme.colors.error);
        });

        it('should return all theme colors for light theme', () => {
            const colors = getThemeColors(lightTheme);

            expect(colors.background).toBe(lightTheme.colors.background);
            expect(colors.primary).toBe(lightTheme.colors.primary);
        });
    });

    describe('getThemeSpacing', () => {
        it('should return spacing values', () => {
            const spacing = getThemeSpacing(darkTheme);

            expect(spacing.xs).toBe(4);
            expect(spacing.sm).toBe(8);
            expect(spacing.md).toBe(16);
            expect(spacing.lg).toBe(24);
            expect(spacing.xl).toBe(32);
            expect(spacing.xxl).toBe(48);
        });
    });

    describe('getThemeBorderRadius', () => {
        it('should return border radius values', () => {
            const borderRadius = getThemeBorderRadius(darkTheme);

            expect(borderRadius.xs).toBe(8);
            expect(borderRadius.sm).toBe(12);
            expect(borderRadius.md).toBe(16);
            expect(borderRadius.full).toBe(9999);
        });
    });

    describe('createThemeStyles', () => {
        it('should create card styles', () => {
            const styles = createThemeStyles(darkTheme);

            expect(styles.card).toBeDefined();
            expect(styles.card.backgroundColor).toBe(darkTheme.colors.surface);
            expect(styles.card.borderRadius).toBe(darkTheme.borderRadius.md);
        });

        it('should create button styles', () => {
            const styles = createThemeStyles(darkTheme);

            expect(styles.button).toBeDefined();
            expect(styles.button.backgroundColor).toBe(darkTheme.colors.primary);
        });

        it('should create input styles', () => {
            const styles = createThemeStyles(darkTheme);

            expect(styles.input).toBeDefined();
            expect(styles.input.borderWidth).toBe(1);
        });

        it('should create badge styles', () => {
            const styles = createThemeStyles(lightTheme);

            expect(styles.badge).toBeDefined();
            expect(styles.badge.borderRadius).toBe(lightTheme.borderRadius.full);
        });
    });

    describe('isDarkTheme', () => {
        it('should return true for dark theme', () => {
            expect(isDarkTheme(darkTheme)).toBe(true);
        });

        it('should return false for light theme', () => {
            expect(isDarkTheme(lightTheme)).toBe(false);
        });
    });

    describe('getThemeName', () => {
        it('should return theme name', () => {
            expect(getThemeName(darkTheme)).toBe('dark');
            expect(getThemeName(lightTheme)).toBe('light');
        });
    });

    describe('createResponsiveStyles', () => {
        it('should return base styles for mobile', () => {
            const styles = createResponsiveStyles(darkTheme, false);

            expect(styles.card).toBeDefined();
            expect(styles.container).toBeDefined();
            expect(styles.container.maxWidth).toBeUndefined();
        });

        it('should add max width for desktop', () => {
            const styles = createResponsiveStyles(darkTheme, true);

            expect(styles.container.maxWidth).toBe(1200);
            expect(styles.container.alignSelf).toBe('center');
        });
    });
});
