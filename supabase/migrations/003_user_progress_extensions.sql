-- ============================================
-- User Progress Extensions for Gamification
-- ============================================
-- Run after 002_gamification_tables.sql

-- Add gamification fields to existing user_progress table
alter table public.user_progress
  add column if not exists xp int default 0,
  add column if not exists current_streak int default 0,
  add column if not exists longest_streak int default 0,
  add column if not exists last_activity_date date,
  add column if not exists listening_minutes int default 0;

-- Index for streak queries
create index if not exists idx_user_progress_streak on public.user_progress(current_streak desc);
create index if not exists idx_user_progress_xp on public.user_progress(xp desc);
