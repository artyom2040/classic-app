import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = useCallback(async (track: Track) => {
    try {
      // If same track, just toggle play
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          audioRef.current?.pause();
          setIsPlaying(false);
        } else {
          audioRef.current?.play();
          setIsPlaying(true);
        }
        return;
      }

      setIsLoading(true);
      
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Create new audio element for web
      if (Platform.OS === 'web') {
        const audio = new window.Audio(track.audioUrl);
        audioRef.current = audio;
        
        audio.onloadedmetadata = () => {
          setDuration(audio.duration * 1000);
          setIsLoading(false);
        };
        
        audio.ontimeupdate = () => {
          setPosition(audio.currentTime * 1000);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setPosition(0);
        };
        
        audio.onerror = (e) => {
          console.error('Audio error - file may not be available');
          setIsLoading(false);
          setCurrentTrack(null); // Clear the track to hide player
        };

        await audio.play();
        setCurrentTrack(track);
        setIsPlaying(true);
      } else {
        // For native, use expo-av
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              setDuration(status.durationMillis || 0);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
              }
            }
          }
        );
        setCurrentTrack(track);
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      setIsLoading(false);
    }
  }, [currentTrack?.id, isPlaying]);

  const pause = useCallback(async () => {
    if (Platform.OS === 'web') {
      audioRef.current?.pause();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(async () => {
    if (Platform.OS === 'web') {
      audioRef.current?.play();
    }
    setIsPlaying(true);
  }, []);

  const stop = useCallback(async () => {
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const seekTo = useCallback(async (positionMs: number) => {
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.currentTime = positionMs / 1000;
    }
    setPosition(positionMs);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(q => [...q, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

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
