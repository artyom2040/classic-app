# QODER — Classic App Code Review & Refactor Plan

This file is the single source of truth for refactoring work. It summarizes the current state of the repo and lays out an incremental plan with acceptance criteria.

## How to use this in Qoder
- Keep `QODER.md`, `AGENTS.md`, and `ARCHITECTURE.md` pinned in context.
- Work phase-by-phase. For each task: make the smallest change that satisfies the acceptance criteria, then run the verification commands.
- Keep refactors behavior-preserving unless a phase explicitly says otherwise.

## Repo rules (summary of `AGENTS.md`)
- TypeScript-first with functional components/hooks.
- 2-space indentation, single quotes, semicolons.
- Prefer TS path aliases from `tsconfig.json` (`@/*`, `@data/*`, etc.) over deep relative imports.
- Keep theming via `src/theme` tokens; avoid hard-coded colors.

## Baseline (2025-12-12)
- Tests: `npm test -- --runInBand` ✅ (3 suites, 65 tests)
- Lint: `npm run lint` ❌ (32 errors, 306 warnings)
  - **Blockers**:
    - Missing globals for Jest/Node in `__mocks__` and `jest.setup.js`.
    - Invalid `@ts-ignore` in `src/components/HoverCard.tsx`.
    - `prefer-const` violations in tests.
  - **Noise**: excessive `no-unused-vars` and `no-console`.

## Code Review Findings (Verified)

### 🔴 Critical (fix early)
1.  **ESLint Config**: The current configuration fails to recognize test/node environments for specific files, causing false positives that mask real errors.
2.  **Toast Hook Bug**: `src/components/Toast.tsx` has a `useEffect` that depends on `visible` but misses `duration` and the un-memoized `hideToast` function. This causes potential memory leaks and inconsistent dismissal.
3.  **Auth Race Condition**: `src/context/AuthContext.tsx` triggers both `getSession()` and `onAuthStateChange` listeners on mount, leading to potential race conditions and double state updates.
4.  **Type Safety Gaps**: `src/services/dataService.ts` uses `any` for its internal cache, bypassing type safety for all data retrieval.

### 🟠 High priority
-   **Hard-coded "Stitch" & Theme**: `src/screens/HomeScreenV2.tsx` contains hardcoded colors (e.g., `#261e35`) and layout logic for a "Stitch" mode that isn't formally defined in the theme system. `isGlass` is hardcoded to `false`.
-   **ID Inconsistency**: `FavoritesContext` and `src/types/index.ts` mix `string` and `number` for IDs. `src/services/dataService.ts` casts to string at runtime in some places but not others.
-   **Data Access Fragmentation**: `HomeScreenV2.tsx` imports JSON files directly, bypassing `DataService` caching and normalization logic.

### 🟡 Medium priority
-   **Navigation Persistence**: `src/hooks/useNavigationPersistence.ts` lacks version control. A change in navigation structure will crash the app for users with saved state.
-   **Network Polling**: `src/hooks/useNetworkStatus.ts` uses a `setInterval` loop (5s) instead of event listeners, which is inefficient.
-   **Hook Completeness**: `useAsyncData` lacks proper AbortController integration.
-   **Dead Code**: `src/services/queryClient.ts` sets up React Query, but it is unused.

### 🔵 Low priority
-   **Console Logging**: Widespread use of `console.log` in `AuthContext` and other services instead of the `Logger` utility.
-   **Unused Artifacts**: Various unused variables and imports across component files (verified via lint).

## Decisions to make before refactoring
- **Themes**: keep only `dark | light` and delete glass/brutal branches, or reintroduce full theme support (and make `isGlass` real)?
- **Data fetching**: adopt React Query (`useQuery`) or stick to custom hooks/caching? ⚠️ **Decide before Phase 1** — affects data hook refactors.
- **IDs**: convert JSON IDs to strings (content change) vs normalize at the boundaries (code change + storage migrations)?

## Refactor Plan (Phased)

### Phase 0 — Tooling Baseline
Goal: Make `npm run lint` actionable and reliable.

