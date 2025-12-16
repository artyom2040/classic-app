-- ============================================
-- 000: Core Content Tables
-- ============================================
-- Run this first to create all content tables
-- These tables store the app's main data: composers, periods, forms, etc.

-- Releases (new album announcements)
CREATE TABLE IF NOT EXISTS public.releases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  highlight_track TEXT,
  listener_level TEXT CHECK (listener_level IN ('beginner','intermediate','advanced')),
  spotify_uri TEXT,
  apple_url TEXT,
  yt_query TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concert Halls
CREATE TABLE IF NOT EXISTS public.concert_halls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL,
  signature_sound TEXT,
  map_url TEXT,
  hero_image TEXT,
  listener_level TEXT CHECK (listener_level IN ('beginner','intermediate','advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary Terms
CREATE TABLE IF NOT EXISTS public.terms (
  id BIGINT PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL,
  short_definition TEXT,
  long_definition TEXT,
  media_links JSONB DEFAULT '[]'::JSONB
);

-- Musical Periods/Eras
CREATE TABLE IF NOT EXISTS public.periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  years TEXT,
  description TEXT,
  key_characteristics TEXT[],
  color TEXT
);

-- Musical Forms
CREATE TABLE IF NOT EXISTS public.forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  period TEXT,
  description TEXT,
  structure JSONB DEFAULT '[]'::JSONB,
  listen_for TEXT[],
  key_works JSONB DEFAULT '[]'::JSONB
);

-- Composers
CREATE TABLE IF NOT EXISTS public.composers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  years TEXT,
  period TEXT,
  nationality TEXT,
  portrait TEXT,
  short_bio TEXT,
  full_bio TEXT,
  key_works JSONB DEFAULT '[]'::JSONB,
  fun_fact TEXT,
  listen_first TEXT,
  spotify_uri TEXT,
  youtube_search TEXT
);

-- Monthly Spotlights
CREATE TABLE IF NOT EXISTS public.monthly_spotlights (
  month INT PRIMARY KEY CHECK (month BETWEEN 1 AND 12),
  type TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  featured_works TEXT[],
  challenge TEXT
);

-- Weekly Albums
CREATE TABLE IF NOT EXISTS public.weekly_albums (
  week INT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INT,
  description TEXT,
  why_listen TEXT,
  spotify_uri TEXT,
  apple_music_url TEXT,
  key_moments JSONB DEFAULT '[]'::JSONB,
  listener_level TEXT CHECK (listener_level IN ('beginner','intermediate','advanced'))
);

-- Homepage blocks for ordering/visibility
CREATE TABLE IF NOT EXISTS public.homepage_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  position INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- News/Posts
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  tags TEXT[],
  published_at TIMESTAMPTZ DEFAULT NOW(),
  hero_image TEXT
);

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.work_tags (
  work_id TEXT NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, tag_id)
);

-- Legacy Users table (for backward compatibility)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  level_pref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  kickstart_day INT DEFAULT 0,
  kickstart_completed BOOLEAN DEFAULT FALSE,
  viewed_terms BIGINT[] DEFAULT '{}',
  viewed_forms TEXT[] DEFAULT '{}',
  viewed_composers TEXT[] DEFAULT '{}',
  viewed_periods TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  first_launch BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public read access" ON public.releases FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.concert_halls FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.terms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.periods FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.forms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.composers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.monthly_spotlights FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.weekly_albums FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.homepage_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.news_posts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.work_tags FOR SELECT USING (true);

-- Service role full access for admin operations
CREATE POLICY "Service role full access" ON public.releases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.concert_halls FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.terms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.periods FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.forms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.composers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.monthly_spotlights FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.weekly_albums FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.homepage_blocks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.news_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.tags FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public.work_tags FOR ALL USING (auth.role() = 'service_role');

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_composers_period ON public.composers(period);
CREATE INDEX IF NOT EXISTS idx_forms_category ON public.forms(category);
CREATE INDEX IF NOT EXISTS idx_forms_period ON public.forms(period);
CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms(category);
CREATE INDEX IF NOT EXISTS idx_releases_date ON public.releases(release_date DESC);
