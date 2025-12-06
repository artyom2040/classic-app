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

import { Composer, Period, MusicalForm, Term, WeeklyAlbum, MonthlySpotlight, Badge, KickstartDay, NewRelease, ConcertHall } from '../types';
import { isSupabaseConfigured, getSupabaseClient } from './supabaseClient';

// Local data imports (will be replaced with API calls)
import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';
import formsData from '../data/forms.json';
import glossaryData from '../data/glossary.json';
import albumsData from '../data/albums.json';
import kickstartData from '../data/kickstart.json';

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
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  private supabaseTableMap: Record<string, string> = {
    composers: 'composers',
    periods: 'periods',
    forms: 'forms',
    terms: 'terms',
    weeklyAlbums: 'weekly_albums',
    monthlySpotlights: 'monthly_spotlights',
    kickstartDays: 'kickstart_days',
    newReleases: 'releases',
    concertHalls: 'concert_halls',
  };

  constructor(config: DataSourceConfig) {
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // COMPOSERS
  // ---------------------------------------------------------------------------
  
  async getComposers(): Promise<Composer[]> {
    return this.fetchData('composers', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(composersData.composers as Composer[]);
        case 'firebase':
          return this.fetchFromFirebase('composers');
        case 'supabase':
          return this.fetchWithSupabaseFallback('composers', composersData.composers as Composer[]);
        case 'api':
          return this.fetchFromAPI('/composers');
        default:
          return Promise.resolve(composersData.composers as Composer[]);
      }
    });
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
    return this.fetchData('periods', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(periodsData.periods as Period[]);
        case 'firebase':
          return this.fetchFromFirebase('periods');
        case 'supabase':
          return this.fetchFromSupabase('periods');
        case 'api':
          return this.fetchFromAPI('/periods');
        default:
          return Promise.resolve(periodsData.periods as Period[]);
      }
    });
  }

  async getPeriodById(id: string): Promise<Period | null> {
    const periods = await this.getPeriods();
    return periods.find(p => p.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // MUSICAL FORMS
  // ---------------------------------------------------------------------------

  async getForms(): Promise<MusicalForm[]> {
    return this.fetchData('forms', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(formsData.forms as MusicalForm[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('forms', formsData.forms as MusicalForm[]);
        default:
          return Promise.resolve(formsData.forms as MusicalForm[]);
      }
    });
  }

  async getFormById(id: string): Promise<MusicalForm | null> {
    const forms = await this.getForms();
    return forms.find(f => f.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // GLOSSARY / TERMS
  // ---------------------------------------------------------------------------

  async getTerms(): Promise<Term[]> {
    return this.fetchData('terms', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(glossaryData.terms as Term[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('terms', glossaryData.terms as Term[]);
        default:
          return Promise.resolve(glossaryData.terms as Term[]);
      }
    });
  }

  async getTermById(id: string | number): Promise<Term | null> {
    const terms = await this.getTerms();
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return terms.find(t => t.id === numId) || null;
  }

  async getTermsByCategory(category: string): Promise<Term[]> {
    const terms = await this.getTerms();
    return terms.filter(t => t.category === category);
  }

  // ---------------------------------------------------------------------------
  // WEEKLY ALBUMS
  // ---------------------------------------------------------------------------

  async getWeeklyAlbums(): Promise<WeeklyAlbum[]> {
    return this.fetchData('weeklyAlbums', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(albumsData.weeklyAlbums as WeeklyAlbum[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('weeklyAlbums', albumsData.weeklyAlbums as WeeklyAlbum[]);
        default:
          return Promise.resolve(albumsData.weeklyAlbums as WeeklyAlbum[]);
      }
    });
  }

  async getCurrentWeeklyAlbum(): Promise<WeeklyAlbum | null> {
    const albums = await this.getWeeklyAlbums();
    const weekNumber = this.getWeekNumber();
    return albums.find(a => a.week === weekNumber) || albums[0] || null;
  }

  // ---------------------------------------------------------------------------
  // MONTHLY SPOTLIGHTS
  // ---------------------------------------------------------------------------

  async getMonthlySpotlights(): Promise<MonthlySpotlight[]> {
    return this.fetchData('monthlySpotlights', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve(albumsData.monthlySpotlights as MonthlySpotlight[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('monthlySpotlights', albumsData.monthlySpotlights as MonthlySpotlight[]);
        default:
          return Promise.resolve(albumsData.monthlySpotlights as MonthlySpotlight[]);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // NEW RELEASES
  // ---------------------------------------------------------------------------

  async getNewReleases(): Promise<NewRelease[]> {
    return this.fetchData('newReleases', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve((albumsData as any).newReleases as NewRelease[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('newReleases', (albumsData as any).newReleases as NewRelease[]);
        default:
          return Promise.resolve((albumsData as any).newReleases as NewRelease[]);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // CONCERT HALLS
  // ---------------------------------------------------------------------------

  async getConcertHalls(): Promise<ConcertHall[]> {
    return this.fetchData('concertHalls', () => {
      switch (this.config.type) {
        case 'local':
          return Promise.resolve((albumsData as any).concertHalls as ConcertHall[]);
        case 'supabase':
          return this.fetchWithSupabaseFallback('concertHalls', (albumsData as any).concertHalls as ConcertHall[]);
        default:
          return Promise.resolve((albumsData as any).concertHalls as ConcertHall[]);
      }
    });
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
    return this.fetchData('kickstart', () => {
      return Promise.resolve(kickstartData.days as KickstartDay[]);
    });
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
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  // ---------------------------------------------------------------------------
  // BACKEND-SPECIFIC FETCH METHODS (stubs for future implementation)
  // ---------------------------------------------------------------------------

  private async fetchFromFirebase<T>(collection: string): Promise<T[]> {
    // TODO: Implement Firebase Firestore fetch
    // import { collection, getDocs } from 'firebase/firestore';
    // import { db } from '../config/firebase';
    // const querySnapshot = await getDocs(collection(db, collectionName));
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    throw new Error('Firebase not configured. Set up firebaseConfig in DATA_SOURCE.');
  }

  private async fetchFromSupabase<T>(collection: string): Promise<T[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured.');
    }
    const supabase = getSupabaseClient();
    const table = this.supabaseTableMap[collection] || collection;
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      throw error;
    }
    return (data || []) as T[];
  }

  private async fetchWithSupabaseFallback<T>(collection: string, localData: T[]): Promise<T[]> {
    try {
      return await this.fetchFromSupabase<T>(collection);
    } catch (error) {
      console.warn(`[DataService] Supabase fetch failed for ${collection}, falling back to local.`, error);
      return localData;
    }
  }

  private async fetchFromAPI<T>(endpoint: string): Promise<T[]> {
    if (!this.config.apiConfig?.baseUrl) {
      throw new Error('API not configured. Set up apiConfig in DATA_SOURCE.');
    }
    
    const response = await fetch(`${this.config.apiConfig.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiConfig.apiKey && { 
          'Authorization': `Bearer ${this.config.apiConfig.apiKey}` 
        }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Export singleton instance
export const DataService = new DataServiceClass(DATA_SOURCE);

// Export for testing/custom instances
export { DataServiceClass };
