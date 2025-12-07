/**
 * Listening Guides Data
 * Time-synced annotations for famous classical pieces
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
        annotations: [
            { timestamp: 0, title: 'The Famous Motif', description: 'The iconic "fate knocking at the door" - four notes that changed music forever.', type: 'theme' },
            { timestamp: 22, title: 'Development Begins', description: 'The motif is passed between instruments, building tension.', type: 'structure' },
            { timestamp: 60, title: 'French Horns Enter', description: 'Listen for the bold horn statement that answers the strings.', type: 'instrument' },
            { timestamp: 124, title: 'Second Theme', description: 'A more lyrical melody provides contrast to the intense opening.', type: 'theme' },
            { timestamp: 180, title: 'Full Orchestra', description: 'The entire orchestra joins in a powerful tutti passage.', type: 'dynamics' },
            { timestamp: 300, title: 'Recapitulation', description: 'The opening theme returns, now with an oboe cadenza.', type: 'structure' },
            { timestamp: 400, title: 'Coda', description: 'Extended ending showcasing Beethoven\'s dramatic genius.', type: 'structure' },
        ],
    },
    {
        id: 'vivaldi-spring-1',
        workId: 101,
        workTitle: 'Four Seasons: Spring - Allegro',
        composerName: 'Antonio Vivaldi',
        duration: 210,
        difficulty: 'beginner',
        annotations: [
            { timestamp: 0, title: 'Spring Arrives', description: 'Joyful opening theme depicting birds welcoming spring.', type: 'theme' },
            { timestamp: 30, title: 'Birdsong', description: 'Solo violin imitates chirping birds with trills.', type: 'instrument' },
            { timestamp: 60, title: 'Murmuring Streams', description: 'Gentle flowing melody representing brooks and streams.', type: 'theme' },
            { timestamp: 90, title: 'Thunder', description: 'Sudden loud passages depict a spring storm.', type: 'dynamics' },
            { timestamp: 130, title: 'Birds Return', description: 'After the storm, birdsong resumes.', type: 'theme' },
        ],
    },
    {
        id: 'debussy-clair',
        workId: 801,
        workTitle: 'Clair de Lune',
        composerName: 'Claude Debussy',
        duration: 300,
        difficulty: 'intermediate',
        annotations: [
            { timestamp: 0, title: 'Moonrise', description: 'Soft arpeggios create an atmosphere of still moonlight.', type: 'theme' },
            { timestamp: 45, title: 'Impressionist Colors', description: 'Notice the unusual harmonies that blur major and minor.', type: 'structure' },
            { timestamp: 90, title: 'The Heart of the Piece', description: 'A passionate middle section with rich chords.', type: 'dynamics' },
            { timestamp: 180, title: 'Return to Stillness', description: 'The opening theme returns, even more ethereal.', type: 'theme' },
            { timestamp: 270, title: 'Fading Light', description: 'Pianissimo ending like moonlight fading at dawn.', type: 'dynamics' },
        ],
    },
];

export function getGuideById(id: string): ListeningGuide | undefined {
    return listeningGuides.find(g => g.id === id);
}

export function getGuidesByDifficulty(difficulty: ListeningGuide['difficulty']): ListeningGuide[] {
    return listeningGuides.filter(g => g.difficulty === difficulty);
}
