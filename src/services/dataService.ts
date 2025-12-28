/**
 * Data Service Layer
 * 
 * This service abstracts data access to prepare for future database integration.
 * Currently uses local JSON files, but can be switched to:
 * - Firebase Firestore
 * - Supabase
 * - MongoDB (via API)
 * - Any other backend
 * 
 * Usage:
 *   const composers = await DataService.getComposers();
 *   const composer = await DataService.getComposerById('bach');
 */

import { Composer, Period, MusicalForm, Term, WeeklyAlbum, MonthlySpotlight, KickstartDay, NewRelease, ConcertHall } from '../types';
import { getWeekNumber } from '../utils/storage';
import { DataProvider } from './data/providers/DataProvider';
import { LocalProvider } from './data/providers/LocalProvider';
import { SupabaseProvider } from './data/providers/SupabaseProvider';

// =============================================================================
// DATA SOURCE CONFIGURATION
// =============================================================================

export type DataSourceType = 'local' | 'firebase' | 'supabase' | 'mongodb' | 'api';

interface DataSourceConfig {
  type: DataSourceType;
  // Firebase config
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  // Supabase config
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
  // MongoDB/API config
  apiConfig?: {
    baseUrl: string;
    apiKey?: string;
  };
}

// Current data source - change this to switch backends
const DATA_SOURCE: DataSourceConfig = {
  type: (process.env.EXPO_PUBLIC_DATA_SOURCE as DataSourceType) || 'local',
  supabaseConfig: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Uncomment and configure if switching:
  // type: 'api',
  // apiConfig: { baseUrl: 'https://api.yourserver.com' }
};

// =============================================================================
// DATA SERVICE CLASS
// =============================================================================

class DataServiceClass {
  private config: DataSourceConfig;
  private provider: DataProvider;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes cache

  constructor(config: DataSourceConfig, provider?: DataProvider) {
    this.config = config;
    this.provider = provider || this.createProvider(config);
  }

  private createProvider(config: DataSourceConfig): DataProvider {
    switch (config.type) {
      case 'local':
        return new LocalProvider();
      case 'supabase':
        return new SupabaseProvider();
      case 'firebase':
        throw new Error('Firebase provider not implemented');
      case 'api':
        throw new Error('API provider not implemented');
      case 'mongodb':
        throw new Error('MongoDB provider not implemented');
      default:
        return new LocalProvider();
    }
  }

  // ---------------------------------------------------------------------------
  // COMPOSERS
  // ---------------------------------------------------------------------------

  async getComposers(): Promise<Composer[]> {
    return this.fetchData('composers', () => this.provider.getComposers());
  }

  async getComposerById(id: string): Promise<Composer | null> {
    const composers = await this.getComposers();
    return composers.find(c => c.id === id) || null;
  }

  async getComposersByPeriod(periodId: string): Promise<Composer[]> {
    const composers = await this.getComposers();
    return composers.filter(c => c.period === periodId);
  }

  // ---------------------------------------------------------------------------
  // PERIODS
  // ---------------------------------------------------------------------------

  async getPeriods(): Promise<Period[]> {
    return this.fetchData('periods', () => this.provider.getPeriods());
  }

