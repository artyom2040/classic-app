/**
 * Mutation Hooks
 *
 * React Query mutation hooks for write operations with optimistic updates.
 * These hooks provide automatic cache invalidation and rollback on error.
 *
 * @example
 * const { mutate: markViewed } = useMarkViewedMutation();
 * markViewed({ type: 'composer', id: 'bach' });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import { markItemViewed, ViewedItemType } from '../utils/storage';
import { useToast } from '../components';

// ============================================================================
// Mark Item Viewed Mutation
// ============================================================================

interface MarkViewedParams {
  type: ViewedItemType;
  id: string;
}

/**
 * Mutation hook for marking items as viewed
 * Tracks user progress through content
 */
export function useMarkViewedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: MarkViewedParams) => {
      await markItemViewed(type, id);
      return { type, id };
    },
    onSuccess: ({ type }) => {
      // Invalidate related queries to refresh viewed status
      switch (type) {
        case 'composer':
          queryClient.invalidateQueries({ queryKey: queryKeys.composers.all });
          break;
        case 'period':
          queryClient.invalidateQueries({ queryKey: queryKeys.periods.all });
          break;
        case 'form':
          queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
          break;
        case 'term':
          queryClient.invalidateQueries({ queryKey: queryKeys.terms.all });
          break;
      }
    },
  });
}

// ============================================================================
// Quiz Score Mutation
// ============================================================================

interface SubmitQuizScoreParams {
  score: number;
  totalQuestions: number;
  category?: string;
}

interface QuizScoreResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
}

/**
 * Mutation hook for submitting quiz scores
 * Includes optimistic update for immediate feedback
 */
export function useSubmitQuizScoreMutation() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ score, totalQuestions, category }: SubmitQuizScoreParams): Promise<QuizScoreResult> => {
      // This would integrate with your backend/storage
      const result: QuizScoreResult = {
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        timestamp: new Date().toISOString(),
      };

      // Simulate async storage (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 100));

      return result;
    },
    onSuccess: (result) => {
      if (result.percentage >= 80) {
        showToast(`Great job! ${result.percentage}% correct!`, 'success');
      } else if (result.percentage >= 60) {
        showToast(`Good effort! ${result.percentage}% correct`, 'info');
      }
    },
    onError: () => {
      showToast('Failed to save quiz score. Please try again.', 'error');
    },
  });
}

// ============================================================================
// Profile Update Mutation
// ============================================================================

interface UpdateProfileParams {
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Mutation hook for updating user profile
 * Uses optimistic updates for immediate UI feedback
 */
export function useUpdateProfileMutation() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateProfileParams) => {
      // This would integrate with your auth context or API
      await new Promise(resolve => setTimeout(resolve, 200));
      return updates;
    },
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['profile']);

      // Optimistically update
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        ...newProfile,
      }));

      return { previousProfile };
    },
    onError: (_err, _newProfile, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      showToast('Failed to update profile', 'error');
    },
    onSuccess: () => {
      showToast('Profile updated', 'success');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ============================================================================
// Prefetch Hooks (for navigation optimization)
// ============================================================================

/**
 * Hook to prefetch composer details before navigation
 * Call on hover or focus to improve perceived performance
 */
export function usePrefetchComposer() {
  const queryClient = useQueryClient();

  return (composerId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.composers.byId(composerId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

/**
 * Hook to prefetch term details before navigation
 */
export function usePrefetchTerm() {
  const queryClient = useQueryClient();

  return (termId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.terms.byId(termId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
