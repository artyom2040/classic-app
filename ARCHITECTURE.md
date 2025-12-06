# Context Composer - Architecture & Implementation Guide

## Project Overview

Context Composer is a React Native mobile application that introduces classical music enthusiasts to composers, musical periods, forms, and music theory concepts. The app features:
- Interactive composer and period exploration
- Streaming audio playback of classical compositions
- User progress tracking and badge system
- 5-day kickstart program for new users
- Responsive UI with multiple theme support

## Directory Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components (Loading, Error, Cards)
│   ├── themed/         # Theme-aware components (ThemedCard, ThemedButton)
│   ├── icons/          # Custom icon components
│   └── navigation/     # Navigation-related components
├── context/            # React Context providers
│   ├── ThemeContext.tsx
│   ├── AudioContext.tsx
│   ├── FavoritesContext.tsx
│   ├── SettingsContext.tsx
│   └── ToastContext.tsx
├── screens/            # Screen components
│   ├── HomeScreenV2.tsx
│   ├── ComposerDetailScreen.tsx
│   ├── PeriodDetailScreen.tsx
│   └── ... (other screens)
├── services/           # Business logic & data access
│   ├── dataService.ts          # Unified data access layer
│   ├── navigationService.ts    # Centralized navigation
│   ├── notificationService.ts  # Toast management
│   └── audioPlayer.ts          # Platform-agnostic audio
├── hooks/              # Custom React hooks
│   ├── useAsyncData.ts        # Async data loading
│   ├── useFavoriteItem.ts     # Single item favorites
│   ├── useStreak.ts           # User streaks/engagement
│   └── ... (other hooks)
├── utils/              # Utility functions
│   ├── dateUtils.ts           # Date operations
│   ├── storageUtils.ts        # Reliable AsyncStorage
│   ├── storage.ts             # App-specific storage
│   ├── colors.ts              # Color definitions
│   └── haptics.ts             # Haptic feedback
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # Static JSON data
│   ├── composers.json
│   ├── periods.json
│   ├── forms.json
│   ├── glossary.json
│   ├── albums.json
│   └── kickstart.json
└── App.tsx             # App entry point
```

## Core Concepts

### 1. Data Service Architecture

The **DataService** provides a unified, abstracted data access layer that can seamlessly switch between different backends without changing consumer code.

**Current Implementation**: Local JSON files
**Supported**: Firebase, Supabase, MongoDB, REST API

#### Configuration

```typescript
// src/services/dataService.ts
const DATA_SOURCE: DataSourceConfig = {
  type: 'local',
  // type: 'firebase',
  // type: 'supabase',
  // type: 'api',
};
```

#### Usage

```typescript
// Fetch data with automatic caching
const composers = await DataService.getComposers();
const bach = await DataService.getComposerById('bach');
const baroqueComposers = await DataService.getComposersByPeriod('baroque');

