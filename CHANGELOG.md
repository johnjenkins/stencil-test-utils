# Changelog

All notable changes to `@stencil/test-utils` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial package structure
- `defineVitestConfig()` for easy Vitest configuration
- `render()` function for component testing
- `newPage()` helper for page-level testing
- `setupLoader()` for component loading
- Support for multiple test environments (mock-doc, jsdom, happy-dom, node)
- Support for multiple loader types (lazy, custom-elements, dist, hydrate)
- Test pattern configuration (spec vs e2e)
- TypeScript support with full type definitions
- Basic CLI helper for filtered test runs
- Comprehensive documentation and examples

### Planned
- [ ] Browser testing support (Playwright integration)
- [ ] WebdriverIO integration
- [ ] Custom Jest/Vitest matchers (toHaveClass, toHaveAttribute, etc.)
- [ ] Better integration with Stencil's watch mode
- [ ] SSR/hydration testing utilities
- [ ] Snapshot testing support
- [ ] Accessibility testing helpers
- [ ] Visual regression testing
- [ ] Performance testing utilities
- [ ] Mock and spy utilities specific to Stencil
- [ ] Code coverage configuration helpers
- [ ] CI/CD integration examples

## [0.1.0] - TBD

Initial development release.
