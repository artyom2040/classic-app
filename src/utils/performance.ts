/**
 * Performance utilities for memoization and optimization
 */

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Logger } from './logger';

/**
 * Memoizes expensive calculations with dependency tracking
 */
export function useExpensiveCalculation<T>(
    fn: () => T,
    deps: React.DependencyList,
    debugName?: string
): T {
    return useMemo(() => {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;

        if (debugName && duration > 16) { // Log if takes more than a frame
            Logger.performance('Performance', debugName, duration);
        }

        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

/**
 * Creates a truly stable callback that never changes reference
 * but always calls the latest version of the callback.
 * 
 * This is useful for:
 * - Event handlers passed to memoized children (prevents re-renders)
 * - Callbacks used in useEffect that shouldn't trigger re-runs
 * - Avoiding stale closure issues in async operations
 * 
 * @example
 * const handleClick = useStableCallback((id: string) => {
 *   // Always has access to latest state/props
 *   console.log(currentState, id);
 * });
 */
export function useStableCallback<T extends (...args: any[]) => any>(
    callback: T
): T {
    const callbackRef = useRef<T>(callback);

    // Update ref on every render to always have latest callback
    useEffect(() => {
        callbackRef.current = callback;
    });

    // Return stable function that delegates to current ref
    return useCallback(
        ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
        []
    );
}

/**
 * Debounces a function call
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const callbackRef = useRef<T>(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    return useMemo(
        () => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay) as T,
        [delay]
    );
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle utility function
 */
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
    const start = useMemo(() => performance.now(), []);

    useEffect(() => {
        const duration = performance.now() - start;
        Logger.performance('Performance', `${componentName} mounted`, duration);
    }, [componentName, start]);
}
