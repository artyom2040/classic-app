/**
 * Progress & Badge Storage
 * 
 * Domain-specific storage functions for user progress and badges.
 * Uses storageUtils.ts for all underlying AsyncStorage operations.
 */

import { UserProgress } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem, removeStorageItem } from './storageUtils';

const STORAGE_KEY = STORAGE_KEYS.PROGRESS;

const defaultProgress: UserProgress = {
  kickstartDay: 0,
  kickstartCompleted: false,
  viewedComposers: [],
  viewedPeriods: [],
  viewedForms: [],
  viewedTerms: [],
  badges: [],
  firstLaunch: true,
};

export async function getProgress(): Promise<UserProgress> {
  const stored = await getStorageItem<Partial<UserProgress>>(STORAGE_KEY, {});
  return { ...defaultProgress, ...stored };
}

export async function saveProgress(progress: Partial<UserProgress>): Promise<void> {
  const current = await getProgress();
  const updated = { ...current, ...progress };
  await setStorageItem(STORAGE_KEY, updated);
}

export async function markComposerViewed(composerId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedComposers.includes(composerId)) {
    progress.viewedComposers.push(composerId);
    await saveProgress(progress);
  }
}

export async function markPeriodViewed(periodId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedPeriods.includes(periodId)) {
    progress.viewedPeriods.push(periodId);
    await saveProgress(progress);
  }
}

export async function markFormViewed(formId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedForms.includes(formId)) {
    progress.viewedForms.push(formId);
    await saveProgress(progress);
  }
}

export async function markTermViewed(termId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedTerms.includes(termId)) {
    progress.viewedTerms.push(termId);
    await saveProgress(progress);
  }
}

export async function earnBadge(badgeId: string): Promise<boolean> {
  const progress = await getProgress();
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    await saveProgress(progress);
    return true; // Badge was newly earned
  }
  return false; // Badge already earned
}

export async function completeKickstartDay(day: number): Promise<void> {
  const progress = await getProgress();
  if (day > progress.kickstartDay) {
    progress.kickstartDay = day;
    if (day >= 5) {
      progress.kickstartCompleted = true;
    }
    await saveProgress(progress);
  }
}

export async function resetProgress(): Promise<void> {
  await removeStorageItem(STORAGE_KEY);
}

// Kickstart badge IDs to remove on reset
const KICKSTART_BADGE_IDS = [
  'first_listen',
  'orchestra_explorer',
  'time_traveler',
  'form_finder',
  'journey_begun'
];

export async function resetKickstart(): Promise<void> {
  const progress = await getProgress();
  progress.kickstartDay = 0;
  progress.kickstartCompleted = false;
  progress.firstLaunch = false; // Keep as not first launch
  // Remove kickstart badges
  progress.badges = progress.badges.filter(b => !KICKSTART_BADGE_IDS.includes(b));
  await saveProgress(progress);
}

// Utility functions (pure functions, no storage)
export function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
