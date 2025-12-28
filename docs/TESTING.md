# Testing Guide

## Test Data Builders

We use the Builder pattern to construct complex objects for unit tests. This ensures tests are readable, maintainable, and resilient to schema changes.

### Available Builders

- `ComposerBuilder`: Creates `Composer` objects.
- `WeeklyAlbumBuilder`: Creates `WeeklyAlbum` objects.

### Usage Example

```typescript
import { ComposerBuilder } from '../utils/builders';

describe('Composer Logic', () => {
  it('handles baroque composers', () => {
    // Create a custom composer object with fluent interface
    const bach = new ComposerBuilder()
      .withId('bach')
      .withName('J.S. Bach')
      .withPeriod('Baroque')
      .build();

    expect(processComposer(bach)).toBe('processed');
  });
});
```

### Creating New Builders

When adding new domain entities, create a corresponding Builder in `src/__tests__/utils/builders.ts`. Implement the `Builder<T>` interface and ensure `build()` returns a new object instance (shallow copy) to maintain immutability of the product.