  async getPeriodById(id: string): Promise<Period | null> {
    const periods = await this.getPeriods();
    return periods.find(p => p.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // MUSICAL FORMS
  // ---------------------------------------------------------------------------

  async getForms(): Promise<MusicalForm[]> {
    return this.fetchData('forms', () => this.provider.getForms());
  }

  async getFormById(id: string): Promise<MusicalForm | null> {
    const forms = await this.getForms();
    return forms.find(f => f.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // GLOSSARY / TERMS
  // ---------------------------------------------------------------------------

  async getTerms(): Promise<Term[]> {
    return this.fetchData('terms', () => this.provider.getTerms());
  }

  async getTermById(id: string): Promise<Term | null> {
    const terms = await this.getTerms();
    return terms.find(t => String(t.id) === String(id)) || null;
  }

  async getTermsByCategory(category: string): Promise<Term[]> {
    const terms = await this.getTerms();
    return terms.filter(t => t.category === category);
  }

  // ---------------------------------------------------------------------------
  // WEEKLY ALBUMS
  // ---------------------------------------------------------------------------

  async getWeeklyAlbums(): Promise<WeeklyAlbum[]> {
    return this.fetchData('weeklyAlbums', () => this.provider.getWeeklyAlbums());
  }

  async getCurrentWeeklyAlbum(): Promise<WeeklyAlbum | null> {
    const albums = await this.getWeeklyAlbums();
    const weekNumber = getWeekNumber();
    return albums.find(a => a.week === weekNumber) || albums[0] || null;
  }

  // ---------------------------------------------------------------------------
  // MONTHLY SPOTLIGHTS
  // ---------------------------------------------------------------------------

  async getMonthlySpotlights(): Promise<MonthlySpotlight[]> {
    return this.fetchData('monthlySpotlights', () => this.provider.getMonthlySpotlights());
  }

  // ---------------------------------------------------------------------------
  // NEW RELEASES
  // ---------------------------------------------------------------------------

  async getNewReleases(): Promise<NewRelease[]> {
    return this.fetchData('newReleases', () => this.provider.getNewReleases());
  }

  // ---------------------------------------------------------------------------
  // CONCERT HALLS
  // ---------------------------------------------------------------------------

  async getConcertHalls(): Promise<ConcertHall[]> {
    return this.fetchData('concertHalls', () => this.provider.getConcertHalls());
  }

  async getCurrentMonthlySpotlight(): Promise<MonthlySpotlight | null> {
    const spotlights = await this.getMonthlySpotlights();
    const month = new Date().getMonth() + 1;
    return spotlights.find(s => s.month === month) || spotlights[0] || null;
  }

  // ---------------------------------------------------------------------------
  // KICKSTART
  // ---------------------------------------------------------------------------

  async getKickstartDays(): Promise<KickstartDay[]> {
    return this.fetchData('kickstart', () => this.provider.getKickstartDays());
  }

  async getKickstartDay(dayNumber: number): Promise<KickstartDay | null> {
    const days = await this.getKickstartDays();
    return days.find(d => d.day === dayNumber) || null;
  }

  // ---------------------------------------------------------------------------
  // UTILITY METHODS
  // ---------------------------------------------------------------------------

  private async fetchData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }

    // Fetch fresh data
    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // If primary provider fails and it's NOT local, try falling back to local
      // This mimics the original fetchWithSupabaseFallback behavior but more generically
      if (this.config.type !== 'local') {
        console.warn(`[DataService] Primary provider failed for ${key}, falling back to local.`, error);
        const localProvider = new LocalProvider();
        // We need to map the key to the method name dynamically or switch
        // For simplicity in this refactor, we'll implement a basic fallback strategy
        // In a full implementation, we might want the Provider interface to support generic 'getCollection'
        
        try {
           // Basic fallback mapping
           let fallbackData: any;
           switch(key) {
             case 'composers': fallbackData = await localProvider.getComposers(); break;
             case 'periods': fallbackData = await localProvider.getPeriods(); break;
             case 'forms': fallbackData = await localProvider.getForms(); break;
             case 'terms': fallbackData = await localProvider.getTerms(); break;
             case 'weeklyAlbums': fallbackData = await localProvider.getWeeklyAlbums(); break;
             case 'monthlySpotlights': fallbackData = await localProvider.getMonthlySpotlights(); break;
             case 'newReleases': fallbackData = await localProvider.getNewReleases(); break;
             case 'concertHalls': fallbackData = await localProvider.getConcertHalls(); break;
             case 'kickstart': fallbackData = await localProvider.getKickstartDays(); break;
             default: throw error;
           }
           return fallbackData;
        } catch (fallbackError) {
          throw error; // If fallback also fails, throw original or new error
        }
      }
      throw error;
    }
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
export const DataService = new DataServiceClass(DATA_SOURCE);

// Export for testing/custom instances
export { DataServiceClass };
