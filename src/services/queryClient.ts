import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Provides centralized caching, background refetching,
 * and automatic retry for data fetching.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Cache data for 30 minutes
            gcTime: 30 * 60 * 1000,

            // Retry failed requests up to 2 times
            retry: 2,

            // Don't refetch on window focus for mobile
            refetchOnWindowFocus: false,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

/**
 * Query Keys Factory
 * Consistent query key structure for cache invalidation
 */
export const queryKeys = {
    // Composers
    composers: {
        all: ['composers'] as const,
        byId: (id: string) => ['composers', id] as const,
        byPeriod: (periodId: string) => ['composers', 'period', periodId] as const,
    },

    // Periods
    periods: {
        all: ['periods'] as const,
        byId: (id: string) => ['periods', id] as const,
    },

    // Forms
    forms: {
        all: ['forms'] as const,
        byId: (id: string) => ['forms', id] as const,
    },

    // Terms
    terms: {
        all: ['terms'] as const,
        byId: (id: string) => ['terms', id] as const,
        byCategory: (category: string) => ['terms', 'category', category] as const,
    },

    // Albums
    albums: {
        weekly: ['albums', 'weekly'] as const,
        monthly: ['albums', 'monthly'] as const,
        newReleases: ['albums', 'new'] as const,
        concertHalls: ['albums', 'halls'] as const,
    },
};

export default queryClient;
