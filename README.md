# @stencil/test-utils

First-class testing utilities for Stencil design systems, powered by Vitest.

## Features

- 🚀 **Seamless Integration** - Works with your existing Stencil configuration
- 🎯 **Multiple Environments** - Support for mock-doc (Node) and browser testing with Playwright
- 📦 **Flexible Loaders** - Use any Stencil output target (lazy, custom-elements, dist, hydrate)
- 🔧 **Easy Configuration** - Uses standard Vitest configuration with helpful Stencil defaults
- 🧪 **Component Testing** - Focus on testing individual components with nested children
- 📝 **Unified API** - Consistent testing experience across different environments
- ✨ **Native Vitest Structure** - Works with Vitest's standard project configuration

## Installation

```bash
npm install --save-dev @stencil/test-utils @stencil/core vitest @vitest/browser playwright
```

## Quick Start

### 1. Create a `vitest.config.ts`

Use standard Vitest configuration with Stencil enhancements:

```typescript
import { defineVitestConfig } from '@stencil/test-utils/config';

export default defineVitestConfig({
  // Optional: Path to your Stencil config
  stencilConfig: './stencil.config.ts',
  
  test: {
    // Define multiple test environments using Vitest's native project structure
    projects: [
      {
        test: {
          name: 'unit',
          include: ['**/*.spec.tsx'],
          environment: 'node',
          setupFiles: ['@stencil/test-utils/mock-doc-setup'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['**/*.e2e.tsx'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [
              { browser: 'chromium' }
            ],
          },
        },
      },
    ],
  },
});
```

### 2. Write Your First Test

**Unit test with mock-doc:**

```typescript
// src/components/my-component/my-component.spec.tsx
import { describe, it, expect } from 'vitest';
import { h } from '@stencil/core';
import { render } from '@stencil/test-utils';

describe('my-component', () => {
  it('renders with props', async () => {
    const { root } = await render(<my-component name="World" />);
    expect(root.textContent).toContain('Hello, World!');
  });

  it('updates on prop change', async () => {
    const { root, setProps } = await render(<my-component name="World" />);
    await setProps({ name: 'Stencil' });
    expect(root.textContent).toContain('Hello, Stencil!');
  });
});
```

**Browser test:**

```typescript
// src/components/my-component/my-component.e2e.tsx
import { expect, test } from 'vitest';
import { render } from '@stencil/test-utils';
import { h } from '@stencil/core';

test('renders in real browser', async () => {
  const { root } = await render(<my-component name="Browser" />);
  expect(root.textContent).toContain('Hello, Browser!');
});
```

### 3. Run Tests

```bash
# Run all tests (both unit and browser)
npx vitest

# Run only unit tests
npx vitest --project unit

# Run only browser tests
npx vitest --project browser

# Watch mode
npx vitest --watch
```

## Configuration

### Using Standard Vitest Projects

The configuration uses Vitest's native project structure. The helper automatically adds:

- JSX configuration (`jsxFactory: 'h'`, `jsxFragment: 'Fragment'`)
- Default excludes (`node_modules`, `dist`, `build`, `.stencil`)
- Global test APIs (`describe`, `it`, `expect`)

### Test Environments

Choose the right environment for your tests:

- **`node` with mock-doc** - Stencil's built-in DOM implementation, fastest and most compatible
- **`browser`** - Real browser testing with Playwright (chromium, firefox, webkit)
- **`happy-dom`** - Lighter, faster alternative to jsdom
- **`node`** - Minimal Node.js environment (no DOM)

### Test Patterns

Organize your tests with custom patterns:

```typescript
defineVitestConfig({
  patterns: {
    spec: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.tsx'],
    e2e: ['**/*.e2e.ts', '**/*.e2e.tsx']
  }
});
```

Typical file structure:

```
src/components/my-component/
  ├── my-component.tsx       # Component implementation
  ├── my-component.spec.tsx  # Unit/component tests (node/DOM)
  └── my-component.e2e.tsx   # Browser tests (playwright/webdriverio)
```

### Loader Configuration

Configure how Stencil components are loaded in tests:

```typescript
defineVitestConfig({
  loader: {
    // Lazy loader (default) - uses dist/esm output
    type: 'lazy',
    modulePath: './dist/esm/loader.js',
    
    // Or use custom elements bundle
    type: 'custom-elements',
    modulePath: './dist/components/index.js',
    
    // Or use dist output
    type: 'dist',
    
    // Or use hydrate for SSR testing
    type: 'hydrate'
  }
});
```

## API Reference

### `render<T>(component, options)`

Render a component for testing.

```typescript
const { root, waitForChanges, setProps, unmount, instance } = await render(
  MyComponent,
  {
    // Component props
    props: { name: 'World', count: 42 },
    
    // Slot content
    slots: {
      default: '<p>Default slot content</p>',
      header: '<h1>Header slot</h1>'
    },
    
    // Inner HTML
    html: '<span>Inner content</span>',
    
    // HTML attributes
    attributes: { class: 'custom-class', 'data-test': 'true' },
    
    // Wait for component to load (default: true)
    waitForLoad: true
  }
);

// Access the rendered element
expect(root.textContent).toBe('...');

// Wait for component updates
await waitForChanges();

// Update props
await setProps({ name: 'Stencil' });

// Clean up
unmount();
```

### `newPage()`

Create a clean page for testing.

```typescript
const page = await newPage();

// Set HTML content
await page.setContent('<my-component></my-component>');

// Query elements
const element = page.find('my-component');
const elements = page.findAll('.item');

// Wait for changes
await page.waitForChanges();
```

### `setupLoader(config)`

Manually setup the component loader.

```typescript
import { setupLoader } from '@stencil/test-utils';

// In a setup file or before tests
await setupLoader({
  type: 'lazy',
  modulePath: './dist/esm/loader.js'
});
```

## Advanced Usage

### Custom Vitest Configuration

Merge additional Vitest configuration:

```typescript
import { defineVitestConfig } from '@stencil/test-utils';

export default defineVitestConfig(
  {
    stencilConfig: './stencil.config.ts',
    environment: 'mock-doc'
  },
  {
    // Additional Vitest config
    test: {
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'lcov']
      },
      testTimeout: 10000
    }
  }
);
```

### Browser Testing (Coming Soon)

Support for browser-based testing with Playwright and WebdriverIO:

```typescript
defineVitestConfig({
  browserEnvironment: 'playwright',
  patterns: {
    e2e: '**/*.e2e.tsx'
  }
});
```

### CLI Helpers (Coming Soon)

```bash
# Run only spec tests
npx stencil-test --spec

# Run only e2e tests
npx stencil-test --e2e

# Watch mode
npx stencil-test --watch
```

## Best Practices

1. **Build Before Testing** - Make sure to build your Stencil project before running tests
2. **Use mock-doc** - For fastest tests, use Stencil's mock-doc environment
3. **Separate Concerns** - Use `.spec.tsx` for component tests, `.e2e.tsx` for browser tests
4. **Clean Up** - Always call `unmount()` or let the test framework clean up
5. **Wait for Changes** - Use `waitForChanges()` after prop updates or DOM manipulations

## Troubleshooting

### Components Not Loading

Make sure your project is built:

```bash
npm run build
```

### Import Errors

Check that your loader path is correct:

```typescript
loader: {
  type: 'lazy',
  modulePath: './dist/esm/loader.js'  // Verify this path exists
}
```

### Mock-doc Issues

If mock-doc isn't working, try using jsdom:

```bash
npm install --save-dev jsdom
```

```typescript
defineVitestConfig({
  environment: 'jsdom'
});
```

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting a PR.
