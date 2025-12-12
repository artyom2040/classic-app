-- ============================================
-- Gamification Tables Migration
-- ============================================
-- Run after 001_create_profiles_table.sql

-- Badges definition table
create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text,
  icon text,
  category text,  -- 'kickstart', 'exploration', 'streak', 'milestone'
  xp_value int default 0,
  sort_order int default 0
);

-- Kickstart lessons content
create table if not exists public.kickstart_lessons (
  day int primary key,
  title text not null,
  subtitle text,
  icon text,
  duration text,
  content jsonb not null,
  badge_id text references public.badges(id),
  is_active boolean default true
);

-- User earned badges (junction table)
create table if not exists public.user_badges (
  user_id uuid references public.users(id) on delete cascade,
  badge_id text references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- User lesson progress tracking
create table if not exists public.user_lesson_progress (
  user_id uuid references public.users(id) on delete cascade,
  lesson_type text not null,  -- 'kickstart', 'deep_dive', 'challenge'
  lesson_id text not null,
  started_at timestamptz,
  completed_at timestamptz,
  progress_pct int default 0,
  primary key (user_id, lesson_type, lesson_id)
);

-- Enable RLS on new tables
alter table public.badges enable row level security;
alter table public.kickstart_lessons enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_lesson_progress enable row level security;

-- RLS policies for badges (public read)
create policy "Badges are viewable by everyone"
  on public.badges for select
  using (true);

-- RLS policies for kickstart_lessons (public read)
create policy "Kickstart lessons are viewable by everyone"
  on public.kickstart_lessons for select
  using (true);

-- RLS policies for user_badges (users see own)
create policy "Users can view own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "Users can earn badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- RLS policies for user_lesson_progress (users manage own)
create policy "Users can view own lesson progress"
  on public.user_lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
  on public.user_lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lesson progress"
  on public.user_lesson_progress for update
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_user_badges_user on public.user_badges(user_id);
create index if not exists idx_user_lesson_progress_user on public.user_lesson_progress(user_id);
create index if not exists idx_badges_category on public.badges(category);
