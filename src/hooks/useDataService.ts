import { useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/dataService';
import { 
  Composer, 
  Period, 
  MusicalForm, 
  Term, 
  WeeklyAlbum, 
  MonthlySpotlight,
  NewRelease,
  ConcertHall,
  KickstartDay,
} from '../types';

// ============================================================================
// Generic Data Hook Factory
// ============================================================================

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseDataListResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function createDataHook<T>(fetcher: () => Promise<T[]>): () => UseDataListResult<T> {
  return function useData(): UseDataListResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
  };
}

// ============================================================================
// Composers Hooks
// ============================================================================

/**
 * Hook to fetch all composers
 */
export const useComposers = createDataHook<Composer>(() => DataService.getComposers());

/**
 * Hook to fetch a single composer by ID
 */
export function useComposer(id: string): UseDataResult<Composer> {
  const [data, setData] = useState<Composer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getComposerById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch composers by period
 */
export function useComposersByPeriod(periodId: string): UseDataListResult<Composer> {
  const [data, setData] = useState<Composer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getComposersByPeriod(periodId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Periods Hooks
// ============================================================================

/**
 * Hook to fetch all periods
 */
export const usePeriods = createDataHook<Period>(() => DataService.getPeriods());

/**
 * Hook to fetch a single period by ID
 */
export function usePeriod(id: string): UseDataResult<Period> {
  const [data, setData] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getPeriodById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Forms Hooks
// ============================================================================

/**
 * Hook to fetch all musical forms
 */
export const useForms = createDataHook<MusicalForm>(() => DataService.getForms());

/**
 * Hook to fetch a single form by ID
 */
export function useForm(id: string): UseDataResult<MusicalForm> {
  const [data, setData] = useState<MusicalForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getFormById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Glossary / Terms Hooks
// ============================================================================

/**
 * Hook to fetch all glossary terms
 */
export const useTerms = createDataHook<Term>(() => DataService.getTerms());

/**
 * Hook to fetch a single term by ID
 */
export function useTerm(id: string | number): UseDataResult<Term> {
  const [data, setData] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getTermById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Album & Content Hooks
// ============================================================================

/**
 * Hook to fetch weekly albums
 */
export const useWeeklyAlbums = createDataHook<WeeklyAlbum>(() => DataService.getWeeklyAlbums());

/**
 * Hook to fetch current weekly album
 */
export function useCurrentWeeklyAlbum(): UseDataResult<WeeklyAlbum> {
  const [data, setData] = useState<WeeklyAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getCurrentWeeklyAlbum();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch monthly spotlights
 */
export const useMonthlySpotlights = createDataHook<MonthlySpotlight>(() => DataService.getMonthlySpotlights());

/**
 * Hook to fetch current monthly spotlight
 */
export function useCurrentMonthlySpotlight(): UseDataResult<MonthlySpotlight> {
  const [data, setData] = useState<MonthlySpotlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getCurrentMonthlySpotlight();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch new releases
 */
export const useNewReleases = createDataHook<NewRelease>(() => DataService.getNewReleases());

/**
 * Hook to fetch concert halls
 */
export const useConcertHalls = createDataHook<ConcertHall>(() => DataService.getConcertHalls());

// ============================================================================
// Kickstart Hooks
// ============================================================================

/**
 * Hook to fetch all kickstart days
 */
export const useKickstartDays = createDataHook<KickstartDay>(() => DataService.getKickstartDays());

/**
 * Hook to fetch a specific kickstart day
 */
export function useKickstartDay(dayNumber: number): UseDataResult<KickstartDay> {
  const [data, setData] = useState<KickstartDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DataService.getKickstartDay(dayNumber);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dayNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
