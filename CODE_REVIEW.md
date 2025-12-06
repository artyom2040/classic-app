# Deep Code Review: Context Composer
**Senior Fullstack Developer (15+ Years Experience) Assessment**

---

## Executive Summary

Context Composer is a **well-organized, professionally structured React Native application** with solid architecture decisions. The codebase demonstrates best practices in TypeScript adoption, component design, and state management. However, there are several refactoring opportunities that would improve maintainability, reduce duplication, and prepare the app for scaling.

**Overall Assessment: B+ → A (with recommended improvements)**

---

## ✅ STRENGTHS

### 1. **Strong Architectural Foundation**
- **Clean separation of concerns**: Screens, components, context, services, utilities are well-organized
- **TypeScript throughout**: Full type safety with no `any` types (except minimal cases)
- **React Context for state**: Appropriate for app scale, well-structured providers
- **Data service abstraction**: Excellent preparation for backend integration

### 2. **Professional Pattern Implementation**
- **Custom hooks pattern**: `useStreak`, `useFavorites`, `useTheme` follow React conventions
- **Error boundaries**: Proper crash handling with `ErrorBoundary` component
- **Safe area handling**: Cross-platform UI consistency with `react-native-safe-area-context`
- **Theme system**: Sophisticated 6-theme implementation with context-based switching

### 3. **Component Design Quality**
- **Themed components library**: Consistent UI across app via `ThemedCard`, `ThemedButton`, etc.
- **Proper component composition**: Small, focused components with single responsibilities
- **Reusable placeholders**: SVG placeholders for all content types
- **Loading states**: Skeleton loaders for better perceived performance

### 4. **State Management**
- **Well-designed contexts**: Each context has single responsibility (Theme, Audio, Favorites, Settings)
- **Proper hook patterns**: Error handling in hooks, appropriate dependencies
- **Local persistence**: AsyncStorage integration for offline support
- **Type-safe context usage**: Custom hook wrappers with proper error messaging

---

## 🔴 CRITICAL ISSUES

### 1. **Storage Utility Anti-Pattern** (HIGH PRIORITY)
**File**: `src/utils/storage.ts`

```typescript
// PROBLEM: Repetitive pattern for marking items as viewed
export async function markComposerViewed(composerId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedComposers.includes(composerId)) {
    progress.viewedComposers.push(composerId);
    await saveProgress(progress);
  }
}

export async function markPeriodViewed(periodId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedPeriods.includes(periodId)) {
    progress.viewedPeriods.push(periodId);
    await saveProgress(progress);
  }
}

export async function markFormViewed(formId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedForms.includes(formId)) {
    progress.viewedForms.push(formId);
    await saveProgress(progress);
  }
}

export async function markTermViewed(termId: number): Promise<void> {
  const progress = await getProgress();
  if (!progress.viewedTerms.includes(termId)) {
    progress.viewedTerms.push(termId);
    await saveProgress(progress);
  }
}
```

