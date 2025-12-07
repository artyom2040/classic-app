import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

/**
 * Hook to handle deep links for authentication (password reset, email verification, etc.)
 * 
 * Handles URLs like:
 * - contextcomposer://reset-password?token=xxx
 * - contextcomposer://verify-email?token=xxx
 * - contextcomposer://auth-callback?access_token=xxx&refresh_token=xxx
 */
export function useAuthDeepLink() {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    // Handle deep links when app is already open
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      
      if (!url || !supabase) return;

      try {
        // Parse the URL
        const parsedUrl = new URL(url);
        const params = parsedUrl.searchParams;

        // Handle auth callback with tokens
        if (parsedUrl.pathname === '/auth-callback' || url.includes('access_token')) {
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // Handle password reset
        if (parsedUrl.pathname === '/reset-password' || url.includes('type=recovery')) {
          // The token will be handled by Supabase auth state change
          // User will be prompted to set a new password
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // Handle email verification
        if (parsedUrl.pathname === '/verify-email' || url.includes('type=signup')) {
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // Close web browser if it was used for OAuth
        if (Platform.OS !== 'web') {
          WebBrowser.dismissBrowser();
        }
      } catch (error) {
        console.warn('Failed to handle deep link:', error);
      }
    };

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link that opened the app
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    handleInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);
}

/**
 * Get the redirect URL for OAuth flows based on the platform
 */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web') {
    // For web, use the current origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth-callback`;
    }
    return process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'http://localhost:19006/auth-callback';
  }
  
  // For native apps, use the custom scheme
  return 'contextcomposer://auth-callback';
}
