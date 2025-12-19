# @stencil/testing

First-class testing utilities for Stencil design systems, powered by Vitest.

## Features

- 🚀 **Seamless Integration** - Works with your existing Stencil configuration
- 🎯 **Multiple Environments** - Support for node, jsdom, happy-dom, and Stencil's mock-doc
- 📦 **Flexible Loaders** - Use any Stencil output target (lazy, custom-elements, dist, hydrate)
- 🔧 **Easy Configuration** - Pre-configured Vitest setup with sensible defaults
- 🧪 **Component Testing** - Focus on testing individual components with nested children
- 📝 **Unified API** - Consistent testing experience across different environments

## Installation

```bash
npm install --save-dev @stencil/testing vitest
```

## Quick Start

### 1. Create a `vitest.config.ts`

```typescript
import { defineVitestConfig } from '@stencil/testing';

export default defineVitestConfig({
  // Path to your Stencil config (optional)
  stencilConfig: './stencil.config.ts',
  
  // Test environment (default: 'mock-doc')
  environment: 'mock-doc',
  
  // Test file patterns
  patterns: {
    spec: '**/*.spec.tsx',  // Component/unit tests
    e2e: '**/*.e2e.tsx'     // Browser tests
  },
  
  // Loader configuration
  loader: {
    type: 'lazy',  // 'lazy' | 'custom-elements' | 'dist' | 'hydrate'
    modulePath: './dist/esm/loader.js'  // Optional custom path
  }
});
```

### 2. Write Your First Test

```typescript
// src/components/my-component/my-component.spec.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@stencil/testing';
import { MyComponent } from './my-component';

describe('my-component', () => {
  it('renders with props', async () => {
    const { root, waitForChanges } = await render(MyComponent, {
      props: { name: 'World' }
    });
    
    expect(root.textContent).toContain('Hello, World!');
  });

  it('updates on prop change', async () => {
    const { root, setProps } = await render(MyComponent, {
      props: { name: 'World' }
    });
    
    await setProps({ name: 'Stencil' });
    
    expect(root.textContent).toContain('Hello, Stencil!');
  });
});
```

### 3. Run Tests

```bash
# Run all tests
npx vitest

# Run only spec tests
npx vitest run --testNamePattern="spec"

# Run only e2e tests
npx vitest run --testNamePattern="e2e"

# Watch mode
npx vitest --watch
```

## Configuration

### Test Environments

Choose the right environment for your tests:

- **`mock-doc`** (default) - Stencil's built-in DOM implementation, fastest and most compatible
- **`jsdom`** - Popular DOM implementation for Node.js
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
import { setupLoader } from '@stencil/testing';

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
import { defineVitestConfig } from '@stencil/testing';

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
