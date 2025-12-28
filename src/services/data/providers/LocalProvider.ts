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

// Import JSON data
import composersData from '../../../data/composers.json';
import periodsData from '../../../data/periods.json';
import formsData from '../../../data/forms.json';
import glossaryData from '../../../data/glossary.json';
import albumsData from '../../../data/albums.json';
import kickstartData from '../../../data/kickstart.json';

// Type for the albums data file structure
interface AlbumsDataFile {
  weeklyAlbums: WeeklyAlbum[];
  monthlySpotlights: MonthlySpotlight[];
  newReleases?: NewRelease[];
  concertHalls?: ConcertHall[];
}

const typedAlbumsData = albumsData as unknown as AlbumsDataFile;

export class LocalProvider implements DataProvider {
  async getComposers(): Promise<Composer[]> {
    return Promise.resolve(composersData.composers as unknown as Composer[]);
  }

  async getPeriods(): Promise<Period[]> {
    return Promise.resolve(periodsData.periods as unknown as Period[]);
  }

  async getForms(): Promise<MusicalForm[]> {
    return Promise.resolve(formsData.forms as unknown as MusicalForm[]);
  }

  async getTerms(): Promise<Term[]> {
    const transformedTerms = glossaryData.terms.map(t => ({
      ...t,
      id: String(t.id),
    }));
    return Promise.resolve(transformedTerms as unknown as Term[]);
  }

  async getWeeklyAlbums(): Promise<WeeklyAlbum[]> {
    return Promise.resolve(typedAlbumsData.weeklyAlbums as WeeklyAlbum[]);
  }

  async getMonthlySpotlights(): Promise<MonthlySpotlight[]> {
    return Promise.resolve(typedAlbumsData.monthlySpotlights as MonthlySpotlight[]);
  }

  async getNewReleases(): Promise<NewRelease[]> {
    return Promise.resolve((typedAlbumsData.newReleases || []) as NewRelease[]);
  }

  async getConcertHalls(): Promise<ConcertHall[]> {
    return Promise.resolve((typedAlbumsData.concertHalls || []) as ConcertHall[]);
  }

  async getKickstartDays(): Promise<KickstartDay[]> {
    return Promise.resolve(kickstartData.days as unknown as KickstartDay[]);
  }
}
