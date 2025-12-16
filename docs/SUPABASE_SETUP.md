# Supabase Setup (VPS)

Goal: host Supabase yourself, migrate JSON content, enable CRUD/admin, and keep local JSON as a fallback.

## 1) Prereqs
- Docker + docker-compose
- Supabase CLI (`npm i -g supabase`)
- Domain + TLS via reverse proxy (Caddy/NGINX)

## 2) Bootstrap Supabase on VPS (185.194.140.57)
Run these on the VPS (as a non-root user with docker permissions):
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
npm install -g supabase

mkdir -p ~/supabase/classic-app && cd ~/supabase/classic-app
supabase init --project-name classic-app
supabase start  # optional locally; for VPS we use docker compose below
```

Deploy services:
```bash
cd ~/supabase/classic-app
docker compose up -d
```

Expose behind HTTPS (Caddy/NGINX) pointing to:
- REST: 0.0.0.0:54321
- Studio: 0.0.0.0:54323
- Auth: 0.0.0.0:54322

## 3) Schema
See `docs/supabase/schema.sql` (tables) and `docs/supabase/rls.sql` (policies).
Apply:
```bash
# from repo root (with SUPABASE_DB_URL env that includes service role)
supabase db push --db-url "$SUPABASE_DB_URL"
psql "$SUPABASE_DB_URL" -f docs/supabase/rls.sql
```

## 4) Import existing JSON
Option A: `supabase db connect` then `\copy` from CSV:
```bash
supabase db connect --db-url "$SUPABASE_DB_URL"
\copy releases from '/path/releases.csv' csv header;
\copy concert_halls from '/path/concert_halls.csv' csv header;
... (repeat for other tables)
```

Option B: write a small node script to upsert via `@supabase/supabase-js` using the service role key (run locally, not in the app).

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
  - `RESEND_API_KEY=<resend-api-key>` (for email function)
  - `FROM_EMAIL=<verified-email>` (optional, defaults to noreply@resend.dev)
- DataService falls back to local JSON if Supabase errors or env is missing.

### Email Configuration (VPS)
On VPS at `/supabase-project/`, add to `.env`:
```bash
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=Classical Music <noreply@yourdomain.com>
```

Deploy email function:
```bash
cd /supabase-project
supabase functions deploy send-email --env-file .env
# Or restart services:
docker compose down && docker compose up -d
```

## 8) Ops
- Nightly `pg_dump` backup + WAL (point-in-time).
- Optional pgbouncer if connections grow.
- Monitor with Supabase Studio and Postgres logs.