**Issues:**
- 4 nearly identical functions → maintenance nightmare
- Violates DRY (Don't Repeat Yourself) principle
- Hard to extend if you add new viewed item types
- Inconsistent parameter types (string vs number)

**Recommended Refactor:**
```typescript
export async function markItemViewed(
  itemType: 'composers' | 'periods' | 'forms' | 'terms',
  itemId: string | number
): Promise<void> {
  const progress = await getProgress();
  const items = progress[itemType] as (string | number)[];

  if (!items.includes(itemId)) {
    items.push(itemId);
    await saveProgress(progress);
  }
}

// Keep convenience wrappers for backward compatibility
export const markComposerViewed = (id: string) => markItemViewed('composers', id);
export const markPeriodViewed = (id: string) => markItemViewed('periods', id);
export const markFormViewed = (id: string) => markItemViewed('forms', id);
export const markTermViewed = (id: number) => markItemViewed('terms', id);
```

---

### 2. **Data Service Switch Statement Duplication** (HIGH PRIORITY)
**File**: `src/services/dataService.ts`

```typescript
// PROBLEM: Repeated pattern in every method
async getComposers(): Promise<Composer[]> {
  return this.fetchData('composers', () => {
    switch (this.config.type) {
      case 'local':
        return Promise.resolve(composersData.composers as Composer[]);
      case 'firebase':
        return this.fetchFromFirebase('composers');
      case 'supabase':
        return this.fetchFromSupabase('composers');
      case 'api':
        return this.fetchFromAPI('/composers');
      default:
        return Promise.resolve(composersData.composers as Composer[]);
    }
  });
}

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

async getForms(): Promise<MusicalForm[]> {
  return this.fetchData('forms', () => {
    switch (this.config.type) {
      case 'local':
        return Promise.resolve(formsData.forms as MusicalForm[]);
      default:
        return Promise.resolve(formsData.forms as MusicalForm[]);
    }
  });
}
```

**Issues:**
- Massive code duplication (same switch in 6+ methods)
- Each new data type means copying entire switch block
- Hard to change backend strategy globally
- Inconsistent implementation (some methods missing backend cases)

**Recommended Refactor:**
```typescript
class DataServiceClass {
  // Map data collections to their local source
  private readonly dataCollections = {
    composers: composersData.composers,
    periods: periodsData.periods,
    forms: formsData.forms,
    terms: glossaryData.terms,
    albums: albumsData.weeklyAlbums,
    spotlights: albumsData.monthlySpotlights,
    kickstart: kickstartData.days,
  };

  private async fetchCollection<T>(
    collection: keyof typeof this.dataCollections
  ): Promise<T[]> {
    switch (this.config.type) {
      case 'local':
        return Promise.resolve(this.dataCollections[collection] as T[]);
      case 'firebase':
        return this.fetchFromFirebase(collection);
      case 'supabase':
        return this.fetchFromSupabase(collection);
      case 'api':
        return this.fetchFromAPI(`/${collection}`);
      default:
        return Promise.resolve(this.dataCollections[collection] as T[]);
    }
  }

  async getComposers(): Promise<Composer[]> {
    return this.fetchData('composers', () => this.fetchCollection<Composer>('composers'));
  }

  async getPeriods(): Promise<Period[]> {
    return this.fetchData('periods', () => this.fetchCollection<Period>('periods'));
  }

  async getForms(): Promise<MusicalForm[]> {
    return this.fetchData('forms', () => this.fetchCollection<MusicalForm>('forms'));
  }
  // ... all other methods follow same pattern
}
```

---

### 3. **Theme Context: Magic String Anti-Pattern** (MEDIUM PRIORITY)
**File**: `src/context/ThemeContext.tsx` (Line 51)

```typescript
const isDark = themeName !== 'light' && themeName !== 'neobrutalist' && themeName !== 'liquidglass';
const isGlass = themeName === 'liquidglass';
```

**Issues:**
- Magic strings repeated throughout codebase
- Adding new theme requires updating multiple conditional checks
- No single source of truth for theme characteristics
- Maintainability issue

**Recommended Refactor:**
```typescript
// In theme/themes.ts
export const themeMetadata: Record<ThemeName, { isDark: boolean; isGlass: boolean }> = {
  light: { isDark: false, isGlass: false },
  dark: { isDark: true, isGlass: false },
  classic: { isDark: true, isGlass: false },
  skeuomorphic: { isDark: true, isGlass: false },
  neobrutalist: { isDark: false, isGlass: false },
  liquidglass: { isDark: false, isGlass: true },
};

// In ThemeContext.tsx
const theme = themes[themeName];
const metadata = themeMetadata[themeName];
const isDark = metadata.isDark;
const isGlass = metadata.isGlass;
```

---

### 4. **Inline Theme Styling in Components** (MEDIUM PRIORITY)
**File**: `src/screens/HomeScreenV2.tsx` (Lines 87-96)

```typescript
const cardStyle = {
  backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.6)' : t.colors.surface,
  borderRadius: t.borderRadius.lg,
  ...(isBrutal ? { borderWidth: 3, borderColor: t.colors.border } : {}),
  ...(isGlass ? {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden' as const,
  } : t.shadows.sm),
};
```

**Issues:**
- Repeated in multiple screens (HomeScreenV2, TimelineScreen, etc.)
- Hard to maintain consistent styling
- Should be in themed components, not screens
- No reusability across screens

**Recommended Refactor:**
Create a `ThemedVariantCard` component or extend `ThemedCard`:
```typescript
// In components/themed/index.tsx
interface ThemedCardProps {
  // ... existing props
  theme?: 'default' | 'glass' | 'brutal';
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  theme = 'default',
  ...props
}) => {
  const { theme: themeObj, themeName } = useTheme();

  const variants = {
    default: { /* default styles */ },
    glass: { /* glass styles */ },
    brutal: { /* brutal styles */ },
  };

  return <TouchableOpacity style={[variants[theme], ...]}>
    {children}
  </TouchableOpacity>;
};
```

---

### 5. **Audio Context: Platform-Specific Logic in Business Logic** (MEDIUM PRIORITY)
**File**: `src/context/AudioContext.tsx` (Lines 84-174)

```typescript
const playTrack = useCallback(async (track: Track) => {
  try {
    // If same track, just toggle play
    if (currentTrack?.id === track.id) {
      if (isWeb) {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            await audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } else if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.pause();
        } else {
          playerRef.current.play();
        }
      }
      return;
    }
    // ... more platform checks
  }
}, [...]); // Long dependency list
```

**Issues:**
- Platform-specific logic mixed with business logic
- Difficult to test
- Duplicate toggle logic for different platforms
- Large dependency array
- Hard to add new platforms

**Recommended Refactor:**
```typescript
// Create an abstraction layer
interface AudioPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  seekTo(position: number): Promise<void>;
  setSource(url: string): Promise<void>;
  getStatus(): AudioStatus;
  onStatusUpdate(callback: (status: AudioStatus) => void): () => void;
}

// Platform-specific implementations
class WebAudioPlayer implements AudioPlayer {
  // ... web implementation
}

class NativeAudioPlayer implements AudioPlayer {
  // ... native implementation
}

// AudioContext uses abstraction
const player = Platform.OS === 'web' ? new WebAudioPlayer() : new NativeAudioPlayer();
```

---

## 🟡 MODERATE ISSUES & IMPROVEMENTS

### 6. **Repetitive Badge/Achievement Logic** (MEDIUM)
**File**: `src/utils/storage.ts`

The badge system is minimal but not scalable:
```typescript
export async function earnBadge(badgeId: string): Promise<boolean> {
  const progress = await getProgress();
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    await saveProgress(progress);
    return true;
  }
  return false;
}
```

**Recommendation**: Create a badge manager service with:
- Badge metadata (name, description, icon, unlock conditions)
- Automatic badge unlocking based on progress
- Badge analytics/tracking
- Prevented duplicated badge logic across screens

---

### 7. **Week/Month Calculation Duplication** (MEDIUM)
**File**: `src/utils/storage.ts` and `src/services/dataService.ts`

Week calculation appears in TWO places:
```typescript
// storage.ts
export function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

// dataService.ts
private getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}
```

**Recommendation**: Create a `dateUtils.ts` file with date calculations:
```typescript
// src/utils/dateUtils.ts
export const getWeekNumber = () => { /* implementation */ };
export const getMonthNumber = () => { /* implementation */ };
export const getDayOfYear = () => { /* implementation */ };
export const getDateString = (date?: Date) => { /* implementation */ };
export const getDaysDifference = (d1: string, d2: string) => { /* implementation */ };
```

---

### 8. **Missing Error Handling in Components** (MEDIUM)
Several screens don't handle data loading errors:

```typescript
// HomeScreenV2.tsx
const [progress, setProgress] = useState<UserProgress | null>(null);
const [progressLoading, setProgressLoading] = useState(true);

// No error state for loadProgress failures
const loadProgress = useCallback(async () => {
  setProgressLoading(true);
  const p = await getProgress();  // <- No try/catch
  setProgress(p);
  setProgressLoading(false);
}, []);
```

**Recommendation**:
```typescript
interface ScreenState {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

const [state, setState] = useState<ScreenState>({ data: null, isLoading: true, error: null });

const loadData = useCallback(async () => {
  setState(s => ({ ...s, isLoading: true, error: null }));
  try {
    const data = await getProgress();
    setState(s => ({ ...s, data, isLoading: false }));
  } catch (error) {
    setState(s => ({ ...s, error: error.message, isLoading: false }));
  }
}, []);
```

---

### 9. **AsyncStorage Error Handling is Silent** (MEDIUM)
**File**: Multiple context files

```typescript
const loadTheme = async () => {
  try {
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (saved && themes[saved as ThemeName]) {
      setThemeName(saved as ThemeName);
    }
  } catch (e) {
    console.error('Failed to load theme', e);  // Silently fails, app continues
  }
};
```

**Issue**: Errors are logged but user has no indication persistence failed

**Recommendation**:
- Implement retry logic for critical storage operations
- Use error boundary to catch storage failures
- Consider showing warning toast for non-critical failures

---

### 10. **Favorites Hook Mutation Issue** (LOW PRIORITY)
**File**: `src/context/FavoritesContext.tsx` (Line 127)

```typescript
export function useFavoriteItem(id: string | number, type: FavoriteType) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return {
    isFavorite: isFavorite(id, type),  // <- Recomputes every render!
    toggle: () => toggleFavorite(id, type),
  };
}
```

**Issue**: `isFavorite` is called during render, may cause unnecessary re-renders

**Recommendation**:
```typescript
export function useFavoriteItem(id: string | number, type: FavoriteType) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favorited, setFavorited] = useState(() => isFavorite(id, type));

  useEffect(() => {
    setFavorited(isFavorite(id, type));
  }, [id, type, isFavorite]);

  return useMemo(() => ({
    isFavorite: favorited,
    toggle: () => toggleFavorite(id, type),
  }), [favorited, toggleFavorite, id, type]);
}
```

---

### 11. **Type Inconsistencies** (MEDIUM)
**File**: `src/services/dataService.ts` and screens

Mixing string and number IDs:
```typescript
// types/index.ts
export interface Term {
  id: number;  // <- Number
}

export interface Composer {
  id: string;  // <- String
}

// Causes friction in code
async getTermById(id: string | number): Promise<Term | null> {
  const terms = await this.getTerms();
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;  // <- Manual conversion
  return terms.find(t => t.id === numId) || null;
}
```

**Recommendation**: Standardize on string IDs throughout:
```typescript
export interface Term {
  id: string;  // Change to string
}

// Or use branded types for type safety
type TermId = string & { readonly __brand: 'TermId' };
type ComposerId = string & { readonly __brand: 'ComposerId' };
```

---

## 🟢 ARCHITECTURAL IMPROVEMENTS

### 12. **Create Custom Hook for Async Data Loading**
**Opportunity**: Extract common data loading pattern

```typescript
// src/hooks/useAsyncData.ts
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState(s => ({ ...s, error, isLoading: false }));
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, deps);

  return { ...state, refetch };
}
```

**Usage in HomeScreenV2**:
```typescript
const { data: progress, isLoading, error } = useAsyncData(() => getProgress());
```

---

### 13. **Create A Storage Strategy Pattern**
**Opportunity**: Support different storage backends

```typescript
// src/services/storage/storageStrategy.ts
interface StorageStrategy {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class AsyncStorageStrategy implements StorageStrategy {
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  }
  // ... implement others
}

// Use dependency injection in context
export function StorageProvider({ strategy, children }: {
  strategy: StorageStrategy;
  children: ReactNode;
}) {
  // Use strategy for all persistence
}
```

---

### 14. **Create Screen Navigation Abstraction**
**Opportunity**: Centralize navigation logic

```typescript
// src/services/navigationService.ts
class NavigationService {
  private navigationRef: NavigationContainerRef<RootStackParamList>;

  setNavigationRef(ref: NavigationContainerRef<RootStackParamList>) {
    this.navigationRef = ref;
  }

  navigateToComposer(id: string) {
    this.navigationRef.navigate('ComposerDetail', { composerId: id });
  }

  navigateToPeriod(id: string) {
    this.navigationRef.navigate('PeriodDetail', { periodId: id });
  }

  // ... other navigation methods
}

export const navigationService = new NavigationService();
```

**Benefit**: Testable, reusable, centralized navigation logic

---

### 15. **Consolidate Notification/Toast Logic**
**Opportunity**: Create a notification service

```typescript
// src/services/notificationService.ts
class NotificationService {
  private toastCallback: ((msg: string, type: 'info' | 'success' | 'error') => void) | null = null;

  registerToastHandler(callback: (msg: string, type: string) => void) {
    this.toastCallback = callback;
  }

  showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    this.toastCallback?.(message, type);
  }

  showError(error: Error | string) {
    const message = typeof error === 'string' ? error : error.message;
    this.showToast(message, 'error');
  }
}

export const notificationService = new NotificationService();
```

---

## 📊 REFACTORING PRIORITY MATRIX

| Issue | Severity | Effort | Priority |
|-------|----------|--------|----------|
| Storage utility duplication | High | Low | **P1** |
| Data service switch duplication | High | Medium | **P1** |
| Theme metadata magic strings | Medium | Low | **P2** |
| Inline component styling | Medium | Medium | **P2** |
| Audio context platform logic | Medium | High | **P3** |
| Error handling in components | Medium | Low | **P2** |
| Week calculation duplication | Medium | Low | **P2** |
| Type ID inconsistency | Low | Medium | **P3** |
| Favorites hook mutation | Low | Low | **P3** |
| AsyncStorage error handling | Low | Medium | **P3** |

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1 (Quick Wins - 2-3 hours)
1. ✅ Create `storage.ts` generic `markItemViewed()` function
2. ✅ Create `dateUtils.ts` with date calculations
3. ✅ Add theme metadata to `themes.ts`
4. ✅ Add error state to `HomeScreenV2` and other screens

### Phase 2 (Architecture - 1 day)
5. ✅ Refactor data service with `fetchCollection()` abstraction
6. ✅ Create `useAsyncData()` hook
7. ✅ Extract platform-specific audio logic
8. ✅ Consolidate inline styling into theme components

### Phase 3 (Polish - 1-2 days)
9. ✅ Create navigation service
10. ✅ Create notification service
11. ✅ Standardize ID types
12. ✅ Improve error handling and retry logic

---

## 🏆 CONCLUSION

**Context Composer has excellent fundamentals.** The code is clean, well-typed, and demonstrates professional practices. The recommended refactoring focuses on:

1. **DRY Principle**: Eliminate 5+ instances of code duplication
2. **Separation of Concerns**: Extract platform-specific and business logic
3. **Maintainability**: Centralize configuration and strategy patterns
4. **Scalability**: Prepare for backend integration and new features

These changes would bring the codebase from **B+ to A-grade**, making it significantly easier to maintain, test, and extend as the app grows.

**Estimated effort for all improvements: 3-4 days of focused development**

---

## 📚 Additional Recommendations

### Testing
- Add unit tests for `DataService` with different backends
- Add integration tests for Context providers
- Add E2E tests for critical user flows

### Documentation
- Add JSDoc comments to public APIs
- Create a component storybook
- Document theme customization process

### Performance
- Profile App.tsx rendering (many providers may impact startup)
- Consider lazy loading screens with `@react-navigation/elements`
- Implement virtual lists for large data sets (if needed in future)

### CI/CD
- Add linting rules to prevent duplication
- Set up automated testing in git hooks
- Consider SonarQube for code quality metrics
