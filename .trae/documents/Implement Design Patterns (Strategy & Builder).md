The Code Review Report (`CODE_REVIEW_REPORT.md`) recommends the **Strategy Pattern** (for `DataService`) and the **Compound Component Pattern** (for UI components), but does not explicitly recommend the **Builder Pattern**.

However, to align with your request while respecting the report's intent, I will implement the **Strategy Pattern** for `DataService` (as this is the architectural change documented) and introduce a **Builder Pattern** for test data generation (`ComposerBuilder`), which aligns with the "Additional Features" and "Test Coverage" sections of the report.

### Plan: Implement Design Pattern Recommendations

#### 1. Refactor `DataService` (Strategy Pattern)
*   **Target**: `src/services/dataService.ts`
*   **Goal**: Remove repetitive switch statements and separate data source logic.
*   **Implementation**:
    *   Create `src/services/data/providers/DataProvider.ts` interface.
    *   Create `src/services/data/providers/LocalProvider.ts` (moving JSON logic).
    *   Create `src/services/data/providers/SupabaseProvider.ts` (moving Supabase logic).
    *   Refactor `DataService` to accept a `DataProvider` in its constructor (Dependency Injection).

#### 2. Implement Builder Pattern (Test Data Factories)
*   **Target**: `src/__tests__/utils/builders.ts` (New File)
*   **Goal**: Create fluent builders for complex objects like `Composer` and `WeeklyAlbum` to improve test readability and maintainability.
*   **Implementation**:
    *   Create `ComposerBuilder` with fluent methods (`withName`, `withPeriod`, `build`).
    *   Create `WeeklyAlbumBuilder`.
    *   Ensure immutability (each method returns a new Builder instance or modifies internal state safely).

#### 3. Update Tests & Verification
*   **Target**: `src/__tests__/services/dataService.test.ts`
*   **Goal**: Verify the new architecture works and is backward compatible.
*   **Implementation**:
    *   Update existing tests to use the new `ComposerBuilder` for creating mock data.
    *   Add tests for `LocalProvider` and `SupabaseProvider` individually.
    *   Run all tests to ensure no regressions.

This plan fulfills the "code quality standards" and "SOLID principles" from the report while bridging the gap between the specific prompt (Builder) and the actual report content (Strategy).
