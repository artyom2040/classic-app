/**
 * Mood Playlists Data
 * 
 * Curated playlists organized by mood/activity.
 * Each playlist links to composers and works in your existing data.
 */

export interface MoodPlaylist {
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
    composerIds: string[];  // Links to your existing composers
    tags: string[];
}

export const moodPlaylists: MoodPlaylist[] = [
    {
        id: 'focus',
        name: 'Focus & Study',
        emoji: '🎯',
        description: 'Calm, structured pieces to help you concentrate',
        color: '#3B82F6',
        composerIds: ['bach', 'mozart', 'debussy', 'satie'],
        tags: ['calm', 'structured', 'concentration'],
    },
    {
        id: 'relaxing',
        name: 'Relaxing Evening',
        emoji: '🌙',
        description: 'Gentle nocturnes and soft melodies for unwinding',
        color: '#8B5CF6',
        composerIds: ['chopin', 'debussy', 'satie', 'faure'],
        tags: ['calm', 'gentle', 'peaceful'],
    },
    {
        id: 'energetic',
        name: 'Energetic & Bold',
        emoji: '⚡',
        description: 'Powerful symphonies and dramatic works',
        color: '#EF4444',
        composerIds: ['beethoven', 'tchaikovsky', 'wagner', 'brahms'],
        tags: ['powerful', 'dramatic', 'intense'],
    },
    {
        id: 'morning',
        name: 'Morning Awakening',
        emoji: '🌅',
        description: 'Bright, uplifting pieces to start your day',
        color: '#F59E0B',
        composerIds: ['vivaldi', 'handel', 'haydn', 'mozart'],
        tags: ['bright', 'uplifting', 'cheerful'],
    },
    {
        id: 'romantic',
        name: 'Romantic Moments',
        emoji: '💜',
        description: 'Emotional, heartfelt compositions',
        color: '#EC4899',
        composerIds: ['chopin', 'liszt', 'rachmaninoff', 'schumann'],
        tags: ['emotional', 'passionate', 'expressive'],
    },
    {
        id: 'melancholy',
        name: 'Melancholy & Reflection',
        emoji: '🌧️',
        description: 'Contemplative pieces for introspective moments',
        color: '#6B7280',
        composerIds: ['chopin', 'mahler', 'barber', 'arvo-part'],
        tags: ['contemplative', 'sad', 'reflective'],
    },
    {
        id: 'epic',
        name: 'Epic & Cinematic',
        emoji: '🎬',
        description: 'Grand orchestral works that feel like movie scores',
        color: '#1F2937',
        composerIds: ['wagner', 'holst', 'orff', 'mussorgsky'],
        tags: ['grand', 'cinematic', 'majestic'],
    },
    {
        id: 'nature',
        name: 'Nature & Pastoral',
        emoji: '🌿',
        description: 'Music inspired by landscapes and the outdoors',
        color: '#10B981',
        composerIds: ['beethoven', 'vivaldi', 'grieg', 'smetana'],
        tags: ['nature', 'outdoors', 'peaceful'],
    },
];

/**
 * Get playlist by ID
 */
export function getPlaylistById(id: string): MoodPlaylist | undefined {
    return moodPlaylists.find(p => p.id === id);
}

/**
 * Get playlists by tag
 */
export function getPlaylistsByTag(tag: string): MoodPlaylist[] {
    return moodPlaylists.filter(p => p.tags.includes(tag));
}

export default moodPlaylists;
