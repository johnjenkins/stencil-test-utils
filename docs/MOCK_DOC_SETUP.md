# Mock-Doc Environment Setup

This package automatically configures Stencil's `mock-doc` environment for testing in Node.js.

## How it Works

When you set `environment: 'mock-doc'` in your test configuration, the package automatically:

1. ✅ Sets up global DOM APIs (`window`, `document`, `HTMLElement`, etc.)
2. ✅ Configures `requestAnimationFrame` and related APIs
3. ✅ Provides a mock browser environment using Stencil's mock-doc

## Usage

### Basic Setup

In your `vitest.config.ts`:

```typescript
import { defineVitestConfig } from '@stencil/test-utils';

export default defineVitestConfig({
  environment: 'mock-doc',  // This automatically loads the mock-doc setup
});
```

### Loading Your Components

Create a `vitest-setup.ts` file to load your specific components:

```typescript
import { win } from '@stencil/test-utils/mock-doc-setup';

// Load your Stencil components
const { defineCustomElements } = await import('./dist/esm/loader.js');
await defineCustomElements(win);
```

Then reference it in your config:

```typescript
export default defineVitestConfig({
  environment: 'mock-doc',
  vitest: {
    test: {
      setupFiles: ['./vitest-setup.ts'],
    },
  },
});
```

### Writing Tests

Tests work just like they would in a browser:

```typescript
import { render } from '@stencil/test-utils';

it('should render', async () => {
  const result = await render(<my-component />);
  expect(result.root).toBeTruthy();
  
  // Access shadow DOM
  const shadowRoot = result.root.shadowRoot;
  const button = shadowRoot!.querySelector('button');
  expect(button).toBeTruthy();
});
```

## What's Provided

The mock-doc setup provides:

- `window` - Mock window object
- `document` - Mock document object  
- DOM APIs: `HTMLElement`, `Element`, `Node`, `DocumentFragment`, `CustomEvent`, `Event`
- Async APIs: `requestAnimationFrame`, `cancelAnimationFrame`
- Proper `document.baseURI` for URL resolution

## Exports

You can also import the mock window/document directly:

```typescript
import { win, doc } from '@stencil/test-utils/mock-doc-setup';
```

This is useful for advanced setup or custom test utilities.