// Built-in 5-minute cache TTL
// Clear cache with: DataService.clearCache('composers');
```

#### Generic Collection Pattern

Instead of writing separate fetch logic for each data type, DataService uses a generic `fetchCollection<T>()` method that eliminates ~150+ lines of duplicate code.

```typescript
// All data fetchers use the same pattern
async getComposers(): Promise<Composer[]> {
  return this.fetchData('composers', () =>
    this.fetchCollection<Composer>('composers', '/composers')
  );
}
```

### 2. Context Providers

Each context is a vertical slice providing specific functionality. Wrap your component tree with these providers in `App.tsx`.

#### ThemeContext
- **Purpose**: Global theme management
- **Features**: 6 themes (Light, Dark, Glass, Brutal, Plus Light, Plus Dark)
- **Methods**: `useTheme()` hook provides `theme`, `toggleTheme()`, `isDark`, `isGlass`
- **Metadata**: Theme metadata map prevents magic strings

```typescript
const { theme, toggleTheme, isDark } = useTheme();
```

#### AudioContext
- **Purpose**: Audio playback management
- **Platform Abstraction**: Web (HTMLAudioElement) vs Native (expo-audio)
- **Methods**: `play()`, `pause()`, `resume()`, `stop()`, `seekTo()`, `getStatus()`
- **Implementation**: `IAudioPlayer` interface with platform-specific implementations

```typescript
const { playTrack, pause, resume, status } = useAudio();
```

#### FavoritesContext
- **Purpose**: User favorites management
- **Storage**: AsyncStorage with automatic persistence
- **Methods**: `isFavorite()`, `toggleFavorite()`, `getFavoritesByType()`
- **Hook**: `useFavoriteItem()` for single items with memoization

```typescript
const { isFavorite, toggle } = useFavoriteItem('bach', 'composer');
```

#### SettingsContext
- **Purpose**: User settings and preferences
- **Features**: First-launch detection, kickstart tracking
- **Storage**: AsyncStorage persistence

#### ToastContext
- **Purpose**: Notification/toast management
- **Integration**: Works with `notificationService` for cross-app messaging

```typescript
notificationService.showSuccess('Profile updated!');
notificationService.showError('Failed to load data');
```

### 3. Service Layer

Services provide cross-cutting functionality without needing context access everywhere.

#### navigationService
- **Purpose**: Centralized navigation without prop drilling
- **Methods**: `navigateToComposer(id)`, `navigateToPeriod(id)`, `navigateToForm(id)`, etc.
- **Integration**: Set navigation ref in App.tsx

```typescript
// App.tsx
navigationService.setNavigationRef(navigationRef);

// Anywhere in the app
navigationService.navigateToComposer('bach');
```

#### notificationService
- **Purpose**: Toast notifications without context dependencies
- **Methods**: `showSuccess()`, `showError()`, `showInfo()`, `showWarning()`
- **Registration**: ToastProvider registers handler

```typescript
notificationService.showError('Failed to load composers');
```

#### audioPlayer
- **Purpose**: Platform-agnostic audio playback
- **Interface**: `IAudioPlayer` with abstract methods
- **Implementations**:
  - `WebAudioPlayer`: Uses HTMLAudioElement for web
  - `NativeAudioPlayer`: Stub for future expo-audio integration

```typescript
const player = new WebAudioPlayer();
await player.play(trackUrl);
```

### 4. Storage & Caching

#### AsyncStorage with Retry Logic (storageUtils.ts)
- **Purpose**: Production-ready AsyncStorage operations
- **Features**: Exponential backoff retry (3 attempts, 100ms delay, 2x multiplier)
- **Functions**: `getItemWithRetry()`, `setItemWithRetry()`, `removeItemWithRetry()`, `multiGetWithRetry()`, `multiSetWithRetry()`

```typescript
import { getItemWithRetry, setItemWithRetry } from './utils/storageUtils';

const progress = await getItemWithRetry<UserProgress>('progress');
await setItemWithRetry('progress', progress);
```

#### App-Specific Storage (storage.ts)
- **Purpose**: User progress tracking
- **Data**: Viewed composers/periods/forms/terms, badges, kickstart progress
- **Functions**: `getProgress()`, `saveProgress()`, `markComposerViewed()`, `earnBadge()`, `completeKickstartDay()`, `resetProgress()`

```typescript
await markComposerViewed('bach');
const earned = await earnBadge('first_listen');
```

### 5. Custom Hooks

#### useAsyncData
- **Purpose**: Consistent async data loading with error handling
- **Returns**: `{ data, isLoading, error, refetch }`
- **Usage**: Replaces repetitive useState + useEffect patterns

```typescript
const { data: composers, isLoading, error, refetch } = useAsyncData(
  () => DataService.getComposers(),
  []
);
```

#### useFavoriteItem
- **Purpose**: Manage single favorite item state
- **Memoization**: Prevents unnecessary re-renders
- **Returns**: `{ isFavorite, toggle }`

```typescript
const { isFavorite, toggle } = useFavoriteItem('bach', 'composer');
```

#### useStreak
- **Purpose**: Track user daily engagement
- **Returns**: Streak count and completion status
- **Storage**: Uses dateUtils for consistent date calculations

### 6. Utility Functions

#### dateUtils
- **Purpose**: Centralized date operations
- **Functions**: `getWeekNumber()`, `getDayOfYear()`, `getCurrentMonth()`, `getDateString()`, `isToday()`, `isYesterday()`, `daysSince()`
- **Single Source of Truth**: Eliminates duplicate date logic

```typescript
import { getWeekNumber, isToday } from './utils/dateUtils';

