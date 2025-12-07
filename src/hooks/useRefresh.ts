import { useState, useCallback } from 'react';

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

  const onRefresh = useCallback(async () => {
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
      
      setTimeout(() => {
        setRefreshing(false);
      }, remaining);
    }
  }, [refreshAction, minDuration]);

  return { refreshing, onRefresh };
}

export default useRefresh;
