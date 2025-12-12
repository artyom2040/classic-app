/**
 * useAsyncData Hook
 *
 * Standardized pattern for fetching async data with:
 * - Loading state
 * - Error state with error message
 * - Fallback data while loading
 * - Automatic retry capability
 * - Type safety with generics
 *
 * Usage:
 * const { data, error, isLoading, retry } = useAsyncData(
 *   () => DataService.getComposers(),
 *   [],
 *   { onError: (err) => showToast(`Error: ${err.message}`) }
 * );
 *
 * if (isLoading) return <SkeletonLoader />;
 * if (error) return <ErrorUI onRetry={retry} />;
 * return <Content data={data} />;
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface UseAsyncDataOptions {
  /**
   * Maximum number of retry attempts (default: 1)
   */
  maxRetries?: number;

  /**
   * Timeout in milliseconds (default: none)
   */
  timeout?: number;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when data loads successfully
   */
  onSuccess?: (data: any) => void;

  /**
   * Whether to skip initial fetch (default: false)
   */
  skip?: boolean;
}

export interface UseAsyncDataResult<T> {
  /**
   * The fetched data or fallback value
   */
  data: T;

  /**
   * Error object if fetch failed
   */
  error: Error | null;

  /**
   * Whether data is currently loading
   */
  isLoading: boolean;

  /**
   * Whether a retry is in progress
   */
  isRetrying: boolean;

  /**
   * Manual retry function
   */
  retry: () => void;
}

/**
 * Hook for fetching async data with automatic error handling and retry
 *
 * @template T The type of data being fetched
 * @param fetchFn Function that returns a Promise of the data
 * @param fallback Default value to use while loading or on error
 * @param options Configuration options
 * @returns Object with data, error, loading states, and retry function
 *
 * @example
 * const { data, error, isLoading, retry } = useAsyncData(
 *   async () => {
 *     const response = await fetch('/api/composers');
 *     return response.json();
 *   },
 *   [],
 *   { maxRetries: 3, onError: (err) => alert(err.message) }
 * );
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  fallback: T,
  options?: UseAsyncDataOptions
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!options?.skip);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    maxRetries = 1,
    timeout,
    onError,
    onSuccess,
    skip = false,
  } = options || {};

  /**
   * Perform the actual fetch with error handling
   */
  const performFetch = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create abort controller for timeout support
      abortControllerRef.current = new AbortController();
      let timeoutHandle: NodeJS.Timeout | null = null;

      const fetchPromise = fetchFn();

      // Add timeout if specified
      const timeoutPromise = timeout
        ? new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
              abortControllerRef.current?.abort();
              reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);
          })
        : null;

      // Race timeout and fetch
      const result = timeoutPromise
        ? await Promise.race([fetchPromise, timeoutPromise])
        : await fetchPromise;

      if (timeoutHandle) clearTimeout(timeoutHandle);

      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (isMountedRef.current) {
        setError(error);
        onError?.(error);

        // Log error with context
        console.error('[useAsyncData] Fetch failed', {
          error: error.message,
          retries: retryCount,
          maxRetries,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  }, [fetchFn, onError, onSuccess, timeout, retryCount, maxRetries]);

  /**
   * Retry the fetch
   */
  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setIsRetrying(true);
      performFetch();
    } else {
      console.warn('[useAsyncData] Max retries reached', { maxRetries });
    }
  }, [retryCount, maxRetries, performFetch]);

  /**
   * Initial fetch on mount or when fetchFn changes
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (!skip) {
      performFetch();
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchFn, skip, performFetch]);

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retry,
  };
}
