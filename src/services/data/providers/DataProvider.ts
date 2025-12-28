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

export interface DataProvider {
  getComposers(): Promise<Composer[]>;
  getPeriods(): Promise<Period[]>;
  getForms(): Promise<MusicalForm[]>;
  getTerms(): Promise<Term[]>;
  getWeeklyAlbums(): Promise<WeeklyAlbum[]>;
  getMonthlySpotlights(): Promise<MonthlySpotlight[]>;
  getNewReleases(): Promise<NewRelease[]>;
  getConcertHalls(): Promise<ConcertHall[]>;
  getKickstartDays(): Promise<KickstartDay[]>;
}
