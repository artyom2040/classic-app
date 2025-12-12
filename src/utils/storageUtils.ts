/**
 * Storage Utilities
 *
 * Provides a centralized API for AsyncStorage operations with:
 * - Automatic retry with exponential backoff
 * - Consistent error handling
 * - Type safety with generics
 * - Optional encryption ready
 *
 * Usage:
 *   const favorites = await getStorageItem('favorites', []);
 *   const saved = await setStorageItem('favorites', [...]);
 *   const deleted = await removeStorageItem('favorites');
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 100,
  backoffMultiplier: 2,
};

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number, multiplier: number): number {
  return baseDelay * Math.pow(multiplier, attempt);
}

/**
 * Generic async storage getter with automatic retry and type safety
 *
 * @template T The type of data to retrieve
 * @param key Storage key
 * @param defaultValue Default value if key doesn't exist
 * @param options Retry configuration
 * @returns The stored data or default value
 *
 * @example
 * const favorites = await getStorageItem<FavoriteItem[]>('favorites', []);
 */
export async function getStorageItem<T>(
  key: string,
  defaultValue: T,
  options?: RetryOptions
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) {
        return defaultValue;
      }
      return JSON.parse(stored) as T;
    } catch (error) {
      const isLastAttempt = attempt === config.maxRetries - 1;

      if (isLastAttempt) {
        console.error(`[StorageUtils] Failed to load "${key}" after ${config.maxRetries} attempts`, {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        return defaultValue;
      }

      // Wait before retrying with exponential backoff
      const delay = getBackoffDelay(attempt, config.delayMs, config.backoffMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return defaultValue;
}

/**
 * Generic async storage setter with automatic retry
 *
 * @template T The type of data to store
 * @param key Storage key
 * @param value Data to store (will be JSON stringified)
 * @param options Retry configuration
 * @returns true if successful, false if failed after all retries
 *
 * @example
 * const success = await setStorageItem('favorites', myFavorites);
 * if (!success) console.error('Failed to save');
 */
export async function setStorageItem<T>(
  key: string,
  value: T,
  options?: RetryOptions
): Promise<boolean> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      const isLastAttempt = attempt === config.maxRetries - 1;

      if (isLastAttempt) {
        console.error(`[StorageUtils] Failed to save "${key}" after ${config.maxRetries} attempts`, {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      // Wait before retrying with exponential backoff
      const delay = getBackoffDelay(attempt, config.delayMs, config.backoffMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
}

/**
 * Remove an item from async storage with retry
 *
 * @param key Storage key to remove
 * @param options Retry configuration
 * @returns true if successful, false if failed
 *
 * @example
 * await removeStorageItem('favorites');
 */
export async function removeStorageItem(
  key: string,
  options?: RetryOptions
): Promise<boolean> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      const isLastAttempt = attempt === config.maxRetries - 1;

      if (isLastAttempt) {
        console.error(`[StorageUtils] Failed to remove "${key}" after ${config.maxRetries} attempts`, {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      const delay = getBackoffDelay(attempt, config.delayMs, config.backoffMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
}

/**
 * Batch get multiple items from storage
 * Returns object with key-value pairs
 *
 * @template T Record type with string keys
 * @param keys Array of keys to retrieve
 * @param defaults Default values for each key
 * @param options Retry configuration
 * @returns Object with all retrieved values
 *
 * @example
 * const { theme, favorites } = await getMultipleStorageItems(
 *   ['theme', 'favorites'],
 *   { theme: 'dark', favorites: [] }
 * );
 */
export async function getMultipleStorageItems<T extends Record<string, any>>(
  keys: (keyof T)[],
  defaults: T,
  options?: RetryOptions
): Promise<T> {
  const results: Partial<T> = {};

  for (const key of keys) {
    results[key] = await getStorageItem<T[keyof T]>(
      String(key),
      defaults[key],
      options
    );
  }

  return results as T;
}

/**
 * Batch set multiple items to storage
 *
 * @template T Record type with string keys
 * @param items Object with key-value pairs to store
 * @param options Retry configuration
 * @returns true if all succeeded, false if any failed
 *
 * @example
 * const success = await setMultipleStorageItems({
 *   theme: 'dark',
 *   favorites: [],
 * });
 */
export async function setMultipleStorageItems<T extends Record<string, any>>(
  items: T,
  options?: RetryOptions
): Promise<boolean> {
  const entries = Object.entries(items);
  const results = await Promise.all(
    entries.map(([key, value]) => setStorageItem(key, value, options))
  );

  return results.every(result => result === true);
}

/**
 * Clear all async storage (use with caution!)
 *
 * @returns true if successful
 * @example
 * await clearAllStorage(); // Clears everything!
 */
export async function clearAllStorage(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    console.log('[StorageUtils] All async storage cleared');
    return true;
  } catch (error) {
    console.error('[StorageUtils] Failed to clear all storage', error);
    return false;
  }
}
