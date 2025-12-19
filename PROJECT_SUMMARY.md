# @stencil/testing - Project Summary

## Overview

`@stencil/testing` is a comprehensive testing package for Stencil design systems, providing first-class integration with Vitest. It enables seamless component testing with support for multiple environments and testing approaches.

## Project Status

**Status:** 🚧 Early Development / Proof of Concept

This package has been scaffolded with the core structure and APIs designed. It is not yet functional and needs:
- Dependencies to be installed (vitest)
- TypeScript compilation
- Integration testing with actual Stencil projects
- Refinement of APIs based on real-world usage

## What's Been Created

### Core Structure

```
packages/testing/
├── src/
│   ├── config.ts              # Vitest config helper
│   ├── index.ts               # Main exports
│   ├── setup.ts               # Test environment setup
│   ├── types.ts               # TypeScript definitions
│   ├── testing/
│   │   ├── render.ts          # Component rendering
│   │   ├── loader.ts          # Component loaders
│   │   └── matchers.ts        # Custom matchers
│   └── utils/
│       ├── config-loader.ts   # Stencil config loading
│       └── vitest-config.ts   # Vitest config generation
├── examples/                   # Usage examples
├── bin/                        # CLI tools
├── package.json
├── tsconfig.json
└── README.md
```

### Key Features Designed

1. **Configuration**
   - `defineVitestConfig()` - Easy Vitest setup using Stencil config
   - Support for multiple test environments (mock-doc, jsdom, happy-dom)
   - Test pattern configuration (spec vs e2e)

2. **Component Testing**
   - `render()` - Render components with props, slots, and attributes
   - `newPage()` - Page-level testing helper
   - `waitForChanges()` - Wait for component updates
   - `setProps()` - Update component props

3. **Loaders**
   - Support for lazy loader (dist/esm)
   - Support for custom-elements
   - Support for dist and hydrate outputs
   - Configurable loader paths

4. **Custom Matchers**
   - `toHaveClass()` - Check element classes
   - `toHaveAttribute()` - Check attributes
   - `toHaveProperty()` - Check properties
   - `toHaveTextContent()` - Check text content
   - `toBeVisible()` - Check visibility
   - `toHaveShadowRoot()` - Check shadow DOM

5. **CLI Helper**
   - `stencil-test --spec` - Run only component tests
   - `stencil-test --e2e` - Run only browser tests
   - `stencil-test --watch` - Watch mode

## Design Philosophy

1. **Zero Config by Default** - Works with Stencil's defaults
2. **Progressive Enhancement** - Start simple, add complexity as needed
3. **Fast by Default** - Use mock-doc and lazy loading
4. **Unified API** - Similar testing experience across environments
5. **Type-Safe** - Full TypeScript support throughout

## Next Steps

### Immediate (Before Use)

1. **Install Dependencies**
   ```bash
   cd packages/testing
   npm install vitest typescript
   ```

2. **Build the Package**
   ```bash
   npm run build
   ```

3. **Test with Real Project**
   - Link to a Stencil project
   - Try the APIs
   - Iterate on design

### Short Term

- [ ] Fix TypeScript compilation errors
- [ ] Test with actual Stencil components
- [ ] Refine loader implementations
- [ ] Add integration tests
- [ ] Document edge cases

### Medium Term

- [ ] Add browser testing (Playwright)
- [ ] Add WebdriverIO support
- [ ] Improve error messages
- [ ] Add more examples
- [ ] Performance optimization

### Long Term

- [ ] Visual regression testing
- [ ] Accessibility testing helpers
- [ ] SSR/hydration testing
- [ ] Integration with Stencil's watch mode
- [ ] Documentation site

## Usage Example

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@stencil/testing';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  environment: 'mock-doc',
  patterns: {
    spec: '**/*.spec.tsx',
    e2e: '**/*.e2e.tsx'
  },
  loader: {
    type: 'lazy'
  }
});
```

```typescript
// my-component.spec.tsx
import { render } from '@stencil/testing';
import { MyComponent } from './my-component';

it('renders correctly', async () => {
  const { root } = await render(MyComponent, {
    props: { name: 'World' }
  });
  
  expect(root).toHaveTextContent('Hello, World!');
});
```

## Known Limitations

1. **Not Built** - TypeScript files need compilation
2. **No Browser Testing Yet** - Playwright/WDIO integration pending
3. **Untested** - Needs real-world testing
4. **Mock-doc Integration** - Needs verification with actual Stencil mock-doc
5. **Loader Paths** - May need adjustment based on actual Stencil output

## Dependencies

### Peer Dependencies
- `@stencil/core` ^4.0.0
- `vitest` ^2.0.0 || ^3.0.0

### Optional
- `@playwright/test` (for browser testing)
- `@wdio/globals` (for WebdriverIO)
- `jsdom` (alternative DOM)
- `happy-dom` (alternative DOM)

## Related Work

- **Stencil's Testing** - Currently uses Jest + Puppeteer
- **@nuxt/test-utils** - Similar approach for Nuxt
- **@vue/test-utils** - Vue component testing
- **@testing-library/react** - React testing patterns

## Questions to Resolve

1. How to best integrate with Stencil's build watch mode?
2. Should we support Stencil's existing test runner alongside Vitest?
3. How to handle component lazy loading in tests?
4. Best way to test scoped styles and shadow DOM?
5. How to provide component context (providers, state management)?

## Contributing

This package is in early development. The API design is subject to change based on feedback and real-world usage.

---

**Created:** December 19, 2025
**Author:** Development Team
**License:** MIT
