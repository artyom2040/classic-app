/**
 * Leaderboard Service
 * Handles quiz score submission and leaderboard fetching
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Logger } from '../utils/logger';
import { LeaderboardEntry, LeaderboardPeriod } from '../types';

interface SubmitScoreParams {
    score: number;
    totalQuestions: number;
}

// Get current week number
function getCurrentWeek(): { week: number; year: number } {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 604800000; // ms in a week
    const week = Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
    return { week, year: now.getFullYear() };
}

// Get current month
function getCurrentMonth(): { month: number; year: number } {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * Submit a quiz score for the authenticated user
 */
export async function submitQuizScore({ score, totalQuestions }: SubmitScoreParams): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured() || !supabase) {
        Logger.warn('Leaderboard', 'Supabase not configured, score not submitted');
        return { error: null }; // Silent fail for local-only mode
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        Logger.warn('Leaderboard', 'User not authenticated, score not submitted');
        return { error: null };
    }

    const { week, year } = getCurrentWeek();

    const { error } = await supabase
        .from('quiz_scores')
        .insert({
            user_id: user.id,
            score,
            total_questions: totalQuestions,
            week_number: week,
            year,
        });

    if (error) {
        Logger.error('Leaderboard', 'Failed to submit quiz score', { error: error.message });
        return { error: new Error(error.message) };
    }

    Logger.info('Leaderboard', 'Quiz score submitted', { score, totalQuestions, week, year });
    return { error: null };
}

/**
 * Fetch weekly leaderboard
 */
export async function getWeeklyLeaderboard(limit = 50): Promise<{ data: LeaderboardEntry[]; error: Error | null }> {
    if (!isSupabaseConfigured() || !supabase) {
        return { data: [], error: null };
    }

    const { week, year } = getCurrentWeek();

    const { data, error } = await supabase
        .from('weekly_leaderboard')
        .select('*')
        .eq('year', year)
        .eq('week_number', week)
        .order('total_score', { ascending: false })
        .limit(limit);

    if (error) {
        Logger.error('Leaderboard', 'Failed to fetch weekly leaderboard', { error: error.message });
        return { data: [], error: new Error(error.message) };
    }

    const entries: LeaderboardEntry[] = (data || []).map((row, index) => ({
        userId: row.user_id,
        displayName: row.display_name || 'Anonymous',
        avatarUrl: row.avatar_url,
        totalScore: row.total_score,
        quizzesTaken: row.quizzes_taken,
        avgPercentage: row.avg_percentage,
        rank: index + 1,
    }));

    return { data: entries, error: null };
}

/**
 * Fetch monthly leaderboard
 */
export async function getMonthlyLeaderboard(limit = 50): Promise<{ data: LeaderboardEntry[]; error: Error | null }> {
    if (!isSupabaseConfigured() || !supabase) {
        return { data: [], error: null };
    }

    const { month, year } = getCurrentMonth();

    const { data, error } = await supabase
        .from('monthly_leaderboard')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('total_score', { ascending: false })
        .limit(limit);

    if (error) {
        Logger.error('Leaderboard', 'Failed to fetch monthly leaderboard', { error: error.message });
        return { data: [], error: new Error(error.message) };
    }

    const entries: LeaderboardEntry[] = (data || []).map((row, index) => ({
        userId: row.user_id,
        displayName: row.display_name || 'Anonymous',
        avatarUrl: row.avatar_url,
        totalScore: row.total_score,
        quizzesTaken: row.quizzes_taken,
        avgPercentage: row.avg_percentage,
        rank: index + 1,
    }));

    return { data: entries, error: null };
}

/**
 * Get current user's rank
 */
export async function getUserRank(period: LeaderboardPeriod): Promise<{ rank: number | null; totalScore: number; error: Error | null }> {
    if (!isSupabaseConfigured() || !supabase) {
        return { rank: null, totalScore: 0, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { rank: null, totalScore: 0, error: null };
    }

    const leaderboard = period === 'week'
        ? await getWeeklyLeaderboard(1000)
        : await getMonthlyLeaderboard(1000);

    if (leaderboard.error) {
        return { rank: null, totalScore: 0, error: leaderboard.error };
    }

    const userEntry = leaderboard.data.find(entry => entry.userId === user.id);

    return {
        rank: userEntry?.rank || null,
        totalScore: userEntry?.totalScore || 0,
        error: null,
    };
}
