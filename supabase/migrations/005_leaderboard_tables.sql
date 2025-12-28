-- ============================================
-- Leaderboard Tables Migration
-- ============================================
-- Run after 002_gamification_tables.sql
-- Creates quiz_scores table for tracking quiz performance and leaderboards

-- Quiz scores table
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient leaderboard queries
CREATE INDEX IF NOT EXISTS idx_quiz_scores_week ON public.quiz_scores(year, week_number);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_created ON public.quiz_scores(created_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Users can insert their own scores
CREATE POLICY "Users can insert own quiz scores"
  ON public.quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own scores
CREATE POLICY "Users can read own quiz scores"
  ON public.quiz_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Create a view for the leaderboard (public access)
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
SELECT 
  qs.user_id,
  p.display_name,
  p.avatar_url,
  qs.year,
  qs.week_number,
  SUM(qs.score) as total_score,
  COUNT(*) as quizzes_taken,
  ROUND(AVG(qs.score::decimal / NULLIF(qs.total_questions, 0) * 100), 1) as avg_percentage
FROM public.quiz_scores qs
JOIN public.profiles p ON qs.user_id = p.id
GROUP BY qs.user_id, p.display_name, p.avatar_url, qs.year, qs.week_number
ORDER BY total_score DESC;

-- Create a view for monthly leaderboard
CREATE OR REPLACE VIEW public.monthly_leaderboard AS
SELECT 
  qs.user_id,
  p.display_name,
  p.avatar_url,
  qs.year,
  EXTRACT(MONTH FROM qs.created_at) as month,
  SUM(qs.score) as total_score,
  COUNT(*) as quizzes_taken,
  ROUND(AVG(qs.score::decimal / NULLIF(qs.total_questions, 0) * 100), 1) as avg_percentage
FROM public.quiz_scores qs
JOIN public.profiles p ON qs.user_id = p.id
GROUP BY qs.user_id, p.display_name, p.avatar_url, qs.year, EXTRACT(MONTH FROM qs.created_at)
ORDER BY total_score DESC;

-- Grant access to views
GRANT SELECT ON public.weekly_leaderboard TO authenticated;
GRANT SELECT ON public.monthly_leaderboard TO authenticated;
