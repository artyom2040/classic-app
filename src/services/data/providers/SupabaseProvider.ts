import { DataProvider } from './DataProvider';
import { 
  Composer, 
  Period, 
  MusicalForm, 
  Term, 
  WeeklyAlbum, 
  MonthlySpotlight, 
  NewRelease, 
  ConcertHall, 
  KickstartDay 
} from '../../../types';
import { getSupabaseClient, isSupabaseConfigured } from '../../supabaseClient';

export class SupabaseProvider implements DataProvider {
  private tableMap: Record<string, string> = {
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

  private async fetchFromSupabase<T>(collection: string): Promise<T[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured.');
    }
    const supabase = getSupabaseClient();
    const table = this.tableMap[collection] || collection;
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      throw error;
    }
    return (data || []) as T[];
  }

  async getComposers(): Promise<Composer[]> {
    return this.fetchFromSupabase<Composer>('composers');
  }

  async getPeriods(): Promise<Period[]> {
    return this.fetchFromSupabase<Period>('periods');
  }

  async getForms(): Promise<MusicalForm[]> {
    return this.fetchFromSupabase<MusicalForm>('forms');
  }

  async getTerms(): Promise<Term[]> {
    return this.fetchFromSupabase<Term>('terms');
  }

  async getWeeklyAlbums(): Promise<WeeklyAlbum[]> {
    return this.fetchFromSupabase<WeeklyAlbum>('weeklyAlbums');
  }

  async getMonthlySpotlights(): Promise<MonthlySpotlight[]> {
    return this.fetchFromSupabase<MonthlySpotlight>('monthlySpotlights');
  }

  async getNewReleases(): Promise<NewRelease[]> {
    return this.fetchFromSupabase<NewRelease>('newReleases');
  }

  async getConcertHalls(): Promise<ConcertHall[]> {
    return this.fetchFromSupabase<ConcertHall>('concertHalls');
  }

  async getKickstartDays(): Promise<KickstartDay[]> {
    return this.fetchFromSupabase<KickstartDay>('kickstartDays');
  }
}