Tasks:
- [ ] **Config**: Update `eslint.config.mjs` (or `.eslintrc`) to properly handle `jest` and `node` environments for `__mocks__/**`, `jest.setup.js`, and `scripts/**`.
- [ ] **Fix**: Replace `@ts-ignore` with `@ts-expect-error` in `src/components/HoverCard.tsx`.
- [ ] **Fix**: Resolve `prefer-const` errors in tests.
- [ ] **Fix**: Address critical unused variable errors where they indicate bugs.

Acceptance:
- [ ] `npm run lint` passes (warnings allowed, but errors must be 0).
- [ ] `npm test -- --runInBand` passes.

### Phase 1 — ID Normalization & Data Safety
Goal: Enforce `string` IDs and centralized data access.

Tasks:
- [ ] **Type Definition**: standardise `id: string` in `src/types/index.ts`.
- [ ] **Migration**: Update `FavoritesContext` to strictly use `string` IDs. (Note: effectively handling legacy persisted numbers via migration/cast on load).
- [ ] **DataService**: Remove `any` from `cache` definition; use generics.
- [ ] **Refactor**: Update `HomeScreenV2.tsx` to use `DataService` instead of direct JSON imports.

Acceptance:
- [ ] No `any` types in `DataService` cache.
- [ ] `FavoritesContext` exposes strictly `string` IDs.
- [ ] `HomeScreenV2` loads data via service.

### Phase 1b — Storage Consolidation
Goal: Single storage API with consistent retry/error handling.

Tasks:
- [ ] Refactor `src/utils/storage.ts` to use `storageUtils.ts` internally (keep domain functions, delegate to generic utils).
- [ ] Remove duplicate AsyncStorage patterns.

Acceptance:
- [ ] Only `storageUtils.ts` directly imports AsyncStorage (except `useNavigationPersistence.ts`).
- [ ] All existing storage tests pass.

### Phase 2 — Theme Consolidation
Goal: Remove hardcoded styles and "dead" theme branches.

Tasks:
- [ ] **Formalize "Stitch"**: Decide if "Stitch" is a theme or a layout variant. If theme, add to `ThemeName`. If layout, extract common styles to `src/theme`.
- [ ] **Cleanup**: Remove `isGlass = false` dead code blocks.
- [ ] **Tokenize**: Replace hardcoded hex values in `HomeScreenV2` with `theme.colors` tokens.

Acceptance:
- [ ] No hardcoded hex colors in `HomeScreenV2` (except perhaps specific gradient definitions if not in theme).
- [ ] No dead `if (isGlass)` blocks.

### Phase 3 — Core Stability (Hooks & Auth)
Goal: Fix race conditions and memory leaks.

Tasks:
- [ ] **Toast**: Fix dependency array and memoize `hideToast` in `src/components/Toast.tsx`.
- [ ] **Auth**: Implement initialization guard (mutex/ref) in `AuthContext` to prevent race between session fetch and listener.
- [ ] **Navigation**: Add `{ version: 1 }` wrapper to `useNavigationPersistence.ts` and validate on load.
- [ ] **Network**: Refactor `useNetworkStatus.ts` to use event listeners if available, or increase polling interval/disable in background.
- [ ] **Hooks**: Fix `useAsyncData` timeout/abort semantics.

Acceptance:
- [ ] No race conditions in Auth logs.
- [ ] Toast dismisses correctly without warning.
- [ ] Navigation state is versioned.

### Phase 4 — Cleanup & Standardization
Tasks:
- [ ] **Logging**: Replace `console.log` with `Logger.info/debug` or remove.
- [ ] **Storage**: Refactor `src/utils/storage.ts` to wrap `storageUtils.ts`.
- [ ] **Dead Code**: Remove unused imports identified in lint.

### Phase 5 (Future) — React Query
- [ ] Adopt React Query for `DataService` calls to handle caching/loading states natively.
- [ ] OR remove `QueryClientProvider` and `src/services/queryClient.ts` if not adopting.

### Phase 6 — Documentation Alignment
Tasks:
- [ ] Update `ARCHITECTURE.md` and `CLAUDE.MD` to match the current codebase.

## Verification Commands
- Test: `npm test -- --runInBand`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`

---

## Appendix: archived previous `QODER.md` (unverified; kept for reference)

````markdown
```markdown

I'll conduct a deep code review. Let me start by examining the core files.
Now let me examine the context providers and services.
Let me examine more services and types.
Let me check more services and hooks.
Let me check a few more screens and admin logic.
Let me examine a few more critical files.
Now I have a comprehensive understanding. Here's my **deep code review**:

