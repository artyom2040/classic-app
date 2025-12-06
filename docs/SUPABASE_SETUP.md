# Supabase Setup (VPS)

Goal: host Supabase yourself, migrate JSON content, enable CRUD/admin, and keep local JSON as a fallback.

## 1) Prereqs
- Docker + docker-compose
- Supabase CLI (`npm i -g supabase`)
- Domain + TLS via reverse proxy (Caddy/NGINX)

## 2) Bootstrap Supabase locally/on VPS
```bash
supabase init --project-name classic-app
supabase start        # starts Postgres, REST, Studio locally
```

For VPS:
1. Copy the generated `docker-compose.yml` to the VPS.
2. Set env values (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` etc.).
3. Run `docker compose up -d`.
4. Put REST and Studio behind HTTPS (reverse proxy).

## 3) Schema
See `docs/supabase/schema.sql` (tables: releases, concert_halls, terms, periods, forms, composers, homepage_blocks, news_posts, users, user_progress, tags/work_tags). Apply with:
```bash
supabase db push --db-url "$SUPABASE_DB_URL"
# or locally: supabase db reset
```

## 4) Import existing JSON
- Export JSON to CSV or JSONL; use `supabase import` or direct `psql \copy`.
- Minimal approach: `supabase db connect` then run `\copy releases from 'releases.csv' csv header;` etc.
- Keep `EXPO_PUBLIC_DATA_SOURCE=local` until data is loaded; switch to `supabase` after verifying.

## 5) Auth & RBAC
- Use Supabase Auth (email/magic link).
- Enable RLS on all tables. Example policy:
  - Public read for published content tables (releases, concert_halls, terms, news_posts).
  - `user_progress`: `user_id = auth.uid()`.
  - Admin role: create `app_admin` JWT claim or use service role for the admin dashboard; grant full CRUD via policies.

## 6) Admin Dashboard (future)
- React web app using Supabase Auth.
- CRUD for releases/halls/terms/posts; drag/drop ordering for `homepage_blocks`.
- Asset uploads to Supabase Storage (public bucket with signed URLs).

## 7) App Config
- Add to your env (app.json or .env for bundler):
  - `EXPO_PUBLIC_DATA_SOURCE=supabase`
  - `EXPO_PUBLIC_SUPABASE_URL=<your-url>`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
- DataService already falls back to local JSON if Supabase errors or env is missing.

## 8) Ops
- Nightly `pg_dump` backup + WAL (point-in-time).
- Optional pgbouncer if connections grow.
- Monitor with Supabase Studio and Postgres logs.
