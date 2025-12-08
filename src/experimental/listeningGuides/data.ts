/**
 * Listening Guides Data
 * Time-synced annotations for famous classical pieces with YouTube integration
 */

export interface GuideAnnotation {
    timestamp: number; // seconds from start
    title: string;
    description: string;
    type: 'theme' | 'instrument' | 'dynamics' | 'structure' | 'history';
}

export interface ListeningGuide {
    id: string;
    workId: number;
    workTitle: string;
    composerName: string;
    duration: number; // total duration in seconds
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    youtubeVideoId: string; // YouTube video ID for playback
    youtubeStartTime?: number; // Optional start offset in seconds
    coverImage?: string;
    annotations: GuideAnnotation[];
}

export const listeningGuides: ListeningGuide[] = [
    {
        id: 'beethoven-5-1',
        workId: 501,
        workTitle: 'Symphony No. 5 - 1st Movement',
        composerName: 'Ludwig van Beethoven',
        duration: 480,
        difficulty: 'beginner',
        // Vienna Philharmonic / Leonard Bernstein (public performance)
        youtubeVideoId: 'fOk8Tm815lE',
        annotations: [
            { timestamp: 0, title: 'The Famous Motif', description: 'The iconic "fate knocking at the door" - four notes that changed music forever. Listen for: short-short-short-LONG.', type: 'theme' },
            { timestamp: 22, title: 'Development Begins', description: 'The motif is passed between instruments, building tension. Notice how the strings and woodwinds answer each other.', type: 'structure' },
            { timestamp: 60, title: 'French Horns Enter', description: 'Listen for the bold horn statement that answers the strings. This creates a powerful dialogue.', type: 'instrument' },
            { timestamp: 124, title: 'Second Theme', description: 'A more lyrical melody in E-flat major provides contrast to the intense opening. This is the "calm before the storm."', type: 'theme' },
            { timestamp: 180, title: 'Full Orchestra', description: 'The entire orchestra joins in a powerful tutti passage. Feel the energy building!', type: 'dynamics' },
            { timestamp: 300, title: 'Recapitulation', description: 'The opening theme returns with an unexpected oboe cadenza - a moment of solo reflection.', type: 'structure' },
            { timestamp: 400, title: 'Coda', description: 'Extended dramatic ending. Beethoven refuses to let go, driving the movement to its triumphant conclusion.', type: 'structure' },
        ],
    },
    {
        id: 'vivaldi-spring-1',
        workId: 101,
        workTitle: 'Four Seasons: Spring - Allegro',
        composerName: 'Antonio Vivaldi',
        duration: 210,
        difficulty: 'beginner',
        // I Musici ensemble performance
        youtubeVideoId: 'l-dYNttdgl0',
        annotations: [
            { timestamp: 0, title: 'Spring Arrives', description: 'Joyful opening theme in E major - the Baroque "sound of happiness." The whole ensemble celebrates.', type: 'theme' },
            { timestamp: 30, title: 'Birdsong', description: 'Solo violin imitates chirping birds with rapid trills. This is "word painting" - music that sounds like what it describes.', type: 'instrument' },
            { timestamp: 60, title: 'Murmuring Streams', description: 'Gentle flowing melody representing brooks. Notice the smooth, connected notes (legato) suggesting water.', type: 'theme' },
            { timestamp: 90, title: 'Thunder', description: 'Sudden loud passages with rapid repeated notes depict a spring storm. The dynamics change dramatically!', type: 'dynamics' },
            { timestamp: 130, title: 'Birds Return', description: 'After the storm passes, birdsong resumes. The solo violin returns with its cheerful trills.', type: 'theme' },
            { timestamp: 180, title: 'Joyful Conclusion', description: 'The opening theme returns for a celebratory ending. Spring has truly arrived!', type: 'structure' },
        ],
    },
    {
        id: 'debussy-clair',
        workId: 801,
        workTitle: 'Clair de Lune',
        composerName: 'Claude Debussy',
        duration: 300,
        difficulty: 'intermediate',
        // Lang Lang performance
        youtubeVideoId: 'WNcsUNKlAKw',
        annotations: [
            { timestamp: 0, title: 'Moonrise', description: 'Soft arpeggios in D-flat major create an atmosphere of still moonlight. Notice the unusual 9/8 time signature - it creates a dreamy, floating feel.', type: 'theme' },
            { timestamp: 45, title: 'Impressionist Colors', description: 'Notice the unusual harmonies that blur major and minor. This is Impressionism - suggesting mood rather than telling a story.', type: 'structure' },
            { timestamp: 90, title: 'The Heart of the Piece', description: 'A passionate middle section emerges with rich chords. The moonlight seems to intensify and glow.', type: 'dynamics' },
            { timestamp: 140, title: 'Climax', description: 'The most intense moment - full rich chords and sweeping arpeggios. The music swells like moonlight breaking through clouds.', type: 'dynamics' },
            { timestamp: 180, title: 'Return to Stillness', description: 'The opening theme returns, even more ethereal and delicate than before. We are descending back to calm.', type: 'theme' },
            { timestamp: 250, title: 'Fading Light', description: 'Pianissimo (very soft) ending. The final notes fade like moonlight giving way to dawn. Complete stillness.', type: 'dynamics' },
        ],
    },
];

export function getGuideById(id: string): ListeningGuide | undefined {
    return listeningGuides.find(g => g.id === id);
}

export function getGuidesByDifficulty(difficulty: ListeningGuide['difficulty']): ListeningGuide[] {
    return listeningGuides.filter(g => g.difficulty === difficulty);
}
