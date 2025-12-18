/**
 * Tests for environment configuration utilities
 */

import {
    Environment,
    createConfig,
    isFeatureEnabled,
    isDebugEnabled,
    getApiBaseUrl
} from '../../config/environment';

// Mock Logger
jest.mock('../../utils/logger', () => ({
    Logger: {
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe('Environment Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Environment detection', () => {
        it('should detect development environment', () => {
            process.env.NODE_ENV = 'development';
            expect(Environment.isDevelopment()).toBe(true);
            expect(Environment.isProduction()).toBe(false);
        });

        it('should detect production environment', () => {
            process.env.NODE_ENV = 'production';
            expect(Environment.isProduction()).toBe(true);
            expect(Environment.isDevelopment()).toBe(false);
        });

        it('should detect staging environment', () => {
            process.env.NODE_ENV = 'staging';
            expect(Environment.isStaging()).toBe(true);
        });

        it('should return correct environment name', () => {
            process.env.NODE_ENV = 'production';
            expect(Environment.getCurrentEnvironment()).toBe('production');

            process.env.NODE_ENV = 'staging';
            expect(Environment.getCurrentEnvironment()).toBe('staging');

            process.env.NODE_ENV = 'development';
            expect(Environment.getCurrentEnvironment()).toBe('development');
        });

        it('should default to development for unknown environment', () => {
            process.env.NODE_ENV = 'unknown';
            expect(Environment.getCurrentEnvironment()).toBe('development');
        });
    });

    describe('createConfig', () => {
        it('should create config with environment variables', () => {
            // createConfig reads process.env at call time
            // Since module was already imported, we test the function behavior
            process.env.NODE_ENV = 'development';

            const config = createConfig();

            expect(config.environment).toBe('development');
            expect(config.debug.enableLogging).toBe(true);
            // Supabase URL comes from env at call time
            expect(typeof config.supabase.url).toBe('string');
            expect(typeof config.supabase.anonKey).toBe('string');
        });

        it('should use empty strings when env vars not set', () => {
            process.env.NODE_ENV = 'development';
            delete process.env.EXPO_PUBLIC_SUPABASE_URL;
            delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

            const config = createConfig();

            expect(config.supabase.url).toBe('');
            expect(config.supabase.anonKey).toBe('');
        });

        it('should enable debug features in development', () => {
            process.env.NODE_ENV = 'development';
            const config = createConfig();

            expect(config.debug.enableLogging).toBe(true);
            expect(config.debug.enablePerformance).toBe(true);
        });

        it('should disable debug features in production', () => {
            process.env.NODE_ENV = 'production';
            const config = createConfig();

            expect(config.debug.enableLogging).toBe(false);
            expect(config.features.analytics).toBe(true);
        });
    });

    describe('getApiBaseUrl', () => {
        it('should return a string URL', () => {
            // getApiBaseUrl uses the globally cached config
            const url = getApiBaseUrl();
            expect(typeof url).toBe('string');
        });
    });
});
