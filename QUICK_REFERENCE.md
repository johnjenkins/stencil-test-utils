# @stencil/test-utils - Quick Reference

## Installation

```bash
npm install --save-dev @stencil/test-utils vitest
```

## Setup

**vitest.config.ts**
```typescript
import { defineVitestConfig } from '@stencil/test-utils';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  environment: 'mock-doc',
  patterns: {
    spec: '**/*.spec.tsx',
    e2e: '**/*.e2e.tsx'
  }
});
```

## Basic Testing

```typescript
import { render } from '@stencil/test-utils';
import { MyComponent } from './my-component';

// Render component
const { root } = await render(MyComponent, {
  props: { name: 'World' }
});

// Assert
expect(root.textContent).toBe('Hello, World!');
```

## API Cheat Sheet

### render()
```typescript
const { root, waitForChanges, setProps, unmount, instance } = await render(
  MyComponent,
  {
    props: { ... },
    slots: { default: '...' },
    html: '...',
    attributes: { ... },
    waitForLoad: true
  }
);
```

### Custom Matchers
```typescript
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('disabled');
expect(element).toHaveProperty('value', 'test');
expect(element).toHaveTextContent('Hello');
expect(element).toBeVisible();
expect(element).toHaveShadowRoot();
```

### newPage()
```typescript
const page = await newPage();
await page.setContent('<my-component></my-component>');
const el = page.find('my-component');
```

## CLI Commands

```bash
# Run all tests
npx vitest

# Run only spec tests
npx stencil-test --spec

# Run only e2e tests
npx stencil-test --e2e

# Watch mode
npx vitest --watch
```

## Environments

- **mock-doc** (default) - Fastest, Stencil's built-in DOM
- **jsdom** - Popular Node DOM implementation
- **happy-dom** - Lighter alternative to jsdom
- **node** - Minimal, no DOM

## Loaders

- **lazy** (default) - Production-like lazy loading
- **custom-elements** - Tree-shakeable custom elements
- **dist** - Direct dist imports
- **hydrate** - SSR/prerendering

## Common Patterns

### Test with props
```typescript
const { root } = await render(MyComponent, {
  props: { disabled: true, value: 'test' }
});
```

### Test with slots
```typescript
const { root } = await render(MyComponent, {
  slots: { default: '<p>Content</p>' }
});
```

### Test prop updates
```typescript
const { root, setProps } = await render(MyComponent);
await setProps({ name: 'New' });
expect(root.textContent).toBe('Hello, New!');
```

### Test events
```typescript
const { root } = await render(MyComponent);
let clicked = false;
root.addEventListener('click', () => clicked = true);
root.click();
expect(clicked).toBe(true);
```

### Test lifecycle
```typescript
const { root, waitForChanges } = await render(MyComponent);
// Make changes
await waitForChanges();
// Assert after lifecycle
```

## Package Scripts

```bash
npm run build          # Build package
npm run dev            # Watch mode
npm run test           # Run tests
```

## Tips

✅ **DO:**
- Build your Stencil project before testing
- Use mock-doc for fastest tests
- Clean up with `unmount()` when needed
- Use `waitForChanges()` after updates

❌ **DON'T:**
- Forget to await `render()`
- Test implementation details
- Rely on timing instead of `waitForChanges()`
- Mix spec and e2e in same file

## Getting Help

- Check examples in `examples/` directory
- Read full documentation in `README.md`
- See development guide in `DEVELOPMENT.md`
- Review changelog in `CHANGELOG.md`
