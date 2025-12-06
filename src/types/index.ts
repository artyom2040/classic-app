// Period types
export interface Period {
  id: string;
  name: string;
  years: string;
  description: string;
  keyCharacteristics: string[];
  composers: string[];
  color: string;
}

// Composer types
export interface KeyWork {
  title: string;
  type: string;
  year: string;
}

export interface Composer {
  id: string;
  name: string;
  years: string;
  period: string;
  nationality: string;
  portrait: string;
  shortBio: string;
  fullBio: string;
  keyWorks: KeyWork[];
  funFact: string;
  listenFirst: string;
  spotifyUri: string;
  youtubeSearch: string;
}

// Glossary types
export interface TermMedia {
  label: string;
  url: string;
  type: 'youtube' | 'spotify' | 'audio';
}

export interface Term {
  id: number;
  term: string;
  category: string;
  shortDefinition?: string;
  longDefinition?: string;
  definition?: string;
  example?: string;
  media?: TermMedia[];
}

// Form types
export interface FormWork {
  composer: string;
  work: string;
  why: string;
}

export interface MusicalForm {
  id: string;
  name: string;
  category: string;
  period: string;
  description: string;
  structure: any[];
  keyWorks: FormWork[];
  listenFor: string[];
}

export type ListenerLevel = 'beginner' | 'intermediate' | 'advanced';

// Album types
export interface KeyMoment {
  time: string;
  description: string;
}

export interface WeeklyAlbum {
  week: number;
  title: string;
  artist: string;
  year: number;
  description: string;
  whyListen: string;
  spotifyUri: string;
  appleMusicUrl: string;
  keyMoments: KeyMoment[];
  listenerLevel?: ListenerLevel;
}

export interface MonthlySpotlight {
  month: number;
  type: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  featuredWorks: string[];
  challenge: string;
}

export interface NewRelease {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  description: string;
  highlightTrack?: string;
  listenerLevel?: ListenerLevel;
}

export interface ConcertHall {
  id: string;
  name: string;
  city: string;
  description: string;
  signatureSound?: string;
  mapUrl?: string;
  listenerLevel?: ListenerLevel;
}

// Kickstart types
export interface KickstartLesson {
  title: string;
  description: string;
}

export interface KickstartListen {
  piece: string;
  duration: string;
  whyThisPiece: string;
  whatToListenFor: string[];
  spotifySearch: string;
  youtubeSearch: string;
}

export interface KickstartBadge {
  id: string;
  name: string;
  description: string;
}

export interface KickstartDay {
  day: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  content: {
    introduction: string;
    keyInsight: string;
    mainLesson: {
      title: string;
      points: KickstartLesson[];
    };
    listenToday: KickstartListen;
    termOfTheDay: {
      term: string;
      definition: string;
    };
  };
  badge: KickstartBadge;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
}

// User progress types
export interface UserProgress {
  kickstartDay: number;
  kickstartCompleted: boolean;
  viewedComposers: string[];
  viewedPeriods: string[];
  viewedForms: string[];
  viewedTerms: number[];
  badges: string[];
  firstLaunch: boolean;
}

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Composers: undefined;
  ComposerDetail: { composerId: string };
  PeriodDetail: { periodId: string };
  FormDetail: { formId: string };
  TermDetail: { termId: number };
  Kickstart: undefined;
  KickstartDay: { day: number };
  WeeklyAlbum: undefined;
  MonthlySpotlight: undefined;
  NewReleases: undefined;
  ConcertHalls: undefined;
  Badges: undefined;
  Settings: undefined;
  Search: undefined;
  Quiz: undefined;
};

export type TabParamList = {
  Home: undefined;
  Timeline: undefined;
  Glossary: undefined;
  Forms: undefined;
  Profile: undefined;
};
