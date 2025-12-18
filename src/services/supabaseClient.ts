import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/storage';
import { getSupabaseConfig, validateConfig, LoggerConfig } from '../config/environment';
import { Logger } from '../utils/logger';

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  Logger.error('SupabaseClient', 'Configuration validation failed', { 
    error: error instanceof Error ? error.message : String(error) 
  });
}

let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client with environment configuration
 */
function initializeSupabase(): SupabaseClient | null {
  try {
    const config = getSupabaseConfig();
    
    Logger.info('SupabaseClient', 'Initializing Supabase client', {
      url: config.url.substring(0, 30) + '...',
      hasServiceKey: !!config.serviceKey,
      platform: Platform.OS,
    });

    return createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: AsyncStorage,
        storageKey: STORAGE_KEYS.AUTH_SESSION,
        detectSessionInUrl: false,
      },
      global: {
        // Add request interceptors for logging
        headers: {
          'x-client-platform': Platform.OS,
          'x-client-version': '1.0.0',
        },
      },
    });
  } catch (error) {
    Logger.error('SupabaseClient', 'Failed to initialize Supabase', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

// Initialize Supabase client
supabase = initializeSupabase();

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const configured = Boolean(supabase);
  
  if (!configured && LoggerConfig.enabled) {
    Logger.warn('SupabaseClient', 'Supabase not configured - check environment variables');
  }
  
  return configured;
}

/**
 * Get the Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
      'in your environment variables. For VPS deployment, ensure these point to your Supabase project.'
    );
  }
  return supabase;
}

/**
 * Get Supabase service role client (for server-side operations)
 * Only use this in trusted environments
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  try {
    const config = getSupabaseConfig();
    
    if (!config.serviceKey) {
      Logger.warn('SupabaseClient', 'Service key not configured');
      return null;
    }
    
    return createClient(config.url, config.serviceKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (error) {
    Logger.error('SupabaseClient', 'Failed to create service client', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) return false;
    
    const { data, error } = await supabase.from('test_table').select('*').limit(1);
    
    if (error) {
    Logger.error('SupabaseClient', 'Connection test failed', {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof Error ? (error as any).code : undefined,
    });
      return false;
    }
    
    Logger.info('SupabaseClient', 'Connection test successful', { recordCount: data?.length });
    return true;
  } catch (error) {
    Logger.error('SupabaseClient', 'Connection test threw error', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
}

export { supabase };
