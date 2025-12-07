import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

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
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.iconPack) setIconPackState(settings.iconPack);
        if (settings.musicService) setMusicServiceState(settings.musicService);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = async (newSettings: Partial<{ iconPack: IconPack; musicService: MusicService }>) => {
    try {
      const current = { iconPack, musicService, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const setIconPack = (pack: IconPack) => {
    setIconPackState(pack);
    saveSettings({ iconPack: pack });
  };

  const setMusicService = (service: MusicService) => {
    setMusicServiceState(service);
    saveSettings({ musicService: service });
  };

  return (
    <SettingsContext.Provider value={{ iconPack, setIconPack, musicService, setMusicService }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
