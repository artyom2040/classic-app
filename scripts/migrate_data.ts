/**
 * Migration script: JSON data → Supabase SQL seed files
 * 
 * Run: npx ts-node scripts/migrate_data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SEEDS_DIR = path.join(__dirname, '..', 'supabase', 'seeds');

// Ensure seeds directory exists
if (!fs.existsSync(SEEDS_DIR)) {
    fs.mkdirSync(SEEDS_DIR, { recursive: true });
}

// SQL escape helper
function escapeSQL(value: any): string {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
    }
    if (Array.isArray(value)) {
        // Check if it's an array of objects (JSONB) or strings (text[])
        if (value.length > 0 && typeof value[0] === 'object') {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
        }
        // text[] array
        const escaped = value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(',');
        return `'{${escaped}}'`;
    }
    if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    // String - escape single quotes
    return `'${String(value).replace(/'/g, "''")}'`;
}

// camelCase to snake_case converter
function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Transform object keys from camelCase to snake_case
function transformKeys(obj: Record<string, any>, keyMap?: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = keyMap?.[key] || toSnakeCase(key);
        result[newKey] = value;
    }
    return result;
}

// Generate INSERT statement
function generateInsert(table: string, rows: Record<string, any>[]): string {
    if (rows.length === 0) return '';

    const columns = Object.keys(rows[0]);
    const values = rows.map(row => {
        const vals = columns.map(col => escapeSQL(row[col]));
        return `  (${vals.join(', ')})`;
    }).join(',\n');

    return `-- Seed data for ${table}
-- Generated: ${new Date().toISOString()}

INSERT INTO public.${table} (${columns.join(', ')})
VALUES
${values}
ON CONFLICT (${columns[0]}) DO UPDATE SET
${columns.slice(1).map(c => `  ${c} = EXCLUDED.${c}`).join(',\n')};
`;
}

// === MIGRATION FUNCTIONS ===

function migrateComposers(): void {
    console.log('Migrating composers...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'composers.json'), 'utf-8'));

    const rows = data.composers.map((c: any) => ({
        id: c.id,
        name: c.name,
        years: c.years || null,
        period: c.period || null,
        nationality: c.nationality || null,
        portrait: c.portrait || null,
        short_bio: c.shortBio || null,
        full_bio: c.fullBio || null,
        key_works: c.keyWorks || [],
        fun_fact: c.funFact || null,
        listen_first: c.listenFirst || null,
        spotify_uri: c.spotifyUri || null,
        youtube_search: c.youtubeSearch || null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_composers.sql'), generateInsert('composers', rows));
    console.log(`  ✓ ${rows.length} composers`);
}

function migratePeriods(): void {
    console.log('Migrating periods...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'periods.json'), 'utf-8'));

    const rows = data.periods.map((p: any) => ({
        id: p.id,
        name: p.name,
        years: p.years || null,
        description: p.description || null,
        key_characteristics: p.keyCharacteristics || [],
        color: p.color || null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_periods.sql'), generateInsert('periods', rows));
    console.log(`  ✓ ${rows.length} periods`);
}

function migrateForms(): void {
    console.log('Migrating forms...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'forms.json'), 'utf-8'));

    const rows = data.forms.map((f: any) => ({
        id: f.id,
        name: f.name,
        category: f.category || null,
        period: f.period || null,
        description: f.description || null,
        structure: f.structure || [],
        listen_for: f.listenFor || [],
        key_works: f.keyWorks || [],
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_forms.sql'), generateInsert('forms', rows));
    console.log(`  ✓ ${rows.length} forms`);
}

function migrateTerms(): void {
    console.log('Migrating glossary terms...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'glossary.json'), 'utf-8'));

    const rows = data.terms.map((t: any) => ({
        id: t.id,
        term: t.term,
        category: t.category,
        short_definition: t.shortDefinition || t.definition || null,
        long_definition: t.longDefinition || t.definition || null,
        media_links: t.media || [],
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_terms.sql'), generateInsert('terms', rows));
    console.log(`  ✓ ${rows.length} terms`);
}

function migrateWeeklyAlbums(): void {
    console.log('Migrating weekly albums...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'albums.json'), 'utf-8'));

    const rows = data.weeklyAlbums.map((a: any) => ({
        week: a.week,
        title: a.title,
        artist: a.artist,
        year: a.year || null,
        description: a.description || null,
        why_listen: a.whyListen || null,
        spotify_uri: a.spotifyUri || null,
        apple_music_url: a.appleMusicUrl || null,
        key_moments: a.keyMoments || [],
        listener_level: a.listenerLevel || null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_weekly_albums.sql'), generateInsert('weekly_albums', rows));
    console.log(`  ✓ ${rows.length} weekly albums`);
}

function migrateMonthlySpotlights(): void {
    console.log('Migrating monthly spotlights...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'albums.json'), 'utf-8'));

    const rows = data.monthlySpotlights.map((s: any) => ({
        month: s.month,
        type: s.type,
        ref_id: s.id,
        title: s.title,
        subtitle: s.subtitle || null,
        description: s.description || null,
        featured_works: s.featuredWorks || [],
        challenge: s.challenge || null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_monthly_spotlights.sql'), generateInsert('monthly_spotlights', rows));
    console.log(`  ✓ ${rows.length} monthly spotlights`);
}

function migrateReleases(): void {
    console.log('Migrating releases...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'albums.json'), 'utf-8'));

    const rows = data.newReleases.map((r: any) => ({
        id: r.id,
        title: r.title,
        artist: r.artist,
        release_date: r.releaseDate,
        description: r.description || '',
        highlight_track: r.highlightTrack || null,
        listener_level: r.listenerLevel || null,
        spotify_uri: null,
        apple_url: null,
        yt_query: null,
        image_url: null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_releases.sql'), generateInsert('releases', rows));
    console.log(`  ✓ ${rows.length} releases`);
}

function migrateConcertHalls(): void {
    console.log('Migrating concert halls...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'albums.json'), 'utf-8'));

    const rows = data.concertHalls.map((h: any) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        description: h.description || '',
        signature_sound: h.signatureSound || null,
        map_url: h.mapUrl || null,
        hero_image: null,
        listener_level: null,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_concert_halls.sql'), generateInsert('concert_halls', rows));
    console.log(`  ✓ ${rows.length} concert halls`);
}

function migrateKickstartLessons(): void {
    console.log('Migrating kickstart lessons...');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'kickstart.json'), 'utf-8'));

    const rows = data.days.map((d: any) => ({
        day: d.day,
        title: d.title,
        subtitle: d.subtitle || null,
        icon: d.icon || null,
        duration: d.duration || null,
        content: d.content,
        badge_id: d.badge?.id || null,
        is_active: true,
    }));

    fs.writeFileSync(path.join(SEEDS_DIR, 'seed_kickstart_lessons.sql'), generateInsert('kickstart_lessons', rows));
    console.log(`  ✓ ${rows.length} kickstart lessons`);
}

// === MAIN ===

console.log('🎵 Starting data migration to Supabase format...\n');

migrateComposers();
migratePeriods();
migrateForms();
migrateTerms();
migrateWeeklyAlbums();
migrateMonthlySpotlights();
migrateReleases();
migrateConcertHalls();
migrateKickstartLessons();

console.log('\n✅ Migration complete! SQL seed files written to:', SEEDS_DIR);
console.log('\nTo import on VPS, run:');
console.log('  psql -d your_database -f supabase/seeds/seed_periods.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_composers.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_forms.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_terms.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_weekly_albums.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_monthly_spotlights.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_releases.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_concert_halls.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_badges.sql');
console.log('  psql -d your_database -f supabase/seeds/seed_kickstart_lessons.sql');

