import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

export interface Track {
  id: string;
  title: string;
  composer: string;
  duration?: number; // in seconds
  audioUrl: string;
  imageUrl?: string;
}

interface AudioContextType {
  // Current track
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number; // ms
  duration: number; // ms
  
  // Controls
  playTrack: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  
  // Queue (for future use)
  queue: Track[];
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Playback status update handler
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Audio error:', status.error);
      }
      return;
    }

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    setIsLoading(status.isBuffering);

    // Track finished
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  const playTrack = async (track: Track) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsLoading(false);
    }
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const seekTo = async (positionMs: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMs);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue(q => [...q, track]);
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        position,
        duration,
        playTrack,
        pause,
        resume,
        stop,
        seekTo,
        queue,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Format time helper
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
