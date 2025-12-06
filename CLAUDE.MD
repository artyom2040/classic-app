# Claude Code Configuration

This file contains configuration and context for Claude Code integration in this project.

## Project Information

- **Repository**: classic-app (worktree: wonderful-wright)
- **Branch**: wonderful-wright
- **Working Directory**: /Users/artem/.claude-worktrees/classic-app/wonderful-wright

## Development Notes

Add any project-specific notes, guidelines, or context for Claude Code here.

## Recent Activity - Comprehensive Refactoring Complete

### Phase 1 & 2: DRY Improvements & Error Handling
- ✅ Consolidated storage utilities: 4 functions → 1 generic function
- ✅ Centralized date calculations in `dateUtils.ts`
- ✅ Added theme metadata for single source of truth
- ✅ Improved error handling with proper UI feedback in HomeScreenV2
- ✅ Created `useAsyncData` hook for consistent async patterns

### Phase 3a: Audio Abstraction
- ✅ Extracted platform-specific audio logic into `audioPlayer.ts`
- ✅ Created `IAudioPlayer` interface for platform-agnostic playback
- ✅ Simplified AudioContext, removed 50+ lines of platform conditionals

### Phase 3b: Component Styling
- ✅ Enhanced `ThemedCard` with glass/brutal variants
- ✅ Removed inline styling from HomeScreenV2 (~45 lines)
- ✅ Consolidated theme-specific card styling

### Phase 3c & 3d: Service Abstractions
- ✅ Created `navigationService.ts` for centralized navigation
- ✅ Created `notificationService.ts` for toast management
- ✅ Type-safe APIs, eliminated prop drilling

### Phase 3e: Type Standardization
- ✅ Standardized all IDs to string type
- ✅ Removed manual type conversions in DataService
- ✅ Simplified getTermById() logic

### Phase 3f: Error Handling
- ✅ Created `storageUtils.ts` with retry logic
- ✅ Implemented exponential backoff strategy
- ✅ Production-ready AsyncStorage operations

### Phase 4: Performance, Documentation & Architecture Guide
- ✅ Optimized `useFavoriteItem` hook with useMemo/useCallback
- ✅ Added comprehensive JSDoc documentation to all public APIs
- ✅ Created ARCHITECTURE.md with complete design guide
- ✅ Documented data service abstraction and backend flexibility
- ✅ Provided development guidelines and best practices
- ✅ Included testing strategy for future phases

## Architecture Improvements

- **Code Duplication**: Reduced by ~150+ lines across phases 1-3
- **Data Service**: Refactored switch statements (6+ → 1 generic)
- **Audio Context**: Reduced LOC by ~32%, platform logic isolated
- **Theme System**: Single source of truth via metadata
- **Error Handling**: Proper UI feedback and retry logic
- **Type Safety**: Consistent ID types throughout
- **Documentation**: Complete JSDoc coverage on public APIs
- **Performance**: Hook optimization with memoization
- **Maintainability**: Comprehensive ARCHITECTURE.md reference guide

## Guidelines & Patterns

### DRY Principle
- Use generic functions for repetitive patterns
- Example: `markItemViewed()` instead of 4 separate functions

### Error Handling
- Use `useAsyncData` hook for async data loading
- Provide error UI with retry capability
- Use `storageUtils` for AsyncStorage operations

### Styling
- Use `ThemedCard` with variant prop instead of inline styles
- Leverage theme metadata for dynamic styling

### Navigation & Notifications
- Use `navigationService` for screen navigation
- Use `notificationService` for toast messages
- Eliminates context/prop drilling

### Testing
- Services are easily mockable (navigationService, notificationService)
- Utilities are pure functions (dateUtils, storageUtils)
- Abstract layers make unit testing simpler (audioPlayer, dataService)
- See ARCHITECTURE.md for complete testing strategy and future roadmap

## Documentation Files

- **ARCHITECTURE.md**: Complete reference guide for codebase structure, patterns, and design decisions
- **CODE_REVIEW.md**: Initial code review analysis (deprecated, see ARCHITECTURE.md for current patterns)
