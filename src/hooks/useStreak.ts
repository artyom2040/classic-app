import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalDaysActive: number;
  streakHistory: string[]; // Array of ISO date strings
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalDaysActive: 0,
  streakHistory: [],
};

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref to track latest state for async operations (prevents race conditions)
  const streakDataRef = useRef<StreakData>(streakData);
  streakDataRef.current = streakData;

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      if (stored) {
        const data = JSON.parse(stored) as StreakData;

        // Check if streak is still valid
        const today = getDateString();
        const yesterday = getDateString(new Date(Date.now() - 86400000));

        if (data.lastActiveDate) {
          if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
            // Streak broken - reset current streak but keep longest
            data.currentStreak = 0;
          }
        }

        setStreakData(data);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveStreak = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving streak:', error);
    }
  };

  const recordActivity = useCallback(async (): Promise<{
    isNewDay: boolean;
    streakIncreased: boolean;
    currentStreak: number;
  }> => {
    const today = getDateString();

    // Use ref for latest state to prevent race conditions
    const currentData = streakDataRef.current;

    // Already recorded today
    if (currentData.lastActiveDate === today) {
      return {
        isNewDay: false,
        streakIncreased: false,
        currentStreak: currentData.currentStreak,
      };
    }

    const yesterday = getDateString(new Date(Date.now() - 86400000));
    let newCurrentStreak = 1;
    let streakIncreased = false;

    if (currentData.lastActiveDate === yesterday) {
      // Continuing streak
      newCurrentStreak = currentData.currentStreak + 1;
      streakIncreased = true;
    }

    const newData: StreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(currentData.longestStreak, newCurrentStreak),
      lastActiveDate: today,
      totalDaysActive: currentData.totalDaysActive + 1,
      streakHistory: [...currentData.streakHistory.slice(-365), today], // Keep last year
    };

    setStreakData(newData);
    await saveStreak(newData);

    return {
      isNewDay: true,
      streakIncreased,
      currentStreak: newCurrentStreak,
    };
  }, []); // No dependencies needed - uses ref for latest state

  const resetStreak = async () => {
    setStreakData(defaultStreakData);
    await AsyncStorage.removeItem(STORAGE_KEYS.STREAK);
  };

  const getStreakStatus = (): 'active' | 'at_risk' | 'broken' => {
    if (!streakData.lastActiveDate) return 'broken';

    const today = getDateString();
    const yesterday = getDateString(new Date(Date.now() - 86400000));

    if (streakData.lastActiveDate === today) return 'active';
    if (streakData.lastActiveDate === yesterday) return 'at_risk';
    return 'broken';
  };

  return {
    ...streakData,
    isLoaded,
    recordActivity,
    resetStreak,
    streakStatus: getStreakStatus(),
    isActiveToday: streakData.lastActiveDate === getDateString(),
  };
}
