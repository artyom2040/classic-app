# Supabase Migration Plan

This app currently reads static JSON. To scale content and personalization, move to a Supabase stack hosted on your VPS (Postgres + Auth + Storage).

## Suggested Schema
- `releases(id, title, artist, release_date, description, highlight_track, listener_level, spotify_uri, apple_url, yt_query, image_url)`
- `concert_halls(id, name, city, description, signature_sound, map_url, hero_image)`
- `terms(id, term, category, short_definition, long_definition, media_links JSONB)`
- `news_posts(id, title, body_md, tags text[], published_at, hero_image)`
- `homepage_blocks(id, type, payload JSONB, position int, is_active bool)` (drives home layout/order)
- `users(id, auth_id, email, display_name, level_pref, created_at)`
- `user_progress(user_id, kickstart_day, viewed_terms int[], badges text[], viewed_forms text[], viewed_composers text[], viewed_periods text[], first_launch bool, updated_at)`
- `tags(id, name, kind)` and `work_tags(work_id, tag_id)` for listener level and other facets.

## Auth & Access
- Supabase Auth (email/magic link) for mobile/web; keep RLS enabled.
- RLS policies: users can read published content; write only their own progress; admin role for dashboard writes.

## Admin Dashboard (future)
- Small React web app using Supabase Auth.
- CRUD for releases, halls, terms, posts; drag/drop to set `homepage_blocks`.
- Upload assets to Supabase Storage (public-bucket with signed URLs).

## Mobile Integration Steps
1) Add Supabase client (`SUPABASE_URL`, `SUPABASE_ANON_KEY` via env/Secrets).  
2) Extend `DataService` to fetch from Supabase with a feature flag (`DATA_SOURCE = 'supabase'`).  
3) Cache responses in AsyncStorage for offline use.  
4) Wire auth (Supabase Auth → access token) and persist session.  
5) Migrate progress writes to Supabase `user_progress` while keeping a local fallback.

## VPS Hosting Notes
- Run Supabase Docker stack on VPS; place behind a reverse proxy with TLS.  
- Add nightly `pg_dump` backups; enable WAL archiving for point-in-time recovery.  
- Use pgbouncer if connections get heavy; monitor with Supabase Studio/pg_stat_statements.  
- Keep service keys out of the repo; use env files on the server/CI.
