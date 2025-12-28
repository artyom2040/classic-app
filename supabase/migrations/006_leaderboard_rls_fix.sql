-- ============================================
-- Leaderboard RLS Fix
-- ============================================
-- The original migrations restrict reads too tightly for leaderboard views.
-- Views need to read ALL users' scores and profile info (display_name, avatar_url).
-- 
-- This adds policies to enable the leaderboard views to work properly.

-- ============================================
-- FIX 1: quiz_scores - allow all authenticated users to read
-- ============================================
CREATE POLICY "Authenticated users can read all quiz scores for leaderboard"
  ON public.quiz_scores FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FIX 2: profiles - allow public read for leaderboard display
-- ============================================
-- This allows the leaderboard view to read display_name and avatar_url
CREATE POLICY "Authenticated users can read profiles for leaderboard"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
