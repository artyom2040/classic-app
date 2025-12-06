import { Session } from '@supabase/supabase-js';
import { supabase, getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export async function signInWithEmail(email: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured for auth');
  }
  const client = getSupabaseClient();
  return client.auth.signInWithOtp({ email });
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  return client.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } }, error: null };
  }
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
