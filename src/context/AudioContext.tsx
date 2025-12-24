import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import { useToast } from '../components';
import { configureAudioSession, supportsBackgroundAudio } from '../services/audioSession';
import { Logger } from '../utils/logger';

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
  const { showToast } = useToast();
  const isWeb = Platform.OS === 'web';
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  // Configure audio session for background playback on mount
  useEffect(() => {
    if (supportsBackgroundAudio()) {
      configureAudioSession({
        playsInSilentMode: true,
        staysActiveInBackground: true,
      });
    }
  }, []);

  // Native player lifecycle (expo-audio)
  useEffect(() => {
    if (isWeb) return;

    // Keep audio session active for background playback
    const player = createAudioPlayer(null, { updateInterval: 300, keepAudioSessionActive: true });
    playerRef.current = player;

    const sub = player.addListener?.('playbackStatusUpdate', (status: AudioStatus) => {
      setIsLoading(!status.isLoaded || status.isBuffering);
      setPosition(status.currentTime * 1000);
      setDuration(status.duration * 1000);
      setIsPlaying(status.playing);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    });

    return () => {
      sub?.remove?.();
      player.remove?.();
      playerRef.current = null;
    };
  }, [isWeb]);

  const ensureUrlAvailable = useCallback(async (url: string) => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    try {
      // If same track, just toggle play
      if (currentTrack?.id === track.id) {
        if (isWeb) {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              await audioRef.current.play();
              setIsPlaying(true);
            }
          }
        } else if (playerRef.current) {
          if (isPlaying) {
            playerRef.current.pause();
          } else {
            playerRef.current.play();
          }
        }
        return;
      }

      setIsLoading(true);

      // Stop and cleanup previous web audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load(); // Reset the audio element
        audioRef.current.onloadedmetadata = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
      }

      // Web: use HTMLAudioElement for simplicity/CORS handling
      if (isWeb) {
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

        audio.onerror = () => {
          Logger.error('Audio', 'Audio error - file may not be available');
          showToast('Audio unavailable. Try another sample.', 'error');
          setIsLoading(false);
          setCurrentTrack(null); // Clear the track to hide player
        };

        await audio.play();
        setCurrentTrack(track);
        setIsPlaying(true);
        return;
      }

      // Native: use expo-audio
      const player = playerRef.current;
      if (!player) {
        setIsLoading(false);
        showToast('Audio unavailable. Please try again.', 'error');
        return;
      }

      const reachable = await ensureUrlAvailable(track.audioUrl);
      if (!reachable) {
        showToast('Audio unavailable. Try another sample.', 'error');
        setIsLoading(false);
        setCurrentTrack(null);
        return;
      }

      player.replace(track.audioUrl);
      player.play();
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      Logger.error('Audio', 'Error playing track', { error });
      showToast('Unable to play audio. Please try again.', 'error');
      setIsLoading(false);
    }
  }, [currentTrack?.id, isPlaying, showToast, isWeb, ensureUrlAvailable]);

  const pause = useCallback(async () => {
    if (isWeb) {
      audioRef.current?.pause();
    } else {
      playerRef.current?.pause();
    }
    setIsPlaying(false);
  }, [isWeb]);

  const resume = useCallback(async () => {
    if (isWeb) {
      await audioRef.current?.play();
    } else {
      playerRef.current?.play();
    }
    setIsPlaying(true);
  }, [isWeb]);

  const stop = useCallback(async () => {
    if (isWeb && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    } else if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, [isWeb]);

  const seekTo = useCallback(async (positionMs: number) => {
    if (isWeb && audioRef.current) {
      audioRef.current.currentTime = positionMs / 1000;
    } else if (playerRef.current) {
      await playerRef.current.seekTo(positionMs / 1000);
    }
    setPosition(positionMs);
  }, [isWeb]);

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
