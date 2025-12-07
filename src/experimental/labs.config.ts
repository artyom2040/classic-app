/**
 * Labs Configuration
 * 
 * Toggle experimental features on/off without touching the codebase.
 * Set to true to enable for testing, false to hide from users.
 */

export const LABS = {
    /** Mood-based playlists: "Focus", "Relaxing", "Energetic" etc. */
    MOOD_PLAYLISTS: true,

    /** Time-synced listening guides with annotations */
    LISTENING_GUIDES: true,

    /** "If you like X, try Y" composer recommendations */
    RECOMMENDATIONS: true,

    /** MusicBrainz database search (already implemented) */
    MUSICBRAINZ_DISCOVER: true,
} as const;

/**
 * Check if any experimental features are enabled
 */
export function hasAnyLabsEnabled(): boolean {
    return Object.values(LABS).some(Boolean);
}

/**
 * Get list of enabled lab features
 */
export function getEnabledLabs(): string[] {
    return Object.entries(LABS)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
}

export default LABS;
