/**
 * Centralized Storage Keys
 * 
 * All AsyncStorage keys used throughout the app.
 * This ensures consistency and prevents key collisions.
 */

export const STORAGE_KEYS = {
  /** User progress data (kickstart, viewed items, badges) */
  PROGRESS: '@context_composer_progress',

  /** Favorite items (composers, terms, forms, etc.) */
  FAVORITES: '@context_composer_favorites',

  /** App settings (icon pack, music service preference) */
  SETTINGS: '@context_composer_settings',

  /** Selected theme name */
  THEME: '@context_composer_theme',

  /** Daily quiz state */
  QUIZ: '@context_composer_quiz',

  /** Streak tracking */
  STREAK: '@context_composer_streak',

  /** Supabase auth session */
  AUTH_SESSION: '@context_composer_auth',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
