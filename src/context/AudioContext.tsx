import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer } from 'expo-audio';

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
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (position: number) => void;
  
  // Queue (for future use)
  queue: Track[];
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Create the audio player
  const player = useAudioPlayer(currentTrack?.audioUrl || '');
  const status = useAudioPlayerStatus(player);

  // Derive state from player status
  const isPlaying = status.playing;
  const isLoading = status.isBuffering;
  const position = Math.floor((status.currentTime || 0) * 1000); // convert to ms
  const duration = Math.floor((status.duration || 0) * 1000); // convert to ms

  const playTrack = async (track: Track) => {
    try {
      // If same track, just toggle play
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }

      // Set new track and play
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Auto-play when track changes
  useEffect(() => {
    if (currentTrack && player) {
      player.play();
    }
  }, [currentTrack?.id]);

  const pause = () => {
    player.pause();
  };

  const resume = () => {
    player.play();
  };

  const stop = () => {
    player.pause();
    player.seekTo(0);
    setCurrentTrack(null);
  };

  const seekTo = (positionMs: number) => {
    player.seekTo(positionMs / 1000); // convert to seconds
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
