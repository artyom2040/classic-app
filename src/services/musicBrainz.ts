import { Platform } from 'react-native';

/**
 * MusicBrainz API Service
 * 
 * Provides access to the MusicBrainz database for:
 * - Searching composers/artists
 * - Fetching works by composer
 * - Getting recordings of works
 * 
 * API Docs: https://musicbrainz.org/doc/MusicBrainz_API
 */

const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'ContextComposer/1.0.0 (https://github.com/contextcomposer)';

// Rate limiting: 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe

async function rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
            setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
    }

    lastRequestTime = Date.now();

    return fetch(url, {
        headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
        },
    });
}

// Types
export interface MBSearchResult<T> {
    created: string;
    count: number;
    offset: number;
    artists?: T[];
    works?: T[];
    recordings?: T[];
}

export interface MBArtist {
    id: string;
    name: string;
    'sort-name': string;
    type?: string;
    country?: string;
    'life-span'?: {
        begin?: string;
        end?: string;
        ended?: boolean;
    };
    disambiguation?: string;
    tags?: Array<{ name: string; count: number }>;
    score?: number;
}

export interface MBWork {
    id: string;
    title: string;
    type?: string;
    language?: string;
    disambiguation?: string;
    relations?: MBRelation[];
    tags?: Array<{ name: string; count: number }>;
}

export interface MBRecording {
    id: string;
    title: string;
    length?: number; // in milliseconds
    disambiguation?: string;
    'artist-credit'?: Array<{
        name: string;
        artist: MBArtist;
    }>;
    releases?: Array<{
        id: string;
        title: string;
        date?: string;
    }>;
}

export interface MBRelation {
    type: string;
    direction: string;
    artist?: MBArtist;
    work?: MBWork;
    recording?: MBRecording;
}

/**
 * Search for artists/composers by name
 */
export async function searchArtists(
    query: string,
    limit: number = 10
): Promise<MBArtist[]> {
    try {
        // Add classical music bias to search
        const encodedQuery = encodeURIComponent(`${query} AND (type:person)`);
        const url = `${BASE_URL}/artist?query=${encodedQuery}&limit=${limit}&fmt=json`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            throw new Error(`MusicBrainz API error: ${response.status}`);
        }

        const data: MBSearchResult<MBArtist> = await response.json();
        return data.artists || [];
    } catch (error) {
        console.error('[MusicBrainz] Search artists failed:', error);
        return [];
    }
}

/**
 * Get artist details by ID
 */
export async function getArtist(artistId: string): Promise<MBArtist | null> {
    try {
        const url = `${BASE_URL}/artist/${artistId}?inc=tags+genres&fmt=json`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            throw new Error(`MusicBrainz API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[MusicBrainz] Get artist failed:', error);
        return null;
    }
}

/**
 * Get works by an artist (composer)
 */
export async function getWorksByArtist(
    artistId: string,
    limit: number = 25,
    offset: number = 0
): Promise<MBWork[]> {
    try {
        const url = `${BASE_URL}/work?artist=${artistId}&limit=${limit}&offset=${offset}&fmt=json`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            throw new Error(`MusicBrainz API error: ${response.status}`);
        }

        const data: MBSearchResult<MBWork> = await response.json();
        return data.works || [];
    } catch (error) {
        console.error('[MusicBrainz] Get works failed:', error);
        return [];
    }
}

/**
 * Get recordings of a work
 */
export async function getRecordingsOfWork(
    workId: string,
    limit: number = 10
): Promise<MBRecording[]> {
    try {
        const url = `${BASE_URL}/recording?work=${workId}&inc=artist-credits+releases&limit=${limit}&fmt=json`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            throw new Error(`MusicBrainz API error: ${response.status}`);
        }

        const data: MBSearchResult<MBRecording> = await response.json();
        return data.recordings || [];
    } catch (error) {
        console.error('[MusicBrainz] Get recordings failed:', error);
        return [];
    }
}

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number | undefined): string {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format lifespan dates
 */
export function formatLifespan(lifespan?: MBArtist['life-span']): string {
    if (!lifespan) return '';
    const { begin, end, ended } = lifespan;
    if (begin && end) return `${begin.slice(0, 4)}–${end.slice(0, 4)}`;
    if (begin && ended) return `${begin.slice(0, 4)}–?`;
    if (begin) return `b. ${begin.slice(0, 4)}`;
    return '';
}

export default {
    searchArtists,
    getArtist,
    getWorksByArtist,
    getRecordingsOfWork,
    formatDuration,
    formatLifespan,
};
