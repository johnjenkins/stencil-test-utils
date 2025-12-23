# @johnjenkins/stencil-vitest

First-class testing utilities for Stencil components, powered by Vitest.

## Installation

```bash
npm i --save-dev @johnjenkins/stencil-vitest vitest
```

For browser testing, also install:

```bash
npm i -D @vitest/browser-preview
```

or

```bash
npm i -D @vitest/browser-webdriverio
```

## Quick Start

### 1. Create `vitest.config.ts`

Use `defineVitestConfig` to create your Vitest configuration with Stencil enhancements:

```typescript
import { defineVitestConfig } from '@johnjenkins/stencil-vitest/config';
import { playwright } from '@vitest/browser-playwright';
// or import { wdio } from '@vitest/browser-webdriverio';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      // Unit tests - node environment for functions / logic
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.{ts,tsx}'],
          environment: 'node',
        },
      },

      // Spec tests - via a node DOM of your choice
      {
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
          // environmentOptions: {
          //   stencil: {
          //     domEnvironment: 'happy-dom' | 'jsdom' | 'mock-doc' (default)
          //                      ^^ Make sure to install relevant packages
          //   },
          // },
        },
      },

      // Browser tests - real browsers e.g. via Playwright
      {
        test: {
          name: 'browser',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest-setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
```

[refer Vitest documentation for all configuration options](https://vitest.dev/config/)

### 2. Load your components via `vitest-setup.ts`

Load your components:

```typescript
// Load Stencil components, adjusting according to your build output of choice*
// (*Bear in mind, you may need `buildDist: true` (in your stencil.config)
// or `--prod` to use an output other than the browser lazy-loader)
await import('./dist/test-components/test-components.esm.js');

export {};
```

### 3. Write Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, h } from '@johnjenkins/stencil-vitest';

describe('my-button', () => {
  it('renders with text', async () => {
    const { root } = await render(<my-button label="Click me" />);
    expect(root).toHaveTextContent('Click me');
  });

  it('responds to clicks', async () => {
    const { root } = await render(<my-button label="Click" />);
    root.click();
    await root.waitForChanges();
    expect(root).toHaveClass('clicked');
  });
});
```

### 4. Run tests

```json
// package.json
{
  "scripts": {
    "test": "stencil-test",
    "test:watch": "stencil-test --watch",
    "test:e2e": "stencil-test --project browser",
    "test:spec": "stencil-test --project spec"
  }
}
```

## API

### Rendering

#### `render(VNode)`

Render a component for testing.

```tsx
import { render, h } from '@johnjenkins/stencil-vitest';
const { root, waitForChanges } = await render(<my-component name="World" />);

// Access the element
expect(root.textContent).toContain('World');

// Update props
root.name = 'Stencil';
await waitForChanges();
```

### Available matchers:

```typescript
// DOM assertions
expect(element).toHaveClass('active');
expect(element).toHaveClasses(['active', 'primary']);
expect(element).toMatchClasses(['active']); // Partial match
expect(element).toHaveAttribute('aria-label', 'Close');
expect(element).toEqualAttribute('type', 'button');
expect(element).toEqualAttributes({ type: 'button', disabled: true });
expect(element).toHaveProperty('value', 'test');
expect(element).toHaveTextContent('Hello World');
expect(element).toEqualText('Exact text match');
expect(element).toBeVisible();

// Shadow DOM
expect(element).toHaveShadowRoot();
expect(element).toEqualHtml('<div>Expected HTML</div>');
expect(element).toEqualLightHtml('<div>Light DOM only</div>');
```

### Event Testing

Test custom events emitted by your components:

```typescript
const { root } = await render(<my-button />);

// Spy on events
const clickSpy = root.spyOnEvent('buttonClick');
const changeSpy = root.spyOnEvent('valueChange');

// Trigger events
root.click();
await root.waitForChanges();

// Assert events were emitted
expect(clickSpy).toHaveReceivedEvent();
expect(clickSpy).toHaveReceivedEventTimes(1);
expect(clickSpy).toHaveReceivedEventDetail({ buttonId: 'my-button' });

// Access event data
expect(clickSpy.events).toHaveLength(1);
expect(clickSpy.firstEvent?.detail).toEqual({ buttonId: 'my-button' });
expect(clickSpy.lastEvent?.detail).toEqual({ buttonId: 'my-button' });
```

## Snapshots

The package includes a custom snapshot serializer for Stencil components that properly handles shadow DOM:

```typescript
import { render, h } from '@johnjenkins/stencil-vitest';
...
const { root } = await render(<my-component />);
expect(root).toMatchSnapshot();
```

**Snapshot output example:**

```html
<my-component>
  <mock:shadow-root>
    <button class="primary">
      <slot />
    </button>
  </mock:shadow-root>
  Click me
</my-component>
```

## Screenshot Testing

Browser tests can include screenshot comparisons using Vitest's screenshot capabilities:

```tsx
import { render, h } from '@johnjenkins/stencil-vitest';
...
const { root } = await render(<my-button variant="primary">Primary Button</my-button>);
await expect(root).toMatchScreenshot();
```

Refer to Vitest's [screenshot testing documentation](https://vitest.dev/guide/snapshot.html#visual-snapshots) for more details.

## CLI

The `stencil-test` CLI wraps both Stencil builds with Vitest testing.

### Add to package.json

```json
{
  "scripts": {
    "test": "stencil-test",
    "test:watch": "stencil-test --watch"
  }
}
```

### Usage

```bash
# Build once, test once
stencil-test

# Watch mode (rebuilds on component changes, interactive Vitest)
stencil-test --watch

# Watch mode with dev server
stencil-test --watch --serve

# Production build before testing
stencil-test --prod

# Pass arguments to Vitest
stencil-test --watch --coverage

# Test specific files
stencil-test button.spec.ts

# Test specific project
stencil-test --project browser
```

### CLI Options

The `stencil-test` CLI supports most of Stencil's CLI options and all of Vitest CLI options

- For full Stencil CLI options, see [Stencil CLI docs](https://stenciljs.com/docs/cli).
- For full Vitest CLI options, see [Vitest CLI docs](https://vitest.dev/guide/cli.html).

## License

MIT

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.
