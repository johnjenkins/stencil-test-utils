# Architecture Decision Records

## ADR-001: Choose Vitest over Jest

**Status:** Accepted

**Context:**
Stencil currently uses Jest for testing. We need to decide on a test runner for this new package.

**Decision:**
Use Vitest as the primary test runner.

**Rationale:**
- Modern, fast, built on Vite
- ESM-first with excellent TypeScript support
- Jest-compatible API (easy migration path)
- Better watch mode and developer experience
- Native ESM support without configuration
- Growing ecosystem and community adoption
- Better performance than Jest
- Compatible with existing Jest matchers and utilities

**Consequences:**
- Users familiar with Jest will find it easy to adopt
- Some Jest-specific plugins may not work
- Newer tool with smaller ecosystem (but growing)

---

## ADR-002: Support Multiple DOM Environments

**Status:** Accepted

**Context:**
Different projects may have different DOM environment preferences or requirements.

**Decision:**
Support mock-doc (default), jsdom, happy-dom, and node environments.

**Rationale:**
- mock-doc is Stencil's native DOM implementation - most accurate
- jsdom is widely used and familiar to many developers
- happy-dom is faster alternative to jsdom
- node environment for non-DOM tests
- Flexibility allows users to choose what works best

**Consequences:**
- More code to maintain
- Need to ensure compatibility across environments
- Documentation must explain trade-offs

---

## ADR-003: Separate Spec and E2E Tests by File Extension

**Status:** Accepted

**Context:**
Need a convention for distinguishing component tests from browser tests.

**Decision:**
Use `.spec.tsx` for component/unit tests and `.e2e.tsx` for browser tests.

**Rationale:**
- Clear naming convention
- Easy to filter in test runners
- Follows community conventions (Angular, Stencil)
- Separates fast tests from slow tests
- Easy to run different test suites in CI

**Consequences:**
- Users must follow naming convention
- Need tooling to filter by pattern

---

## ADR-004: Support Multiple Stencil Output Loaders

**Status:** Accepted

**Context:**
Stencil supports multiple output targets with different loading mechanisms.

**Decision:**
Support lazy (ESM), custom-elements, dist, and hydrate loaders.

**Rationale:**
- Different outputs have different characteristics
- Users should test against their production build
- lazy loader is most common (default)
- custom-elements enables tree-shaking
- hydrate needed for SSR testing

**Consequences:**
- More complex implementation
- Need to document when to use each
- Must maintain compatibility with Stencil's output formats

---

## ADR-005: Auto-import Stencil Config

**Status:** Accepted

**Context:**
Need to determine how to get Stencil configuration.

**Decision:**
Accept Stencil config path or object, with auto-loading from standard location.

**Rationale:**
- Reduces configuration duplication
- Uses existing Stencil settings (srcDir, outputTargets)
- Allows override when needed
- Follows principle of convention over configuration

**Consequences:**
- Need to handle missing or invalid config
- Must support both .ts and .js config files
- Dynamic import may have limitations

---

## ADR-006: Provide Unified render() API

**Status:** Accepted

**Context:**
Need consistent way to render components across environments.

**Decision:**
Single `render()` function that works in all environments.

**Rationale:**
- Simpler API for users
- Similar to @testing-library/react
- Easy to switch between environments
- Consistent testing patterns
- Returns useful helpers (waitForChanges, setProps, etc.)

**Consequences:**
- Implementation must handle environment differences
- May have limitations in certain environments

---

## ADR-007: Auto-cleanup Between Tests

**Status:** Accepted

**Context:**
DOM state can leak between tests causing issues.

**Decision:**
Automatically clean up DOM after each test via setup file.

**Rationale:**
- Prevents test pollution
- Common pattern in testing libraries
- Reduces boilerplate
- Follows Jest/Vitest conventions
- Users can override if needed

**Consequences:**
- May clean up things users want to keep
- Could impact performance (minimal)

---

## ADR-008: Custom Matchers for Stencil

**Status:** Accepted

**Context:**
Standard matchers don't cover common Stencil testing needs.

**Decision:**
Provide custom matchers like toHaveClass, toHaveAttribute, etc.

**Rationale:**
- Better assertion experience
- More readable tests
- Similar to @testing-library/jest-dom
- Common patterns in Stencil testing
- Better error messages

**Consequences:**
- More code to maintain
- Must keep TypeScript types in sync
- Need documentation for each matcher

---

## ADR-009: Use Default Environment mock-doc

**Status:** Accepted

**Context:**
Need to choose a sensible default environment.

**Decision:**
Use mock-doc as the default test environment.

**Rationale:**
- Built by Stencil team for Stencil
- Most accurate for Stencil components
- Fastest option
- Already a dependency via @stencil/core
- Best shadow DOM support for Stencil

**Consequences:**
- Users wanting other environments must configure
- Less familiar to developers from other ecosystems
- Relies on Stencil's implementation

---

## ADR-010: CLI Helper (Future)

**Status:** Proposed

**Context:**
Running filtered tests requires remembering patterns.

**Decision:**
Provide `stencil-test` CLI with --spec and --e2e flags.

**Rationale:**
- Easier than remembering Vitest patterns
- Better developer experience
- Consistent with Stencil CLI conventions
- Allows future enhancements

**Consequences:**
- Another tool to maintain
- Must stay compatible with Vitest
- Users still need to understand Vitest for advanced usage

---

## Future Decisions

- Browser testing implementation (Playwright vs WebdriverIO)
- Integration with Stencil's watch mode
- SSR/hydration testing approach
- Visual regression testing strategy
- Snapshot testing conventions
- Mock/spy utilities
