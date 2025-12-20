# Test Setup Summary

This document summarizes the test infrastructure created for `@stencil/test-utils`.

## What Was Created

### 1. Test Fixtures (`test-project/`)

#### Basic Stencil Fixture
A complete, minimal Stencil project for testing:

**Location:** `test-project/basic-stencil/`

**Structure:**
```
test-project/basic-stencil/
├── package.json              # Fixture dependencies
├── stencil.config.ts        # Stencil configuration
├── vitest.config.ts         # Uses defineVitestConfig
├── tsconfig.json            # TypeScript config
├── README.md                # Fixture documentation
└── src/
    ├── index.html           # Demo page
    └── components/
        ├── my-button/
        │   ├── my-button.tsx       # Button component
        │   ├── my-button.css       # Styles
        │   ├── my-button.spec.tsx  # Component tests
        │   └── my-button.e2e.tsx   # Browser tests
        └── my-card/
            ├── my-card.tsx         # Card component
            ├── my-card.css         # Styles
            └── my-card.spec.tsx    # Component tests
```

**Components:**
- **my-button**: Button with variants (primary/secondary/danger), sizes, disabled state, click events
- **my-card**: Card with title, elevation levels (0-3), interactive mode, and slots

**Output Targets:**
- `dist` - Standard dist output with lazy loader
- `dist-custom-elements` - Custom elements bundle
- `dist-hydrate-script` - Hydrate/SSR bundle
- `www` - Development server

### 2. Tests (`tests/`)

#### Unit Tests
- **`render.spec.ts`**: Tests for the render function API
  - Basic rendering
  - Props handling
  - Attributes
  - HTML content
  - Lifecycle methods
  - Cleanup/unmount

#### Integration Tests
- **`integration.spec.ts`**: End-to-end tests with real Stencil project
  - Fixture setup validation
  - Build output verification
  - Test execution
  - Pattern matching

### 3. Configuration

#### Vitest Config (`vitest.config.ts`)
Main test configuration for the package:
- Node environment for unit tests
- Coverage with v8
- Test patterns for `tests/**/*.spec.ts`

#### Package Scripts
Added to `package.json`:
```json
{
  "test": "vitest",
  "test:unit": "vitest run tests",
  "test:integration": "pnpm test:integration:build && pnpm test:integration:run",
  "test:integration:build": "cd test-project/basic-stencil && pnpm install && pnpm build",
  "test:integration:run": "vitest run tests/integration.spec.ts",
  "test:coverage": "vitest run --coverage"
}
```

### 4. Documentation

- **`TESTING_GUIDE.md`**: Comprehensive testing guide
  - How to run tests
  - How to write tests
  - How to add fixtures
  - Debugging tips
  - CI/CD guidance

- **`test-project/README.md`**: Fixture documentation
  - Structure explanation
  - Usage instructions
  - Requirements for new fixtures

- **`tests/README.md`**: Test directory guide
  - Test structure
  - Running tests
  - Writing tests

## Test Coverage

### What's Tested

✅ **Component Rendering**
- Creating elements with correct tag names
- Appending to DOM
- Returning proper result structure

✅ **Props & Attributes**
- Setting initial props
- Updating props dynamically
- Setting HTML attributes

✅ **Lifecycle**
- componentOnReady calls
- waitForChanges functionality
- forceUpdate integration

✅ **Cleanup**
- Unmounting components
- Removing from DOM

✅ **Integration**
- Fixture setup
- Build outputs
- Test execution
- Pattern matching

### What Still Needs Testing

⏳ **Browser Environments**
- Playwright integration
- WebdriverIO integration
- Real browser rendering

⏳ **Different Loaders**
- Custom elements loader
- Hydrate loader
- Custom loaders

⏳ **Config Loading**
- Stencil config parsing
- Vitest config merging
- Default values

⏳ **Matchers**
- Custom test matchers
- Assertion helpers

## How to Use

### Run All Tests
```bash
pnpm test
```

### Run Only Unit Tests
```bash
pnpm test:unit
```

### Run Integration Tests
```bash
pnpm test:integration
```

This will:
1. Navigate to `test-project/basic-stencil`
2. Install dependencies
3. Build the Stencil components
4. Run the integration tests

### Run Tests in Watch Mode
```bash
pnpm test --watch
```

### Generate Coverage Report
```bash
pnpm test:coverage
open coverage/index.html
```

## Fixture Development Workflow

### 1. Build Fixture
```bash
cd test-project/basic-stencil
pnpm install
pnpm build
```

### 2. Verify Outputs
```bash
ls -la dist/
# Should see: esm/, components/, hydrate/, www/
```

### 3. Run Fixture Tests
```bash
pnpm test
```

### 4. Test Specific Patterns
```bash
# Run only spec tests
pnpm test --run *.spec

# Run only e2e tests
pnpm test --run *.e2e

# Run specific component tests
pnpm test --run my-button.spec
```

## Example Test File

Here's what a test file in the fixture looks like:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@stencil/test-utils';
import { h } from '@stencil/core';

describe('my-button', () => {
  it('should render with props', async () => {
    const result = await render(
      h('my-button', { variant: 'primary' }, 'Click me')
    );
    
    const shadowRoot = result.root.shadowRoot;
    const button = shadowRoot!.querySelector('button');
    
    expect(button?.classList.contains('button--primary')).toBe(true);
  });
});
```

## Next Steps

1. **Install dependencies**: `pnpm install`
2. **Build package**: `pnpm build`
3. **Run tests**: `pnpm test`
4. **Review failing tests**: Expected since dependencies aren't installed yet
5. **Build fixture**: `pnpm test:integration:build`
6. **Run integration**: `pnpm test:integration:run`

## Key Files Reference

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Main test configuration |
| `tests/render.spec.ts` | Unit tests for render API |
| `tests/integration.spec.ts` | Integration tests |
| `test-project/basic-stencil/` | Test fixture project |
| `test-project/basic-stencil/vitest.config.ts` | Uses defineVitestConfig |
| `test-project/basic-stencil/src/components/` | Sample components |
| `TESTING_GUIDE.md` | Comprehensive testing guide |

## Architecture Overview

```
@stencil/test-utils
│
├── src/                      # Package source
│   ├── config.ts            # defineVitestConfig
│   ├── testing/
│   │   ├── render.ts        # Component rendering
│   │   └── loader.ts        # Component loading
│   └── ...
│
├── tests/                    # Package tests
│   ├── render.spec.ts       # Unit tests
│   └── integration.spec.ts  # Integration tests
│
└── test-project/           # Test projects
    └── basic-stencil/       # Stencil project
        ├── src/components/  # Test components
        │   ├── my-button/
        │   └── my-card/
        └── vitest.config.ts # Uses defineVitestConfig
```

The fixtures use the package's API (`defineVitestConfig`, `render`, etc.) to validate that it works correctly with real Stencil projects.
