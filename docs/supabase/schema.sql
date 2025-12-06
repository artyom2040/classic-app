-- Core content tables
create table if not exists public.releases (
  id text primary key,
  title text not null,
  artist text not null,
  release_date date not null,
  description text not null,
  highlight_track text,
  listener_level text check (listener_level in ('beginner','intermediate','advanced')),
  spotify_uri text,
  apple_url text,
  yt_query text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.concert_halls (
  id text primary key,
  name text not null,
  city text not null,
  description text not null,
  signature_sound text,
  map_url text,
  hero_image text,
  listener_level text check (listener_level in ('beginner','intermediate','advanced')),
  created_at timestamptz default now()
);

create table if not exists public.terms (
  id bigint primary key,
  term text not null,
  category text not null,
  short_definition text,
  long_definition text,
  media_links jsonb default '[]'::jsonb
);

create table if not exists public.periods (
  id text primary key,
  name text not null,
  years text,
  description text,
  key_characteristics text[],
  color text
);

create table if not exists public.forms (
  id text primary key,
  name text not null,
  category text,
  period text,
  description text,
  structure jsonb default '[]'::jsonb,
  listen_for text[],
  key_works jsonb default '[]'::jsonb
);

create table if not exists public.composers (
  id text primary key,
  name text not null,
  years text,
  period text,
  nationality text,
  portrait text,
  short_bio text,
  full_bio text,
  key_works jsonb default '[]'::jsonb,
  fun_fact text,
  listen_first text,
  spotify_uri text,
  youtube_search text
);

create table if not exists public.monthly_spotlights (
  month int primary key check (month between 1 and 12),
  type text not null,
  ref_id text not null,
  title text not null,
  subtitle text,
  description text,
  featured_works text[],
  challenge text
);

create table if not exists public.weekly_albums (
  week int primary key,
  title text not null,
  artist text not null,
  year int,
  description text,
  why_listen text,
  spotify_uri text,
  apple_music_url text,
  key_moments jsonb default '[]'::jsonb,
  listener_level text check (listener_level in ('beginner','intermediate','advanced'))
);

-- Homepage blocks for ordering/visibility
create table if not exists public.homepage_blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb default '{}'::jsonb,
  position int not null,
  is_active boolean default true
);

-- News / posts
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_md text not null,
  tags text[],
  published_at timestamptz default now(),
  hero_image text
);

-- Tagging
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null
);

create table if not exists public.work_tags (
  work_id text not null,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (work_id, tag_id)
);

-- Users & progress
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique,
  email text,
  display_name text,
  level_pref text,
  created_at timestamptz default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references public.users(id) on delete cascade,
  kickstart_day int default 0,
  kickstart_completed boolean default false,
  viewed_terms bigint[] default '{}',
  viewed_forms text[] default '{}',
  viewed_composers text[] default '{}',
  viewed_periods text[] default '{}',
  badges text[] default '{}',
  first_launch boolean default true,
  updated_at timestamptz default now()
);

-- RLS (enable; add policies in supabase studio or via migrations)
alter table public.releases enable row level security;
alter table public.concert_halls enable row level security;
alter table public.terms enable row level security;
alter table public.periods enable row level security;
alter table public.forms enable row level security;
alter table public.composers enable row level security;
alter table public.monthly_spotlights enable row level security;
alter table public.weekly_albums enable row level security;
alter table public.homepage_blocks enable row level security;
alter table public.news_posts enable row level security;
alter table public.tags enable row level security;
alter table public.work_tags enable row level security;
alter table public.users enable row level security;
alter table public.user_progress enable row level security;