---

# Deep Code Review: Classic App

## Overview
A well-structured React Native/Expo app for classical music education. The architecture is clean with proper separation of concerns. Below are findings organized by severity.

---

## 🔴 Critical Issues

### 1. **Memory Leak in AudioContext** (`src/context/AudioContext.tsx`)
```typescript
// Line 77: Missing duration dependency
useEffect(() => {
  if (visible) {
    // ...
    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      return () => clearTimeout(timer);  // Only clears on unmount, not on duration change
    }
  }
}, [visible]);  // Missing: duration, hideToast
```
The `useEffect` in Toast.tsx (lines 54-77) has missing dependencies. The `hideToast` function should be memoized.

### 2. **Race Condition in Auth State** (`src/context/AuthContext.tsx`)
```typescript
// Lines 126-161: Potential race condition
supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session?.user) {
    const profile = await fetchUserProfile(session.user.id);
    setUser(profile);  // May conflict with onAuthStateChange listener
  }
  setIsLoading(false);
});
```
If `onAuthStateChange` fires before `getSession` completes, there's a race condition. Consider using a flag or consolidating initialization.

### 3. **Unsafe Type Assertion** (`src/services/dataService.ts:85`)
```typescript
private cache: Map<string, { data: any; timestamp: number }> = new Map();
```
Using `any` bypasses TypeScript's safety. Should use a generic or proper typing.

---

## 🟠 High Priority Issues

### 4. **Stale Closure in playTrack** (`src/context/AudioContext.tsx:192`)
```typescript
}, [currentTrack?.id, isPlaying, showToast, isWeb, ensureUrlAvailable]);
```
Missing `audioRef` from dependencies. The closure captures a stale reference.

### 5. **Unhandled Promise Rejection** (`src/services/auth.ts:21-23`)
```typescript
export async function getSession(): Promise<Session | null> {
  // ...
  if (error) throw error;  // Not caught by caller in many places
  return data.session;
}
```
Errors thrown here bubble up unhandled. Add try-catch at call sites.

### 6. **Navigation State Persistence Risk** (`src/hooks/useNavigationPersistence.ts`)
Persisting full navigation state can cause crashes if screen params change between versions. Consider:
```typescript
// Add version check
const NAV_STATE_VERSION = 1;
const savedState = { version: NAV_STATE_VERSION, state: state };
```

### 7. **Polling in useNetworkStatus** (`src/hooks/useNetworkStatus.ts:74`)
```typescript
const interval = setInterval(async () => {
  // Polls every 5 seconds
}, 5000);
```
Polling on mobile drains battery. Expo's `Network` module supports subscription—use `Network.addNetworkStateListener` when available.

---

## 🟡 Medium Priority Issues

### 8. **Duplicate Storage Logic** (`src/utils/storage.ts` vs `src/utils/storageUtils.ts`)
Two overlapping storage utilities:
- `storage.ts` - Domain-specific (progress, badges)
- `storageUtils.ts` - Generic with retry

Recommendation: Refactor `storage.ts` to use `storageUtils.ts` internally.

### 9. **Hard-coded Styles in HomeScreenV2** (Lines 292-340)
```typescript
backgroundColor: '#261e35', // Reference: bg-[#261e35]
color: '#a593c8', // text-secondary
```
Theme-specific colors are hard-coded instead of using theme tokens.

### 10. **Missing Error Boundaries for Async Operations**
Many screens fetch data but don't wrap in error boundaries:
```typescript
// HomeScreenV2.tsx - No error handling for failed loads
const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];
```
If `albumsData` is malformed, app crashes.

### 11. **Unused Variable** (`App.tsx:77`)
```typescript
const t = theme;
const isStitch = isDark;  // Used, but 'themeName' is destructured and unused
```

### 12. **Inconsistent ID Types** (`src/types/index.ts` & `src/context/FavoritesContext.tsx`)
```typescript
// FavoritesContext uses: id: string | number
// But most entities use: id: string
```
This leads to `String(t.id)` conversions scattered throughout. Standardize on `string`.

---

## 🔵 Low Priority / Code Quality

