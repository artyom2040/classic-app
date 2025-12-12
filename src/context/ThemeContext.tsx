import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Theme, ThemeName, themes, darkTheme } from '../theme/themes';
import { AccentColorName, accentColors } from '../theme/accentColors';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storageUtils';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
  isGlass: boolean;
  // Accent color support
  accentColorName: AccentColorName;
  setAccentColor: (name: AccentColorName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeName: 'dark',
  setTheme: () => { },
  isDark: true,
  isGlass: false,
  accentColorName: 'purple',
  setAccentColor: () => { },
});

const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;
const ACCENT_COLOR_STORAGE_KEY = 'accent_color';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [accentColorName, setAccentColorName] = useState<AccentColorName>('purple');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedTheme = await getStorageItem<string>(THEME_STORAGE_KEY, 'dark');
    if (themes[savedTheme as ThemeName]) {
      setThemeName(savedTheme as ThemeName);
    } else {
      // Fallback to dark if saved theme doesn't exist anymore
      setThemeName('dark');
    }

    const savedAccent = await getStorageItem<string>(ACCENT_COLOR_STORAGE_KEY, 'purple');
    if (accentColors[savedAccent as AccentColorName]) {
      setAccentColorName(savedAccent as AccentColorName);
    }
  };

  const setTheme = async (name: ThemeName) => {
    const previousTheme = themeName;
    setThemeName(name);

    const saved = await setStorageItem(THEME_STORAGE_KEY, name);
    if (!saved) {
      setThemeName(previousTheme);
      console.error('[ThemeContext] Failed to save theme - reverted to previous');
    }
  };

  const setAccentColor = async (name: AccentColorName) => {
    const previousAccent = accentColorName;
    setAccentColorName(name);

    const saved = await setStorageItem(ACCENT_COLOR_STORAGE_KEY, name);
    if (!saved) {
      setAccentColorName(previousAccent);
      console.error('[ThemeContext] Failed to save accent color - reverted to previous');
    }
  };

  // Apply accent color to the theme
  const theme = useMemo(() => {
    const baseTheme = themes[themeName];
    const accent = accentColors[accentColorName];

    // Only apply accent colors to dark themes for now
    if (baseTheme.isDark) {
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: accent.primary,
          primaryLight: accent.primaryLight,
        },
        shadows: {
          ...baseTheme.shadows,
          sm: { ...baseTheme.shadows.sm as object, shadowColor: accent.shadowColor },
          md: { ...baseTheme.shadows.md as object, shadowColor: accent.shadowColor },
        },
      };
    }

    return baseTheme;
  }, [themeName, accentColorName]);

  const isDark = theme.isDark;
  const isGlass = false; // Removed liquidglass theme

  return (
    <ThemeContext.Provider value={{
      theme,
      themeName,
      setTheme,
      isDark,
      isGlass,
      accentColorName,
      setAccentColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

