import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRefreshResult {
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * Hook to handle pull-to-refresh functionality
 *
 * @param refreshAction - Async function to call when refreshing
 * @param minDuration - Minimum duration to show refresh indicator (ms)
 * @returns refreshing state and onRefresh handler
 *
 * @example
 * ```tsx
 * const { refreshing, onRefresh } = useRefresh(async () => {
 *   await fetchData();
 * });
 *
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *   }
 * >
 * ```
 */
export function useRefresh(
  refreshAction: () => Promise<void>,
  minDuration: number = 500
): UseRefreshResult {
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setRefreshing(true);

    const startTime = Date.now();

    try {
      await refreshAction();
    } catch (error) {
      console.warn('Refresh failed:', error);
    } finally {
      // Ensure minimum refresh duration for better UX
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      timeoutRef.current = setTimeout(() => {
        setRefreshing(false);
        timeoutRef.current = null;
      }, remaining);
    }
  }, [refreshAction, minDuration]);

  return { refreshing, onRefresh };
}

export default useRefresh;
