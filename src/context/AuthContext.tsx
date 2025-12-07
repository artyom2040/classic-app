import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { UserProfile, UserRole, AuthState } from '../types';

// Configure Google Sign In safely
function initializeGoogleSignIn() {
  try {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    });
  } catch (error) {
    console.error('[Auth] Google Sign-In initialization failed:', error);
  }
}

// Initialize on module load
initializeGoogleSignIn();

// ============================================
// Context Types
// ============================================

interface AuthContextType extends AuthState {
  // Email Auth
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;

  // OAuth
  signInWithApple: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;

  // Profile
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl'>>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Helper Functions
// ============================================

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.error('[Auth] Supabase not configured when fetching profile');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('[Auth] Failed to fetch user profile for ID:', userId, 'Error:', error?.message);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    role: data.role as UserRole,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

async function createUserProfile(user: User): Promise<UserProfile | null> {
  if (!supabase) {
    console.error('[Auth] Supabase not configured when creating profile');
    return null;
  }

  const profile = {
    id: user.id,
    email: user.email || '',
    display_name: user.user_metadata?.display_name || user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: 'user' as UserRole,
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' });

  if (error) {
    console.error('[Auth] Failed to create user profile for ID:', user.id, 'Error:', error.message);
    return null;
  }

  return fetchUserProfile(user.id);
}

// ============================================
// Provider Component
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('[Auth] Supabase not configured');
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        console.log('[Auth] Session found for user:', session.user.id);
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        console.log('[Auth] No active session');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] User signed in:', session.user.id);
        let profile = await fetchUserProfile(session.user.id);
        if (!profile) {
          console.log('[Auth] Profile not found, creating new profile for:', session.user.id);
          profile = await createUserProfile(session.user);
        }
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        console.log('[Auth] User updated:', session.user.id);
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email sign in
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  // Email sign up
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    const redirectUrl = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'contextcomposer://reset-password';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? new Error(error.message) : null };
  }, []);

  // Apple Sign In with native authentication
  const signInWithApple = useCallback(async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    if (Platform.OS !== 'ios') {
      return { error: new Error('Apple Sign In is only available on iOS') };
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { error: new Error('No identity token received') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      return { error: error ? new Error(error.message) : null };
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { error: null }; // User cancelled
      }
      return { error: new Error(error.message || 'Apple Sign In failed') };
    }
  }, []);

  // Google Sign In with native authentication
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        return { error: new Error('No ID token received') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      return { error: error ? new Error(error.message) : null };
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { error: null }; // User cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { error: new Error('Sign in already in progress') };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { error: new Error('Play Services not available') };
      }
      return { error: new Error(error.message || 'Google Sign In failed') };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl'>>) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  }, [user]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.id);
    if (profile) setUser(profile);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    signInWithApple,
    signInWithGoogle,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
