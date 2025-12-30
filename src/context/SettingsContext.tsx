import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storageUtils';

export type IconPack = 'ionicons' | 'lucide' | 'phosphor';
export type MusicService = 'youtube' | 'spotify' | 'apple';

interface SettingsContextType {
  iconPack: IconPack;
  setIconPack: (pack: IconPack) => void;
  musicService: MusicService;
  setMusicService: (service: MusicService) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  iconPack: 'ionicons',
  setIconPack: () => {},
  musicService: 'youtube',
  setMusicService: () => {},
});

const SETTINGS_STORAGE_KEY = STORAGE_KEYS.SETTINGS;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [iconPack, setIconPackState] = useState<IconPack>('ionicons');
  const [musicService, setMusicServiceState] = useState<MusicService>('youtube');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getStorageItem<{
      iconPack?: IconPack;
      musicService?: MusicService;
    }>(SETTINGS_STORAGE_KEY, {});

    if (settings.iconPack) setIconPackState(settings.iconPack);
    if (settings.musicService) setMusicServiceState(settings.musicService);
  };

  const saveSettings = async (newSettings: Partial<{ iconPack: IconPack; musicService: MusicService }>) => {
    const current = { iconPack, musicService, ...newSettings };
    return setStorageItem(SETTINGS_STORAGE_KEY, current);
  };

  const setIconPack = useCallback((pack: IconPack) => {
    setIconPackState(pack);
    saveSettings({ iconPack: pack });
  }, []);

  const setMusicService = useCallback((service: MusicService) => {
    setMusicServiceState(service);
    saveSettings({ musicService: service });
  }, []);

  // Memoize provider value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    iconPack,
    setIconPack,
    musicService,
    setMusicService,
  }), [iconPack, setIconPack, musicService, setMusicService]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
