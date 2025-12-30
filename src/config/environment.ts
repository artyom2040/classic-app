/**
 * Environment configuration management
 * 
 * This file centralizes all environment variables and configuration
 * for different deployment environments (development, staging, production)
 */

import { Logger } from '../utils/logger';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  /**
   * @deprecated Service keys should NEVER be exposed in client code.
   * Use server-side functions (Supabase Edge Functions) for admin operations.
   * This field is kept for backwards compatibility but will be undefined in client builds.
   */
  serviceKey?: string;
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  supabase: SupabaseConfig;
  features: {
    analytics: boolean;
    errorTracking: boolean;
    remoteConfig: boolean;
  };
  debug: {
    enableLogging: boolean;
    enablePerformance: boolean;
    enableNetwork: boolean;
  };
}

/**
 * Environment detection utilities
 */
export const Environment = {
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isStaging: () => process.env.NODE_ENV === 'staging',

  getCurrentEnvironment: (): AppConfig['environment'] => {
    const env = process.env.NODE_ENV as string;
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    return 'development';
  },
};

/**
 * Configuration factory based on environment
 */
export function createConfig(): AppConfig {
  const environment = Environment.getCurrentEnvironment();

  // Base configurations for different environments
  const configs: Record<AppConfig['environment'], Partial<AppConfig>> = {
    development: {
      apiUrl: 'http://localhost:3000',
      features: {
        analytics: false,
        errorTracking: false,
        remoteConfig: false,
      },
      debug: {
        enableLogging: true,
        enablePerformance: true,
        enableNetwork: true,
      },
    },
    staging: {
      apiUrl: 'https://staging.api.artyom2040.com',
      features: {
        analytics: true,
        errorTracking: true,
        remoteConfig: true,
      },
      debug: {
        enableLogging: true,
        enablePerformance: true,
        enableNetwork: true,
      },
    },
    production: {
      apiUrl: 'https://api.artyom2040.com',
      features: {
        analytics: true,
        errorTracking: true,
        remoteConfig: true,
      },
      debug: {
        enableLogging: false,
        enablePerformance: false,
        enableNetwork: false,
      },
    },
  };

  // Merge base config with environment-specific overrides
  const baseConfig = configs[environment];

  // SECURITY: Service keys should NEVER be bundled into client code.
  // They bypass RLS and could allow unauthorized data access.
  // Use Supabase Edge Functions for admin operations instead.
  const hasServiceKeyExposed = !!process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;
  if (hasServiceKeyExposed && environment === 'production') {
    Logger.error('Config', 'SECURITY WARNING: Service key exposed via EXPO_PUBLIC prefix. Remove EXPO_PUBLIC_SUPABASE_SERVICE_KEY from your environment.');
  }

  return {
    environment,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || baseConfig.apiUrl!,
    supabase: {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      // Service key intentionally omitted from client config for security
      serviceKey: undefined,
    },
    features: baseConfig.features!,
    debug: baseConfig.debug!,
  };
}

/**
 * Global configuration instance
 */
export const config = createConfig();

/**
 * Validate configuration
 * Note: Uses config object instead of process.env[key] because Expo web builds
 * replace static process.env.X references but not dynamic access like process.env[key]
 */
export function validateConfig(): void {
  const missing: string[] = [];

  // Check using the config object which uses static property access
  if (!config.supabase.url) {
    missing.push('EXPO_PUBLIC_SUPABASE_URL');
  }
  if (!config.supabase.anonKey) {
    missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    Logger.warn('Config', 'Missing required environment variables', { missing });
    if (config.environment === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * Get Supabase configuration with validation
 */
export function getSupabaseConfig(): SupabaseConfig {
  const { supabase } = config;

  if (!supabase.url || !supabase.anonKey) {
    throw new Error('Supabase configuration is incomplete. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

/**
 * Update configuration at runtime (for dynamic environment changes)
 */
export function updateConfig(updates: Partial<AppConfig>): void {
  Object.assign(config, updates);
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.features[feature];
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(debug: keyof AppConfig['debug']): boolean {
  return config.debug[debug];
}

/**
 * Get API base URL with environment override support
 */
export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL || config.apiUrl;
}

/**
 * Configuration for different deployment scenarios
 */
export const DeploymentConfigs = {
  // Local development
  local: {
    apiUrl: 'http://localhost:3000',
    supabaseUrl: 'http://localhost:54321',
    supabaseAnonKey: 'local-anon-key',
  },

  // VPS deployment (your setup)
  vps: {
    apiUrl: 'https://api.artyom2040.com',
    supabaseUrl: 'https://your-supabase-project.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Production (if different from VPS)
  production: {
    apiUrl: 'https://api.artyom2040.com',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};

/**
 * Environment-specific logger configuration
 */
export const LoggerConfig = {
  enabled: isDebugEnabled('enableLogging'),
  level: isDebugEnabled('enableLogging') ? 'debug' : 'error',
  includeTimestamp: true,
  includeContext: true,
};
