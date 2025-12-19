# @stencil/testing Examples

This directory contains examples of how to use `@stencil/testing` in different scenarios.

## Files

- **`vitest.config.example.ts`** - Example Vitest configuration
- **`my-button.spec.ts`** - Example component test (spec)
- **`my-button.e2e.ts`** - Example browser test (e2e) [Coming Soon]
- **`advanced-usage.ts`** - Advanced testing patterns [Coming Soon]

## Running Examples

These examples are for reference. To use them in your project:

1. Copy `vitest.config.example.ts` to your project root as `vitest.config.ts`
2. Adapt the test patterns to your component structure
3. Run tests with `npx vitest`

## Different Testing Approaches

### Component Tests (`.spec.tsx`)

Fast, lightweight tests that run in a Node environment with DOM emulation:

```typescript
// my-component.spec.tsx
import { render } from '@stencil/testing';
import { MyComponent } from './my-component';

it('renders correctly', async () => {
  const { root } = await render(MyComponent, {
    props: { name: 'World' }
  });
  
  expect(root.textContent).toBe('Hello, World!');
});
```

**Best for:**
- Props and state testing
- Event handling
- Conditional rendering
- Computed properties
- Component lifecycle
- Business logic

### Browser Tests (`.e2e.tsx`)

Real browser tests for visual, interaction, and integration testing:

```typescript
// my-component.e2e.tsx
import { render } from '@stencil/testing';
import { MyComponent } from './my-component';

it('is keyboard accessible', async () => {
  const { root } = await render(MyComponent);
  
  root.focus();
  expect(document.activeElement).toBe(root);
  
  // Test keyboard interaction
  root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
});
```

**Best for:**
- Shadow DOM interactions
- CSS and styling
- Focus management
- Keyboard navigation
- Mouse interactions
- Visual appearance
- Cross-browser compatibility

## Environment Comparison

| Feature | mock-doc | jsdom | happy-dom | browser |
|---------|----------|-------|-----------|---------|
| Speed | ⚡️ Fastest | 🐇 Fast | 🐇 Fast | 🐢 Slow |
| Accuracy | ⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ |
| Shadow DOM | ✅ | ✅ | ✅ | ✅ |
| Real CSS | ❌ | ⚠️ Limited | ⚠️ Limited | ✅ |
| Visual Testing | ❌ | ❌ | ❌ | ✅ |
| Browser APIs | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited | ✅ |

## Loader Comparison

| Loader | Use Case | Output Target |
|--------|----------|---------------|
| `lazy` | Default, production-like | `dist` (ESM) |
| `custom-elements` | Tree-shakeable | `dist-custom-elements` |
| `dist` | Direct imports | Any dist output |
| `hydrate` | SSR/prerendering | `dist-hydrate-script` |

## Tips

1. **Start with spec tests** - They're faster and easier to write
2. **Use mock-doc** - It's built for Stencil and very fast
3. **E2E for visual/interaction** - Only use browser tests when needed
4. **Build first** - Always build your Stencil project before testing
5. **Watch mode** - Use `--watch` for TDD workflow

## More Examples Coming Soon

- Testing with slots
- Testing form components
- Testing async components
- Testing with Context API
- Testing with state management
- Mocking external dependencies
- Snapshot testing
- Visual regression testing
