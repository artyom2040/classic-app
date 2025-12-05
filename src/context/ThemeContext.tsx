import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes, darkTheme } from '../theme/themes';

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
  setTheme: () => {},
  isDark: true,
  isGlass: false,
});

const THEME_STORAGE_KEY = '@context_composer_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && themes[saved as ThemeName]) {
        setThemeName(saved as ThemeName);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const theme = themes[themeName];
  const isDark = themeName !== 'light' && themeName !== 'neobrutalist' && themeName !== 'liquidglass';
  const isGlass = themeName === 'liquidglass';

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, isDark, isGlass }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