### 13. **Dead Code** - `isGlass` Always False
```typescript
// ThemeContext.tsx:102
const isGlass = false; // Removed liquidglass theme

// But HomeScreenV2.tsx still has glass-specific rendering:
if (isGlass) { ... }  // Line 214-226 - Never executes
```

### 14. **Missing Return Type Annotations**
```typescript
// Multiple hooks like useFavoriteItem, getGreeting lack return types
function getGreeting(): string { ... }  // ✓ Has type
const loadProgress = useCallback(async () => { ... }, []);  // ✗ Implicit any
```

### 15. **Console Statements in Production** 
Multiple `console.log`, `console.warn`, `console.error` throughout:
```typescript
console.log('[Auth] Session found for user:', session.user.id);
```
Use the existing `logger.ts` utility or add production filtering.

### 16. **Index Import Barrel** (`src/components/index.ts`)
Missing exports for several components used directly:
```typescript
// App.tsx imports:
import MiniPlayer from './src/components/MiniPlayer';  // Direct import
// But other components use barrel:
import { ToastProvider, ErrorBoundary, ... } from './src/components';
```

### 17. **Magic Numbers**
```typescript
// useNetworkStatus.ts:81
}, 5000); // Why 5 seconds?

// AudioContext.tsx:86
this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
```
Extract to named constants.

---

## ✅ What's Done Well

1. **Clean Provider Architecture** - Context providers are well-organized with proper separation
2. **Type Definitions** - Comprehensive types in `src/types/index.ts`
3. **Storage Utilities** - Excellent retry logic with exponential backoff in `storageUtils.ts`
4. **Error Boundary** - Proper class component with themed fallback
5. **Data Service Abstraction** - Good preparation for backend migration
6. **Admin Service** - Proper audit logging and version management
7. **Responsive Hooks** - `useResponsive` for web/desktop support
8. **Haptic Feedback** - Consistent UX patterns

---

## Recommended Fixes (Priority Order)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Race condition in auth | `AuthContext.tsx` | Add initialization mutex |
| 2 | Memory leak in toast | `Toast.tsx` | Add missing deps to useEffect |
| 3 | Stale closures | `AudioContext.tsx` | Review all useCallback deps |
| 4 | Network polling | `useNetworkStatus.ts` | Use native listener if available |
| 5 | Type inconsistency | Multiple | Standardize `id: string` everywhere |
| 6 | Dead glass theme code | Multiple | Remove or add back theme option |
| 7 | Consolidate storage | `storage.ts` | Use `storageUtils.ts` as base |

---

Want me to provide specific fix implementations for any of these issues?

# QODER.md

## Code Review Findings

### 🔴 Critical

| # | Issue | File | Description |
|---|-------|------|-------------|
| 1 | Race condition in auth | `src/context/AuthContext.tsx` | `getSession()` and `onAuthStateChange` can conflict |
| 2 | Memory leak in Toast | `src/components/Toast.tsx` | Missing deps in useEffect (duration, hideToast) |
| 3 | Unsafe `any` type | `src/services/dataService.ts:85` | Cache uses `any` instead of proper typing |

### 🟠 High Priority

| # | Issue | File | Description |
|---|-------|------|-------------|
| 4 | Stale closure | `src/context/AudioContext.tsx:192` | Missing `audioRef` in playTrack deps |
| 5 | Unhandled promise rejection | `src/services/auth.ts:21-23` | `getSession` throws without catch at call sites |
| 6 | Nav state versioning | `src/hooks/useNavigationPersistence.ts` | No version check—can crash after updates |
| 7 | Battery drain | `src/hooks/useNetworkStatus.ts:74` | Polling every 5s instead of native listener |

### 🟡 Medium Priority

| # | Issue | File | Description |
|---|-------|------|-------------|
| 8 | Duplicate storage logic | `storage.ts` / `storageUtils.ts` | Two overlapping utilities |
| 9 | Hard-coded colors | `src/screens/HomeScreenV2.tsx` | Theme colors bypassed (e.g., `#261e35`) |
| 10 | Missing error handling | `HomeScreenV2.tsx` | No fallback if JSON data malformed |
| 11 | Unused variable | `App.tsx:77` | `themeName` destructured but unused |
| 12 | Inconsistent ID types | `types/index.ts`, `FavoritesContext.tsx` | Mix of `string` and `string | number` |

