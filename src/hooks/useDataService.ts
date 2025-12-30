/**
 * Data Service Hooks
 *
 * React Query-based hooks for fetching data from the DataService.
 * Provides automatic caching, background refetching, and error handling.
 *
 * @example
 * const { data: composers, isLoading, error } = useComposers();
 * const { data: composer } = useComposer('bach');
 */

import { useQuery } from '@tanstack/react-query';
import { DataService } from '../services/dataService';
import { queryKeys } from '../services/queryClient';
import {
  Composer,
  Period,
  MusicalForm,
  Term,
  WeeklyAlbum,
  MonthlySpotlight,
  NewRelease,
  ConcertHall,
  KickstartDay,
} from '../types';

// ============================================================================
// Composers Hooks
// ============================================================================

/**
 * Hook to fetch all composers
 */
export function useComposers() {
  return useQuery({
    queryKey: queryKeys.composers.all,
    queryFn: () => DataService.getComposers(),
  });
}

/**
 * Hook to fetch a single composer by ID
 */
export function useComposer(id: string) {
  return useQuery({
    queryKey: queryKeys.composers.byId(id),
    queryFn: () => DataService.getComposerById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch composers by period
 */
export function useComposersByPeriod(periodId: string) {
  return useQuery({
    queryKey: queryKeys.composers.byPeriod(periodId),
    queryFn: () => DataService.getComposersByPeriod(periodId),
    enabled: !!periodId,
  });
}

// ============================================================================
// Periods Hooks
// ============================================================================

/**
 * Hook to fetch all periods
 */
export function usePeriods() {
  return useQuery({
    queryKey: queryKeys.periods.all,
    queryFn: () => DataService.getPeriods(),
  });
}

/**
 * Hook to fetch a single period by ID
 */
export function usePeriod(id: string) {
  return useQuery({
    queryKey: queryKeys.periods.byId(id),
    queryFn: () => DataService.getPeriodById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Forms Hooks
// ============================================================================

/**
 * Hook to fetch all musical forms
 */
export function useForms() {
  return useQuery({
    queryKey: queryKeys.forms.all,
    queryFn: () => DataService.getForms(),
  });
}

/**
 * Hook to fetch a single form by ID
 */
export function useForm(id: string) {
  return useQuery({
    queryKey: queryKeys.forms.byId(id),
    queryFn: () => DataService.getFormById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Glossary / Terms Hooks
// ============================================================================

/**
 * Hook to fetch all glossary terms
 */
export function useTerms() {
  return useQuery({
    queryKey: queryKeys.terms.all,
    queryFn: () => DataService.getTerms(),
  });
}

/**
 * Hook to fetch a single term by ID
 */
export function useTerm(id: string) {
  return useQuery({
    queryKey: queryKeys.terms.byId(id),
    queryFn: () => DataService.getTermById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Album & Content Hooks
// ============================================================================

/**
 * Hook to fetch all weekly albums
 */
export function useWeeklyAlbums() {
  return useQuery({
    queryKey: queryKeys.albums.weeklyAll,
    queryFn: () => DataService.getWeeklyAlbums(),
  });
}

/**
 * Hook to fetch current weekly album
 */
export function useCurrentWeeklyAlbum() {
  return useQuery({
    queryKey: queryKeys.albums.weekly,
    queryFn: () => DataService.getCurrentWeeklyAlbum(),
  });
}

/**
 * Hook to fetch all monthly spotlights
 */
export function useMonthlySpotlights() {
  return useQuery({
    queryKey: queryKeys.albums.monthlyAll,
    queryFn: () => DataService.getMonthlySpotlights(),
  });
}

/**
 * Hook to fetch current monthly spotlight
 */
export function useCurrentMonthlySpotlight() {
  return useQuery({
    queryKey: queryKeys.albums.monthly,
    queryFn: () => DataService.getCurrentMonthlySpotlight(),
  });
}

/**
 * Hook to fetch new releases
 */
export function useNewReleases() {
  return useQuery({
    queryKey: queryKeys.newReleases.all,
    queryFn: () => DataService.getNewReleases(),
  });
}

/**
 * Hook to fetch concert halls
 */
export function useConcertHalls() {
  return useQuery({
    queryKey: queryKeys.concertHalls.all,
    queryFn: () => DataService.getConcertHalls(),
  });
}

// ============================================================================
// Kickstart Hooks
// ============================================================================

/**
 * Hook to fetch all kickstart days
 */
export function useKickstartDays() {
  return useQuery({
    queryKey: queryKeys.kickstart.all,
    queryFn: () => DataService.getKickstartDays(),
  });
}

/**
 * Hook to fetch a specific kickstart day
 */
export function useKickstartDay(dayNumber: number) {
  return useQuery({
    queryKey: queryKeys.kickstart.byDay(dayNumber),
    queryFn: () => DataService.getKickstartDay(dayNumber),
    enabled: dayNumber > 0,
  });
}

// ============================================================================
// Re-export types for convenience
// ============================================================================

export type {
  Composer,
  Period,
  MusicalForm,
  Term,
  WeeklyAlbum,
  MonthlySpotlight,
  NewRelease,
  ConcertHall,
  KickstartDay,
};
