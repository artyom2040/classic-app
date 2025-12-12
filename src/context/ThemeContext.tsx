import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, themes, darkTheme } from '../theme/themes';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storageUtils';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
  isGlass: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeName: 'dark',
  setTheme: () => { },
  isDark: true,
  isGlass: false,
});

const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await getStorageItem<string>(THEME_STORAGE_KEY, 'dark');
    if (themes[saved as ThemeName]) {
      setThemeName(saved as ThemeName);
    }
  };

  const setTheme = async (name: ThemeName) => {
    const previousTheme = themeName;
    setThemeName(name);

    // Try to persist with retry logic
    const saved = await setStorageItem(THEME_STORAGE_KEY, name);
    if (!saved) {
      // Rollback on failure
      setThemeName(previousTheme);
      console.error('[ThemeContext] Failed to save theme - reverted to previous');
    }
  };

  const theme = themes[themeName];
  const isDark = theme.isDark;
  const isGlass = themeName === 'liquidglass';

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, isDark, isGlass }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
