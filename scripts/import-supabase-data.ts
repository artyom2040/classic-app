/**
 * Supabase seeding/import script.
 *
 * - Reads local JSON data from src/data
 * - Connects to Supabase (anon or service role) using env vars
 * - Upserts core tables: releases, concert_halls, weekly_albums, monthly_spotlights, terms, composers, periods, forms
 *
 * Usage:
 *   NODE_OPTIONS=--loader=ts-node/esm \
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   npm run import:supabase
 *
 * Best practices (Dec 2025-ish):
 * - Use the service role key only in tooling scripts (never ship to app).
 * - Upsert with primary keys to keep idempotent alignment.
 * - Run in CI or from a secure workstation/VPN when pushing data to prod.
 * - Keep schema/constraints authoritative; script just fills data.
 * - Validate payload shapes before upsert; fail fast on errors.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type TablePayload = Record<string, any>;

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helpers
const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const loadJson = (file: string) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));

async function upsert(table: string, rows: TablePayload[], conflict?: string) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
  if (error) {
    console.error(`Upsert failed for ${table}:`, error);
    throw error;
  }
  console.log(`Upserted ${rows.length} rows into ${table}`);
}

async function main() {
  // Load local data
  const albums = loadJson('albums.json');
  const glossary = loadJson('glossary.json');
  const composers = loadJson('composers.json');
  const periods = loadJson('periods.json');
  const forms = loadJson('forms.json');

  // Prepare rows per table
  const releases = (albums.newReleases || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    release_date: r.releaseDate,
    description: r.description,
    highlight_track: r.highlightTrack || null,
    listener_level: r.listenerLevel || null,
    spotify_uri: r.spotifyUri || null,
    apple_url: r.appleMusicUrl || null,
    yt_query: `${r.title} ${r.artist}`,
    image_url: r.imageUrl || null,
  }));

  const concertHalls = (albums.concertHalls || []).map((h: any) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    description: h.description,
    signature_sound: h.signatureSound || null,
    map_url: h.mapUrl || null,
    hero_image: h.heroImage || null,
    listener_level: h.listenerLevel || null,
  }));

  const weeklyAlbums = (albums.weeklyAlbums || []).map((w: any) => ({
    week: w.week,
    title: w.title,
    artist: w.artist,
    year: w.year,
    description: w.description,
    why_listen: w.whyListen,
    spotify_uri: w.spotifyUri || null,
    apple_music_url: w.appleMusicUrl || null,
    key_moments: w.keyMoments || [],
    listener_level: w.listenerLevel || null,
  }));

  const monthlySpotlights = (albums.monthlySpotlights || []).map((m: any) => ({
    month: m.month,
    type: m.type,
    ref_id: m.id,
    title: m.title,
    subtitle: m.subtitle,
    description: m.description,
    featured_works: m.featuredWorks || [],
    challenge: m.challenge || null,
  }));

  const terms = (glossary.terms || []).map((t: any) => ({
    id: t.id,
    term: t.term,
    category: t.category,
    short_definition: t.shortDefinition || t.definition || '',
    long_definition: t.longDefinition || t.definition || '',
    media_links: t.media || [],
  }));

  const composersRows = (composers.composers || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    years: c.years,
    period: c.period,
    nationality: c.nationality,
    portrait: c.portrait,
    short_bio: c.shortBio,
    full_bio: c.fullBio,
    key_works: c.keyWorks || [],
    fun_fact: c.funFact,
    listen_first: c.listenFirst,
    spotify_uri: c.spotifyUri,
    youtube_search: c.youtubeSearch,
  }));

  const periodsRows = (periods.periods || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    years: p.years,
    description: p.description,
    key_characteristics: p.keyCharacteristics || [],
    color: p.color,
  }));

  const formsRows = (forms.forms || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    period: f.period,
    description: f.description,
    structure: f.structure || [],
    listen_for: f.listenFor || [],
    key_works: f.keyWorks || [],
  }));

  // Upsert with conflicts set to PKs
  await upsert('releases', releases, 'id');
  await upsert('concert_halls', concertHalls, 'id');
  await upsert('weekly_albums', weeklyAlbums, 'week');
  await upsert('monthly_spotlights', monthlySpotlights, 'month');
  await upsert('terms', terms, 'id');
  await upsert('composers', composersRows, 'id');
  await upsert('periods', periodsRows, 'id');
  await upsert('forms', formsRows, 'id');

  console.log('Done seeding Supabase data.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
