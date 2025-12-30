export { useStreak } from './useStreak';
export { useCardStyle, useAccentCardStyle } from './useCardStyle';
export { useNetworkStatus } from './useNetworkStatus';
export type { NetworkStatus, UseNetworkStatusResult } from './useNetworkStatus';

// NOTE: useAsyncData is deprecated - use React Query hooks below instead
// The hook file is kept for reference but not exported to prevent accidental usage
// See: useDataService.ts for the recommended React Query-based approach

// Query hooks (read operations)
export {
  useComposers,
  useComposer,
  useComposersByPeriod,
  usePeriods,
  usePeriod,
  useForms,
  useForm,
  useTerms,
  useTerm,
  useWeeklyAlbums,
  useCurrentWeeklyAlbum,
  useMonthlySpotlights,
  useCurrentMonthlySpotlight,
  useNewReleases,
  useConcertHalls,
  useKickstartDays,
  useKickstartDay,
} from './useDataService';

// Mutation hooks (write operations with optimistic updates)
export {
  useMarkViewedMutation,
  useSubmitQuizScoreMutation,
  useUpdateProfileMutation,
  usePrefetchComposer,
  usePrefetchTerm,
} from './useMutations';
