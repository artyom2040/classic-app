# Comprehensive Code Review Report

## 1. Code Quality Analysis

### Overall Structure & Organization
- **Strengths**: The project follows a clear, standard React Native architecture with well-defined directories (`components`, `screens`, `services`, `hooks`, `context`). The separation of concerns is generally good, making the codebase navigable.
- **Weaknesses**: 
  - **Large Components**: `HomeScreenV2.tsx` (exported as `HomeScreen`) is monolithic (over 300 lines) and mixes complex data retrieval logic with UI rendering.
  - **Repetitive Logic**: `DataService.ts` contains repetitive `switch` statements for every data fetching method to handle different sources (local, supabase, etc.).
  - **Leaky Abstractions**: `AuthContext.tsx` contains direct side-effects (`initializeGoogleSignIn`) at the top level, which can hinder testing and isn't ideal for modularity.

### Coding Style & Best Practices
- **Strengths**: 
  - Strong TypeScript usage with well-defined interfaces.
  - Modern React patterns (Hooks, Context).
  - Consistent naming conventions.
  - Good use of path aliases (`@/`, `@components/`).
- **Weaknesses**:
  - **Inline Styles**: Some components (e.g., `HomeScreen`) rely heavily on inline styles or complex `StyleSheet` definitions within the component file, cluttering the logic.
  - **Magic Strings**: `DataService` uses string literals for table names and keys, increasing the risk of typos.
  - **Any/Unknown Casting**: `DataService` casts `unknown` to types without runtime validation (e.g., `as Composer[]`), which defeats TypeScript's safety at the I/O boundary.

### Performance & Algorithms
- **Bottlenecks**:
  - **Render Performance**: `HomeScreen` uses `ScrollView` to render potentially long lists (composers, eras). As content grows, this will cause performance issues. `FlatList` or `SectionList` should be used for virtualized rendering.
  - **Premature Optimization**: The custom `useExpensiveCalculation` hook is used frequently for simple array lookups (e.g., `weeklyAlbum` selection). `useMemo` has overhead; wrapping simple O(1) or O(n) operations on small arrays might be slower than just executing them, and it adds unnecessary code complexity.
  - **Data Fetching**: The `DataService` implements a basic in-memory cache with a TTL but lacks granular invalidation. If data changes on the server, the user might see stale data for 5 minutes.

## 2. Improvement Opportunities

### Critical Improvements
1.  **Refactor `DataService`**: Remove repetitive `switch` statements.
2.  **Optimize `HomeScreen`**: Convert to `FlatList` or `SectionList` and break into smaller sub-components.
3.  **Fix Auth Side-Effects**: Move global side-effects in `AuthContext` into `useEffect` or a dedicated initialization service.

### Recommended Design Patterns
-   **Strategy Pattern**: For `DataService`, instead of a switch statement in every method, define a `IDataProvider` interface and have `LocalProvider`, `SupabaseProvider`, etc., implement it. The service then just delegates to the configured provider.
-   **Compound Component Pattern**: For complex UI elements like `ListCard` or `TimelineSlider`, to allow more flexible composition.

### Documentation & Testing
-   **Documentation**: `docs/` is present but could be improved with a "Getting Started" guide that explicitly mentions environment variable requirements for Supabase/Auth.
-   **Test Coverage**: `DataService` tests rely on mocks. Integration tests that verify the structure of the *actual* JSON files (schema validation) are missing. If a JSON file has a typo, the app will crash at runtime.

## 3. Code Rearrangement Recommendations

1.  **`src/screens/Home/`**: 
    -   Extract sections of `HomeScreenV2` into separate files: `HomeHeader.tsx`, `KickstartSection.tsx`, `DailyMixSection.tsx`.
    -   Move `HomeScreenV2.tsx` to `src/screens/Home/index.tsx` to replace the existing index or standardise naming.
2.  **`src/services/data/`**:
    -   Create `src/services/data/providers/` and move `LocalProvider`, `SupabaseProvider` there.
    -   Move `DataService.ts` to `src/services/data/index.ts`.
3.  **`src/types/`**:
    -   Ensure `User` and `Profile` types are consistent with the database schema. The `users` (legacy) and `profiles` (new) tables in Supabase suggest a migration in progress that needs to be finalized.

## 4. Additional Features

1.  **Runtime Schema Validation**: Use a library like `zod` to validate JSON data and API responses at runtime. This ensures that `as Composer[]` is actually safe.
2.  **Offline Support**: Enhance `DataService` to persist the cache to `AsyncStorage`. This allows the app to work offline even if the in-memory cache is lost (app restart).
3.  **Error Boundary Logging**: Integrate `ErrorBoundary` with a remote logging service (or Supabase) to track crashes in production.

## 5. Detailed Implementation Recommendations

### A. Refactoring `DataService` (Strategy Pattern)

**Current Issue:**
```typescript
async getComposers() {
  switch (this.config.type) {
    case 'local': return ...;
    case 'supabase': return ...;
    // ... repeated for every method
  }
}
```

**Recommended Approach:**
Define an interface and implementations:

```typescript
// src/services/providers/DataProvider.ts
export interface DataProvider {
  getComposers(): Promise<Composer[]>;
  getPeriods(): Promise<Period[]>;
  // ...
}

// src/services/providers/LocalProvider.ts
export class LocalProvider implements DataProvider {
  async getComposers() { return composersData.composers; }
  // ...
}

// src/services/DataService.ts
class DataService {
  private provider: DataProvider;
  
  constructor(config: Config) {
    this.provider = config.type === 'local' ? new LocalProvider() : new SupabaseProvider();
  }

  async getComposers() {
    return this.cache('composers', () => this.provider.getComposers());
  }
}
```

### B. Optimizing `HomeScreen` Rendering

**Current Issue:**
`ScrollView` renders everything at once.

**Recommended Approach:**
Use `SectionList` for mixed content types.

```typescript
const sections = [
  { type: 'header', data: [{}] },
  { type: 'pills', data: [{}] },
  { type: 'kickstart', data: [progress] },
  { type: 'timeline', data: [eras] },
  // ...
];

return (
  <SectionList
    sections={sections}
    renderItem={({ item, section }) => {
      switch(section.type) {
        case 'kickstart': return <KickstartHeroCard ... />;
        // ...
      }
    }}
  />
);
```

### C. Runtime Validation (Zod)

**Recommended Approach:**

```typescript
import { z } from 'zod';

const ComposerSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ...
});

async getComposers() {
  const data = await fetch(...);
  return ComposerSchema.array().parse(data); // Throws nice error if data is bad
}
```
