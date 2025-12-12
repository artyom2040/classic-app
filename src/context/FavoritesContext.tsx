import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { haptic } from '../utils/haptics';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storageUtils';

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
    const data = await getStorageItem<FavoriteItem[]>(FAVORITES_KEY, []);
    setFavorites(data);
    setIsLoaded(true);
  };

  const saveFavorites = async (newFavorites: FavoriteItem[]): Promise<boolean> => {
    return setStorageItem(FAVORITES_KEY, newFavorites);
  };

  const isFavorite = (id: string | number, type: FavoriteType): boolean => {
    return favorites.some(f => f.id === id && f.type === type);
  };

  const toggleFavorite = async (id: string | number, type: FavoriteType): Promise<boolean> => {
    const existing = favorites.find(f => f.id === id && f.type === type);
    const previousFavorites = [...favorites];

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

    // Optimistic update
    setFavorites(newFavorites);

    // Persist to storage
    const saved = await saveFavorites(newFavorites);

    // Rollback on failure
    if (!saved) {
      setFavorites(previousFavorites);
      haptic('error');
      return !wasAdded; // Return opposite since we rolled back
    }

    return wasAdded;
  };

  const getFavoritesByType = (type: FavoriteType): FavoriteItem[] => {
    return favorites.filter(f => f.type === type);
  };

  const clearFavorites = async () => {
    setFavorites([]);
    await removeStorageItem(FAVORITES_KEY);
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

// Convenience hook for a specific item with pending state
export function useFavoriteItem(id: string | number, type: FavoriteType) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(async () => {
    setIsPending(true);
    try {
      await toggleFavorite(id, type);
    } finally {
      setIsPending(false);
    }
  }, [id, type, toggleFavorite]);

  return {
    isFavorite: isFavorite(id, type),
    toggle,
    isLoaded,
    isPending,
  };
}
