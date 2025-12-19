# Test Fixtures

This directory contains test fixtures for validating `@stencil/test-utils` functionality.

## Structure

### basic-stencil
A basic Stencil project with sample components used for integration testing.

**Components:**
- `my-button` - Button component with variants, sizes, and events
- `my-card` - Card component with slots and elevation

**Test Files:**
- `*.spec.tsx` - Component tests (node DOM environment)
- `*.e2e.tsx` - Browser tests (browser environment)

## Usage

### Building a Fixture

```bash
cd test-fixtures/basic-stencil
pnpm install
pnpm build
```

### Running Fixture Tests

```bash
cd test-fixtures/basic-stencil
pnpm test
```

### Using in Integration Tests

The parent package's integration tests use these fixtures to validate that `@stencil/test-utils` works correctly with real Stencil projects.

## Adding New Fixtures

To add a new test fixture:

1. Create a new directory: `test-fixtures/your-fixture-name`
2. Set up a Stencil project with `stencil.config.ts`
3. Add `vitest.config.ts` using `defineVitestConfig` from `@stencil/test-utils`
4. Create components and tests
5. Add integration tests in `tests/integration.spec.ts`

## Fixture Requirements

Each fixture should:
- Have a valid `stencil.config.ts`
- Use `defineVitestConfig` from `@stencil/test-utils`
- Include at least one component
- Include both `.spec.tsx` and `.e2e.tsx` test files
- Have a README explaining the fixture's purpose
