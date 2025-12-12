// Audio Sample types
export interface AudioSample {
  id: string;
  title: string;
  composer: string;
  composerId: string;
  audioUrl: string;
  duration: number; // in seconds
  source: string;
}

export interface AudioSamplesData {
  samples: Record<string, AudioSample[]>;
  featured: string[];
}

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
  id: string;
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

// Union type to support different structure formats in JSON data
export type StructureStep = Record<string, string | number>;

export interface MusicalForm {
  id: string;
  name: string;
  category: string;
  period: string;
  description: string;
  structure: StructureStep[];
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
  viewedTerms: string[];
  badges: string[];
  firstLaunch: boolean;
}

// Navigation types
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;

  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main app
  MainTabs: undefined;
  Composers: undefined;
  ComposerDetail: { composerId: string };
  PeriodDetail: { periodId: string };
  FormDetail: { formId: string };
  FormExplorer: undefined;
  TermDetail: { termId: string };
  Kickstart: undefined;
  KickstartDay: { day: number };
  WeeklyAlbum: undefined;
  MonthlySpotlight: undefined;
  NewReleases: undefined;
  ReleaseDetail: { releaseId: string };
  ConcertHalls: undefined;
  ConcertHallDetail: { hallId: string };
  Badges: undefined;
  Settings: undefined;
  Search: undefined;
  Discover: undefined;
  MusicBrainzSearch: undefined;
  Quiz: undefined;

  // Labs / Experimental screens
  MoodPlaylists: undefined;
  ListeningGuides: undefined;
  ListeningGuidePlayer: { guideId: string };
  Recommendations: undefined;
  Labs: undefined;

  // Dashboard screens
  UserDashboard: undefined;
  AdminDashboard: undefined;
};

export type TabParamList = {
  Home: undefined;
  Timeline: undefined;
  Glossary: undefined;
  Forms: undefined;
  Profile: undefined;
};

// ============================================
// Auth & User Types
// ============================================

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
