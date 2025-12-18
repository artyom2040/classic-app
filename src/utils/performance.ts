/**
 * Performance utilities for memoization and optimization
 */

import { useMemo, useCallback, useEffect } from 'react';

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
        const end = performance.now();
        
        if (debugName && end - start > 16) { // Log if takes more than a frame
            console.log(`[Performance] ${debugName} took ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    }, deps);
}

/**
 * Creates a memoized callback with dependency tracking
 */
export function useStableCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T {
    return useCallback(callback, deps);
}

/**
 * Debounces a function call
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
    deps: React.DependencyList = []
): T {
    return useCallback(
        debounce(callback, delay),
        deps
    ) as T;
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
        const end = performance.now();
        console.log(`[Performance] ${componentName} mounted in ${(end - start).toFixed(2)}ms`);
    }, [componentName, start]);
}
