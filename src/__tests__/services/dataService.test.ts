import { DataService, DataServiceClass } from '../../services/dataService';
import { ComposerBuilder } from '../utils/builders';

// Mock the JSON data imports
jest.mock('../../data/composers.json', () => ({
    composers: [
        { id: 'bach', name: 'Johann Sebastian Bach', period: 'baroque', years: '1685-1750' },
        { id: 'mozart', name: 'Wolfgang Amadeus Mozart', period: 'classical', years: '1756-1791' },
        { id: 'beethoven', name: 'Ludwig van Beethoven', period: 'romantic', years: '1770-1827' },
    ],
}));

jest.mock('../../data/periods.json', () => ({
    periods: [
        { id: 'baroque', name: 'Baroque', years: '1600-1750' },
        { id: 'classical', name: 'Classical', years: '1750-1820' },
        { id: 'romantic', name: 'Romantic', years: '1820-1900' },
    ],
}));

jest.mock('../../data/forms.json', () => ({
    forms: [
        { id: 'sonata', name: 'Sonata', description: 'A musical form' },
        { id: 'symphony', name: 'Symphony', description: 'Large orchestral work' },
    ],
}));

jest.mock('../../data/glossary.json', () => ({
    terms: [
        { id: 1, term: 'Allegro', category: 'Tempo', definition: 'Fast tempo' },
        { id: 2, term: 'Adagio', category: 'Tempo', definition: 'Slow tempo' },
        { id: 3, term: 'Forte', category: 'Dynamics', definition: 'Loud' },
    ],
}));

describe('DataService', () => {
    beforeEach(() => {
        // Clear cache before each test
        DataService.clearCache();
    });

    describe('getComposers', () => {
        it('returns all composers', async () => {
            const composers = await DataService.getComposers();
            expect(composers).toHaveLength(3);
            expect(composers[0].id).toBe('bach');
        });

        it('caches results', async () => {
            const first = await DataService.getComposers();
            const second = await DataService.getComposers();
            expect(first).toBe(second); // Same reference = cached
        });
    });

    describe('getComposerById', () => {
        it('returns composer when found', async () => {
            const composer = await DataService.getComposerById('mozart');
            expect(composer).not.toBeNull();
            expect(composer?.name).toBe('Wolfgang Amadeus Mozart');
        });

        it('returns null when not found', async () => {
            const composer = await DataService.getComposerById('unknown');
            expect(composer).toBeNull();
        });
    });

    describe('getComposersByPeriod', () => {
        it('returns composers for a period', async () => {
            const composers = await DataService.getComposersByPeriod('baroque');
            expect(composers).toHaveLength(1);
            expect(composers[0].id).toBe('bach');
        });

        it('returns empty array for unknown period', async () => {
            const composers = await DataService.getComposersByPeriod('unknown');
            expect(composers).toHaveLength(0);
        });
    });

    describe('getPeriods', () => {
        it('returns all periods', async () => {
            const periods = await DataService.getPeriods();
            expect(periods).toHaveLength(3);
        });
    });

    describe('getPeriodById', () => {
        it('returns period when found', async () => {
            const period = await DataService.getPeriodById('classical');
            expect(period).not.toBeNull();
            expect(period?.name).toBe('Classical');
        });

        it('returns null when not found', async () => {
            const period = await DataService.getPeriodById('unknown');
            expect(period).toBeNull();
        });
    });

    describe('getForms', () => {
        it('returns all forms', async () => {
            const forms = await DataService.getForms();
            expect(forms).toHaveLength(2);
        });
    });

    describe('getFormById', () => {
        it('returns form when found', async () => {
            const form = await DataService.getFormById('sonata');
            expect(form).not.toBeNull();
            expect(form?.name).toBe('Sonata');
        });
    });

    describe('getTerms', () => {
        it('returns all terms with string IDs', async () => {
            const terms = await DataService.getTerms();
            expect(terms).toHaveLength(3);
            // IDs should be transformed to strings
            expect(typeof terms[0].id).toBe('string');
        });
    });

    describe('getTermById', () => {
        it('returns term when found', async () => {
            const term = await DataService.getTermById('1');
            expect(term).not.toBeNull();
            expect(term?.term).toBe('Allegro');
        });

        it('returns null when not found', async () => {
            const term = await DataService.getTermById('999');
            expect(term).toBeNull();
        });
    });

    describe('getTermsByCategory', () => {
        it('returns terms for a category', async () => {
            const terms = await DataService.getTermsByCategory('Tempo');
            expect(terms).toHaveLength(2);
        });

        it('returns empty array for unknown category', async () => {
            const terms = await DataService.getTermsByCategory('Unknown');
            expect(terms).toHaveLength(0);
        });
    });

    describe('clearCache', () => {
        it('clears cache without error', async () => {
            // Populate cache
            await DataService.getComposers();
            await DataService.getPeriods();

            // Clear cache should not throw
            expect(() => DataService.clearCache()).not.toThrow();

            // Data should still be accessible after clearing
            const composers = await DataService.getComposers();
            expect(composers).toHaveLength(3);
        });
    });

    describe('DataService with Mock Provider (Builder Pattern)', () => {
        it('uses injected provider returning built data', async () => {
            const mockComposer = new ComposerBuilder()
                .withId('mock-1')
                .withName('Mock Composer')
                .build();
            
            const mockProvider = {
                getComposers: jest.fn().mockResolvedValue([mockComposer]),
                getPeriods: jest.fn(),
                getForms: jest.fn(),
                getTerms: jest.fn(),
                getWeeklyAlbums: jest.fn(),
                getMonthlySpotlights: jest.fn(),
                getNewReleases: jest.fn(),
                getConcertHalls: jest.fn(),
                getKickstartDays: jest.fn(),
            };
    
            // Inject mock provider
            const service = new DataServiceClass({ type: 'local' }, mockProvider);
            const composers = await service.getComposers();
    
            expect(composers).toHaveLength(1);
            expect(composers[0]).toEqual(mockComposer);
            expect(mockProvider.getComposers).toHaveBeenCalled();
        });
    });
});
