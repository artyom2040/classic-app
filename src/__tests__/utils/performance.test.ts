/**
 * Tests for performance utilities
 */

import { debounce, throttle } from '../../utils/performance';

// Mock Logger to avoid console output in tests
jest.mock('../../utils/logger', () => ({
    Logger: {
        performance: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Performance Utilities', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('debounce', () => {
        it('should delay function execution', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should reset timer on subsequent calls', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            jest.advanceTimersByTime(50);
            debouncedFn(); // Reset timer

            jest.advanceTimersByTime(50);
            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should pass arguments to the debounced function', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn('arg1', 'arg2');
            jest.advanceTimersByTime(100);

            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });

    describe('throttle', () => {
        it('should execute immediately on first call', () => {
            const fn = jest.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn();
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should ignore calls within throttle period', () => {
            const fn = jest.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should allow calls after throttle period', () => {
            const fn = jest.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn();
            jest.advanceTimersByTime(100);
            throttledFn();

            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('should pass arguments to the throttled function', () => {
            const fn = jest.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn('arg1', 'arg2');
            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });
});
