# Tests

This directory contains tests for `@stencil/test-utils`.

## Test Structure

### Unit Tests (`tests/*.spec.ts`)
Unit tests for individual functions and utilities:
- `render.spec.ts` - Tests for the render function
- `loader.spec.ts` - Tests for component loading
- `config.spec.ts` - Tests for config generation

### Integration Tests (`tests/integration.spec.ts`)
Integration tests that verify the package works with real Stencil projects using the test fixtures.

## Running Tests

```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test --watch
```

## Writing Tests

### Unit Tests
Unit tests should focus on testing individual functions in isolation with mocks:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '../src/testing/render';

describe('render', () => {
  it('should create element', async () => {
    // Test implementation
  });
});
```

### Integration Tests
Integration tests should verify the package works with real Stencil projects:

```typescript
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';

describe('Integration', () => {
  it('should build fixture successfully', () => {
    // Test implementation
  });
});
```

## Test Fixtures

Integration tests use fixtures in `test-project/` directory. See `test-project/README.md` for more information.