### 🔵 Low Priority

| # | Issue | File | Description |
|---|-------|------|-------------|
| 13 | Dead code | Multiple | `isGlass` always false but still checked |
| 14 | Missing return types | Multiple hooks | Implicit `any` returns |
| 15 | Console in prod | Multiple | No production log filtering |
| 16 | Inconsistent imports | `App.tsx` | Mix of barrel and direct imports |
| 17 | Magic numbers | Multiple | Hard-coded intervals/timeouts |

---

## Recommended Fixes

### Fix 1: Auth Race Condition
```typescript
// AuthContext.tsx - use ref to track initialization
const initializedRef = useRef(false);

useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;
  // ... initialization logic
}, []);
```

### Fix 2: Toast useEffect Dependencies
```typescript
const hideToast = useCallback(() => { ... }, [onDismiss]);

useEffect(() => {
  if (visible) {
    // animations...
    if (duration > 0) {
      const timer = setTimeout(hideToast, duration);
      return () => clearTimeout(timer);
    }
  }
}, [visible, duration, hideToast]);
```

### Fix 3: Type-Safe Cache
```typescript
private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

private async fetchData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
    return cached.data as T;
  }
  // ...
}
```

### Fix 6: Nav State Versioning
```typescript
const NAV_STATE_VERSION = 1;

const loadState = async () => {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.NAVIGATION_STATE);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.version === NAV_STATE_VERSION) {
      setInitialState(parsed.state);
    }
  }
};
```

### Fix 8: Consolidate Storage
Refactor `storage.ts` to use `storageUtils.ts`:
```typescript
import { getStorageItem, setStorageItem } from './storageUtils';

export async function getProgress(): Promise<UserProgress> {
  return getStorageItem<UserProgress>(STORAGE_KEY, defaultProgress);
}
```

---

## Improvement Ideas

### Performance
- [ ] **Virtualized lists** - Use FlashList instead of ScrollView for Glossary/Forms
- [ ] **Image caching** - Add expo-image caching strategy for composer portraits
- [ ] **Lazy load screens** - Use `React.lazy()` for experimental/admin screens
- [ ] **Memoize expensive renders** - Add `React.memo` to card components

### Features
- [ ] **Offline mode** - Cache data locally, sync when online
- [ ] **Search history** - Store recent searches
- [ ] **Bookmarks sync** - Sync favorites across devices via Supabase
- [ ] **Dark/Light schedule** - Auto theme based on time of day
- [ ] **Listening streaks** - Gamify daily engagement
- [ ] **Share cards** - Generate shareable composer/term images
- [ ] **Widget support** - iOS/Android home screen widgets for daily term

### UX
- [ ] **Skeleton screens** - Add to all data-loading screens (not just Home)
- [ ] **Pull-to-refresh** - Add to Glossary, Forms, Timeline
- [ ] **Swipe gestures** - Swipe between Kickstart days
- [ ] **Haptic on navigation** - Subtle feedback on tab switches
- [ ] **Onboarding tooltips** - First-use hints for features

### Code Quality
- [ ] **Unit tests** - Add Jest tests for hooks and services
- [ ] **E2E tests** - Maestro or Detox for critical flows
- [ ] **Storybook** - Component documentation
- [ ] **Error tracking** - Sentry integration
- [ ] **Analytics** - Track feature usage (privacy-respecting)

### Architecture
- [ ] **React Query everywhere** - Replace custom hooks with useQuery
- [ ] **Zustand** - Consider lighter state management vs Context
- [ ] **Path aliases in Metro** - Ensure `@/` works in Metro bundler
- [ ] **Feature flags** - Runtime toggles for experimental features
- [ ] **Modular structure** - Group by feature instead of type

### DevEx
- [ ] **Husky pre-commit** - Lint + type-check before commits
- [ ] **Auto-changelog** - Generate from commit messages
- [ ] **PR template** - Standardize pull request format
- [ ] **CI pipeline** - GitHub Actions for tests + EAS builds

---

## Quick Wins (< 1 hour each)

1. Remove dead `isGlass` code paths
2. Standardize all IDs to `string` type
3. Add missing useEffect dependencies
4. Extract magic numbers to constants
5. Consolidate storage utilities
6. Add version check to nav persistence
7. Replace `console.*` with logger utility
```
````
