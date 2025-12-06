import { UserProgress } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

/**
 * Push local progress to Supabase. Requires a logged-in user id.
 */
export async function pushProgressToSupabase(userId: string, progress: UserProgress): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  const { error } = await client
    .from('user_progress')
    .upsert({ user_id: userId, ...progress, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/**
 * Pull progress from Supabase for a user.
 */
export async function pullProgressFromSupabase(userId: string): Promise<UserProgress | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as UserProgress;
}
