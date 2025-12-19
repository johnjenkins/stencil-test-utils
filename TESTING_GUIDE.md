# Testing Guide - @stencil/test-utils

This guide explains how to test the `@stencil/test-utils` package using the test fixtures.

## Overview

The testing strategy consists of:

1. **Unit Tests** - Test individual functions in isolation
2. **Integration Tests** - Test the package with real Stencil projects
3. **Test Fixtures** - Real Stencil projects used for integration testing

## Test Fixtures

### Basic Stencil Fixture

Location: `test-fixtures/basic-stencil/`

A minimal Stencil project with two components:

**Components:**
- `my-button` - Demonstrates props, events, variants
- `my-card` - Demonstrates slots, conditional rendering

**Purpose:**
- Verify `defineVitestConfig` works correctly
- Test component loading with different loaders
- Validate render API
- Test both spec and e2e test patterns

## Running Tests

### Quick Start

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run all tests
pnpm test
```

### Specific Test Suites

```bash
# Unit tests only
pnpm test:unit

# Integration tests only (builds fixture first)
pnpm test:integration

# With coverage
pnpm test:coverage

# Watch mode
pnpm test --watch
```

## Integration Test Workflow

The integration tests follow this workflow:

1. **Build Check** - Verify fixture has required files
2. **Stencil Build** - Build the fixture's Stencil components
3. **Output Validation** - Verify all output targets exist
4. **Test Execution** - Run the fixture's tests
5. **Pattern Validation** - Verify test pattern matching

### Manual Integration Testing

```bash
# 1. Build the fixture
cd test-fixtures/basic-stencil
pnpm install
pnpm build

# 2. Run fixture tests
pnpm test

# 3. Run specific test pattern
pnpm test --run my-button.spec
pnpm test --run my-button.e2e
```

## Writing Tests for the Package

### Unit Tests

Unit tests go in `tests/*.spec.ts` and test individual functions:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '../src/testing/render';

describe('render', () => {
  it('should handle component rendering', async () => {
    // Mock DOM element
    const mockElement = document.createElement('div');
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
    
    // Test
    const result = await render(MyComponent);
    expect(result.root).toBe(mockElement);
  });
});
```

### Integration Tests

Integration tests go in `tests/integration.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

describe('Integration', () => {
  it('should work with Stencil project', () => {
    // Verify fixture setup
    expect(existsSync('./test-fixtures/basic-stencil')).toBe(true);
    
    // Run fixture tests
    execSync('pnpm test --run', { 
      cwd: './test-fixtures/basic-stencil' 
    });
  });
});
```

## Adding New Test Fixtures

To add a new fixture for testing specific scenarios:

1. **Create fixture directory:**
   ```bash
   mkdir -p test-fixtures/my-fixture
   cd test-fixtures/my-fixture
   ```

2. **Initialize Stencil project:**
   ```bash
   npm init stencil component
   ```

3. **Add vitest.config.ts:**
   ```typescript
   import { defineVitestConfig } from '@stencil/test-utils';
   
   export default defineVitestConfig({
     stencilConfig: './stencil.config.ts',
     environment: 'mock-doc',
   });
   ```

4. **Create test files:**
   - `*.spec.tsx` for component tests
   - `*.e2e.tsx` for browser tests

5. **Add to integration tests:**
   ```typescript
   describe('My Fixture', () => {
     it('should handle specific scenario', () => {
       // Test implementation
     });
   });
   ```

## Debugging Tests

### Debug Unit Tests

```bash
# Run specific test file
pnpm test render.spec.ts

# Run with verbose output
pnpm test --reporter=verbose

# Run single test
pnpm test -t "should render component"
```

### Debug Integration Tests

```bash
# Build fixture manually
cd test-fixtures/basic-stencil
pnpm build

# Check outputs
ls -la dist/

# Run fixture tests with verbose output
pnpm test --reporter=verbose
```

### Common Issues

**Issue: Components not loading**
- Solution: Ensure fixture is built (`pnpm build`)
- Check: `dist/` directory exists

**Issue: Type errors in tests**
- Solution: Install `@types/node` in devDependencies
- Check: TypeScript config includes test files

**Issue: Vitest config not found**
- Solution: Ensure `vitest.config.ts` exists in fixture
- Check: Config imports `defineVitestConfig` correctly

## CI/CD Considerations

For CI environments:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: pnpm install

- name: Build package
  run: pnpm build

- name: Run unit tests
  run: pnpm test:unit

- name: Build fixtures
  run: pnpm test:integration:build

- name: Run integration tests
  run: pnpm test:integration:run
```

## Test Coverage

View coverage reports:

```bash
# Generate coverage
pnpm test:coverage

# View HTML report
open coverage/index.html
```

Target coverage:
- Unit tests: >80% coverage
- Integration tests: All major workflows covered
- Critical paths: 100% coverage

## Performance Testing

Monitor test performance:

```bash
# Run with timing
pnpm test --reporter=verbose

# Profile specific test
pnpm test --profile my-test.spec.ts
```

Expected performance:
- Unit tests: <100ms each
- Integration tests: <30s each (including build)
- Full suite: <2min

## Next Steps

1. Add browser environment testing (Playwright/WDIO)
2. Add more complex fixture scenarios
3. Add snapshot testing for outputs
4. Add performance benchmarks
