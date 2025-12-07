/**
 * Recommendations Data
 * "If you like X, try Y" suggestions
 */

export interface Recommendation {
    id: string;
    sourceComposerId: string;
    targetComposerId: string;
    reason: string;
    similarity: 'style' | 'era' | 'instrument' | 'mood' | 'influence';
}

export interface ComposerConnection {
    composerId: string;
    connections: {
        targetId: string;
        reason: string;
        strength: number; // 1-5
    }[];
}

export const recommendations: Recommendation[] = [
    // Baroque connections
    { id: 'bach-handel', sourceComposerId: '1', targetComposerId: '2', reason: 'Both masters of Baroque counterpoint', similarity: 'era' },
    { id: 'bach-vivaldi', sourceComposerId: '1', targetComposerId: '3', reason: 'Bach transcribed many Vivaldi concertos', similarity: 'influence' },

    // Classical connections
    { id: 'mozart-haydn', sourceComposerId: '4', targetComposerId: '5', reason: 'Close friends who influenced each other', similarity: 'style' },
    { id: 'haydn-beethoven', sourceComposerId: '5', targetComposerId: '6', reason: 'Haydn taught early Beethoven', similarity: 'influence' },

    // Romantic connections
    { id: 'chopin-liszt', sourceComposerId: '7', targetComposerId: '8', reason: 'Piano virtuosos and close friends', similarity: 'instrument' },
    { id: 'brahms-schumann', sourceComposerId: '9', targetComposerId: '10', reason: 'Schumann championed young Brahms', similarity: 'influence' },

    // Impressionist connections
    { id: 'debussy-ravel', sourceComposerId: '11', targetComposerId: '12', reason: 'French impressionist contemporaries', similarity: 'style' },

    // Mood-based connections
    { id: 'tchaikovsky-rachmaninoff', sourceComposerId: '13', targetComposerId: '14', reason: 'Rich Russian romantic melodies', similarity: 'mood' },
];

export const composerConnections: ComposerConnection[] = [
    {
        composerId: '1', // Bach
        connections: [
            { targetId: '2', reason: 'Baroque contemporary', strength: 4 },
            { targetId: '3', reason: 'Italian influence', strength: 5 },
            { targetId: '6', reason: 'Beethoven studied Bach fugues', strength: 3 },
        ],
    },
    {
        composerId: '4', // Mozart
        connections: [
            { targetId: '5', reason: 'Classical period friends', strength: 5 },
            { targetId: '6', reason: 'Beethoven admired Mozart', strength: 4 },
            { targetId: '1', reason: 'Mozart studied Bach\'s works', strength: 3 },
        ],
    },
    {
        composerId: '6', // Beethoven
        connections: [
            { targetId: '4', reason: 'Classical foundations', strength: 4 },
            { targetId: '9', reason: 'Brahms as Beethoven\'s heir', strength: 5 },
            { targetId: '13', reason: 'Romantic emotional depth', strength: 3 },
        ],
    },
];

export function getRecommendationsFor(composerId: string): Recommendation[] {
    return recommendations.filter(
        r => r.sourceComposerId === composerId || r.targetComposerId === composerId
    );
}

export function getConnectionsFor(composerId: string): ComposerConnection | undefined {
    return composerConnections.find(c => c.composerId === composerId);
}
