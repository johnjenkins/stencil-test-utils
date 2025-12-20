# @stencil/test-utils Development

## Project Structure

```
packages/testing/
├── src/
│   ├── config.ts              # Main config export
│   ├── index.ts               # Main entry point
│   ├── setup.ts               # Test setup file
│   ├── types.ts               # TypeScript types
│   ├── testing/
│   │   ├── render.ts          # Component rendering utilities
│   │   └── loader.ts          # Component loader utilities
│   └── utils/
│       ├── config-loader.ts   # Stencil config loading
│       └── vitest-config.ts   # Vitest config generation
├── examples/                  # Example usage
├── dist/                      # Built output
├── package.json
├── tsconfig.json
└── README.md
```

## Development Setup

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```

2. Build the package:
   ```bash
   cd packages/testing
   npm run build
   ```

3. Watch for changes:
   ```bash
   npm run dev
   ```

## Testing

Currently this package is in early development. To test it:

1. Build the package
2. Link it to a test Stencil project
3. Create a vitest.config.ts using the examples
4. Run tests

## Architecture Decisions

### Why Vitest?

- Modern, fast test runner built on Vite
- Excellent TypeScript support
- ESM-first with CJS compatibility
- Great watch mode and UI
- Compatible with Jest API (easy migration)

### Why Multiple Loaders?

Stencil supports multiple output targets (dist, dist-custom-elements, www, etc.), each with different loading mechanisms. Supporting multiple loaders allows users to test against their actual production build output.

### Environment Strategy

- **mock-doc** (default): Fast, accurate, built into Stencil
- **jsdom/happy-dom**: For users who need/prefer these
- **browser (playwright/wdio)**: For true e2e testing

### Test Patterns

Following community conventions:
- `.spec.tsx` - Component/unit tests (fast, node-based)
- `.e2e.tsx` - Browser-based tests (slower, real browser)

## TODO

- [ ] Add browser testing support (Playwright/WebdriverIO)
- [ ] Add custom matchers (toHaveClass, toHaveAttribute, etc.)
- [ ] CLI helper for running filtered tests
- [ ] Better integration with Stencil's watch mode
- [ ] Support for testing hydrated/SSR components
- [ ] Examples with different loaders
- [ ] Integration tests
- [ ] Documentation site

## Contributing

This package is in early development. Contributions and feedback welcome!

## Design Goals

1. **Zero Config** - Works with Stencil defaults out of the box
2. **Flexible** - Support multiple environments and loaders
3. **Fast** - Default to fastest options (mock-doc, lazy loader)
4. **Familiar** - Jest-like API for easy adoption
5. **Type-Safe** - Full TypeScript support
6. **Developer Experience** - Great error messages and DX
