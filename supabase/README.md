# Supabase Migrations

This directory contains all the SQL migrations needed to set up a new Supabase instance for the Classic App.

## Quick Setup

### Option 1: Using the Setup Script

```bash
cd supabase
chmod +x setup.sh
./setup.sh 'postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres'
```

### Option 2: Using Docker (VPS with self-hosted Supabase)

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Run migrations via Docker
cd supabase-project
cat /path/to/migrations/000_core_content_tables.sql | docker exec -i supabase-db psql -U postgres -d postgres
# ... repeat for other migration files
```

### Option 3: Manual via Supabase Studio

1. Open Supabase Studio (SQL Editor)
2. Run each migration file in order (see below)

---

## Migration Order

Run these in order:

| # | File | Description |
|---|------|-------------|
| 0 | `000_core_content_tables.sql` | Core content tables (composers, terms, forms, etc.) |
| 1 | `001_create_profiles_table.sql` | User profiles with RLS |
| 2 | `001_admin_dashboard.sql` | Audit logs and versioning for admin |
| 3 | `002_gamification_tables.sql` | Badges, lessons, user progress |
| 4 | `003_user_progress_extensions.sql` | XP, streaks, gamification fields |
| 5 | `004_fix_profiles_rls.sql` | Fix RLS infinite recursion |

---

## Seed Data

After migrations, populate data with seed files:

```bash
# Using import script (recommended)
SUPABASE_URL=https://your-api.com \
SUPABASE_SERVICE_ROLE_KEY=your-key \
npx ts-node --esm scripts/import-supabase-data.ts

# Or via SQL seeds
psql $DB_URL -f seeds/seed_periods.sql
psql $DB_URL -f seeds/seed_composers.sql
# ... etc
```

### Seed Files

| File | Content |
|------|---------|
| `seed_periods.sql` | 7 musical eras |
| `seed_composers.sql` | 70 composers |
| `seed_terms.sql` | 150 glossary terms |
| `seed_forms.sql` | 12 musical forms |
| `seed_releases.sql` | 3 new releases |
| `seed_concert_halls.sql` | 3 concert halls |
| `seed_weekly_albums.sql` | 12 weekly albums |
| `seed_monthly_spotlights.sql` | 12 monthly spotlights |
| `seed_badges.sql` | Gamification badges |
| `seed_kickstart_lessons.sql` | 5-day kickstart content |

---

## Tables Overview

### Content Tables (public read)
- `composers` - Composer bios, portraits, key works
- `periods` - Musical eras (Medieval → Contemporary)
- `forms` - Musical forms (Symphony, Sonata, etc.)
- `terms` - Glossary of musical terms
- `releases` - New album announcements
- `concert_halls` - Famous venues
- `weekly_albums` - Featured weekly listening
- `monthly_spotlights` - Monthly featured content

### User Tables (RLS protected)
- `profiles` - User profiles (linked to auth.users)
- `user_progress` - Learning progress tracking
- `user_badges` - Earned achievements
- `user_lesson_progress` - Lesson completion

### Admin Tables
- `audit_logs` - Change tracking
- `content_versions` - Content versioning for rollback

---

## Environment Variables

After setup, configure your app:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-api.com
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DATA_SOURCE=supabase
```

---

## Troubleshooting

### RLS Infinite Recursion
If you see "infinite recursion detected in policy", run `004_fix_profiles_rls.sql`.

### Table Not Found
Ensure you ran migrations in order, starting with `000_core_content_tables.sql`.

### Permission Denied
Make sure you're using the service role key for admin operations, not the anon key.