const week = getWeekNumber();
const today = isToday(date);
```

### 7. Type Safety

All type definitions are centralized in `src/types/index.ts`:

```typescript
export interface Composer {
  id: string;
  name: string;
  period: string;
  birthYear: number;
  deathYear: number;
  // ... other fields
}

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
```

**Key Changes in Phase 3e**:
- All IDs standardized to `string` type (previously mixed string/number)
- `Term.id` changed from `number` to `string`
- `viewedTerms` array changed from `number[]` to `string[]`
- Eliminates manual type conversions in DataService

## Development Guidelines

### DRY Principle
- Use generic functions instead of repeated patterns
- Example: `markItemViewed()` handles all view tracking instead of 4 separate functions

### Error Handling
- Use `useAsyncData` hook for async operations
- Provide error UI with retry button when appropriate
- Use `storageUtils` for reliable AsyncStorage operations

### Navigation
- Use `navigationService` instead of passing navigation prop
- Eliminates prop drilling across component tree

### Notifications
- Use `notificationService` for toast messages
- No need to access Toast context directly

### Styling
- Use `ThemedCard` component for consistent styling
- Leverage theme metadata for dynamic variants
- Avoid inline styles in component logic

### Audio Playback
- Use `AudioContext` which abstracts platform differences
- Platform logic is isolated in `audioPlayer.ts`

## Performance Considerations

### Caching
- DataService caches all fetched collections for 5 minutes
- Manual cache clear: `DataService.clearCache(key)`

### Memoization
- `useFavoriteItem` uses `useMemo` and `useCallback` for optimized re-renders
- Context values are stable to prevent unnecessary re-renders

### Rendering
- Lazy load screens where applicable
- Virtual lists for large datasets (composers, terms, etc.)

## Testing Strategy

### Unit Tests (Phase 4b)
- **DataService**: Test cache, fetch methods, error handling
- **Context Providers**: Test state updates, side effects
- **Utilities**: Test date calculations, storage operations

### E2E Tests (Phase 4c)
- User registration and first launch
- Composer discovery and playback
- Favorite toggling and persistence
- Kickstart program completion

### Testing Utilities
- Mock DataService for isolated component tests
- Mock navigationService for navigation testing
- Mock notificationService for toast testing

## Deployment Checklist

1. **Data Source**: Update `DATA_SOURCE` configuration for production backend
2. **Audio URLs**: Ensure all composer audio files are properly hosted
3. **Secrets**: Never commit Firebase/Supabase credentials to version control
4. **Build**: Test Android and iOS builds locally before EAS Build
5. **Analytics**: Integrate tracking (Firebase Analytics, Segment, etc.)
6. **Error Tracking**: Setup Sentry or similar for production monitoring

## Future Roadmap

### Phase 4b: Testing Infrastructure
- Jest setup for unit tests
- React Testing Library for component tests
- E2E tests with Detox or Maestro

### Phase 4c: Documentation
- JSDoc completion across all modules
- Storybook for component library
- Interactive API documentation

### Phase 4d: Performance
- Profile App.tsx rendering
- Implement lazy loading
- Optimize bundle size

### Phase 4e: CI/CD
- ESLint rules for code duplication prevention
- Pre-commit hooks (husky + lint-staged)
- GitHub Actions workflows

---

**Last Updated**: Phase 3f (Storage Error Handling)
**Architecture Version**: 2.1
