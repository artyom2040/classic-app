import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptic } from '../utils/haptics';
import { STORAGE_KEYS } from '../constants';

const FAVORITES_KEY = STORAGE_KEYS.FAVORITES;

export type FavoriteType = 'composer' | 'term' | 'form' | 'period' | 'album';

interface FavoriteItem {
  id: string | number;
  type: FavoriteType;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isLoaded: boolean;
  isFavorite: (id: string | number, type: FavoriteType) => boolean;
  toggleFavorite: (id: string | number, type: FavoriteType) => Promise<boolean>;
  getFavoritesByType: (type: FavoriteType) => FavoriteItem[];
  clearFavorites: () => Promise<void>;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const isFavorite = (id: string | number, type: FavoriteType): boolean => {
    return favorites.some(f => f.id === id && f.type === type);
  };

  const toggleFavorite = async (id: string | number, type: FavoriteType): Promise<boolean> => {
    const existing = favorites.find(f => f.id === id && f.type === type);
    
    let newFavorites: FavoriteItem[];
    let wasAdded: boolean;
    
    if (existing) {
      // Remove from favorites
      newFavorites = favorites.filter(f => !(f.id === id && f.type === type));
      wasAdded = false;
      haptic('light');
    } else {
      // Add to favorites
      const newItem: FavoriteItem = {
        id,
        type,
        addedAt: new Date().toISOString(),
      };
      newFavorites = [...favorites, newItem];
      wasAdded = true;
      haptic('success');
    }
    
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    
    return wasAdded;
  };

  const getFavoritesByType = (type: FavoriteType): FavoriteItem[] => {
    return favorites.filter(f => f.type === type);
  };

  const clearFavorites = async () => {
    setFavorites([]);
    await AsyncStorage.removeItem(FAVORITES_KEY);
  };

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites,
        isLoaded,
        isFavorite,
        toggleFavorite,
        getFavoritesByType,
        clearFavorites,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

// Convenience hook for a specific item
export function useFavoriteItem(id: string | number, type: FavoriteType) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  return {
    isFavorite: isFavorite(id, type),
    toggle: () => toggleFavorite(id, type),
  };
}
