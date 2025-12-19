# Test Architecture Diagram

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    @stencil/test-utils Package                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Core Package (src/)                       │  │
│  │                                                                │  │
│  │  config.ts                                                     │  │
│  │  ├─ defineVitestConfig()  ← Main API for users               │  │
│  │  └─ getTestPatterns()                                         │  │
│  │                                                                │  │
│  │  testing/                                                      │  │
│  │  ├─ render.ts              ← Component rendering              │  │
│  │  ├─ loader.ts              ← Component loading                │  │
│  │  └─ matchers.ts            ← Custom assertions                │  │
│  │                                                                │  │
│  │  utils/                                                        │  │
│  │  ├─ config-loader.ts       ← Read stencil.config.ts          │  │
│  │  └─ vitest-config.ts       ← Generate vitest config          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                              ▼ builds to                              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Distribution (dist/)                       │  │
│  │                                                                │  │
│  │  index.js / index.cjs      ← ES Module / CommonJS            │  │
│  │  index.d.ts                ← TypeScript types                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ tested by
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Test Infrastructure                           │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Unit Tests (tests/)                       │  │
│  │                                                                │  │
│  │  render.spec.ts                                               │  │
│  │  ├─ Test render() function                                    │  │
│  │  ├─ Test props handling                                       │  │
│  │  ├─ Test lifecycle methods                                    │  │
│  │  └─ Test cleanup                                              │  │
│  │                                                                │  │
│  │  integration.spec.ts                                          │  │
│  │  ├─ Validate fixture setup                                    │  │
│  │  ├─ Verify build outputs                                      │  │
│  │  └─ Test execution                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                              ▼ uses                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            Test Fixture: basic-stencil/                       │  │
│  │              (Real Stencil Project)                           │  │
│  │                                                                │  │
│  │  stencil.config.ts                                            │  │
│  │  ├─ outputTargets:                                            │  │
│  │  │  ├─ dist (lazy loader)                                     │  │
│  │  │  ├─ dist-custom-elements                                   │  │
│  │  │  ├─ dist-hydrate-script                                    │  │
│  │  │  └─ www                                                     │  │
│  │                                                                │  │
│  │  vitest.config.ts                                             │  │
│  │  └─ Uses defineVitestConfig({                                 │  │
│  │       stencilConfig: './stencil.config.ts',                   │  │
│  │       environment: 'mock-doc',                                │  │
│  │       patterns: { spec: '**/*.spec.tsx', ... }                │  │
│  │     })                                                         │  │
│  │                                                                │  │
│  │  src/components/                                              │  │
│  │  ├─ my-button/                                                │  │
│  │  │  ├─ my-button.tsx         ← Stencil component            │  │
│  │  │  ├─ my-button.css         ← Styles                        │  │
│  │  │  ├─ my-button.spec.tsx    ← 17 component tests           │  │
│  │  │  └─ my-button.e2e.tsx     ← 7 browser tests              │  │
│  │  │                                                            │  │
│  │  └─ my-card/                                                  │  │
│  │     ├─ my-card.tsx           ← Stencil component            │  │
│  │     ├─ my-card.css           ← Styles                        │  │
│  │     └─ my-card.spec.tsx      ← 14 component tests           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Test Flow

```
┌─────────────────────┐
│   Developer runs    │
│   pnpm test         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Vitest runs tests (vitest.config.ts)  │
└──────────┬──────────────────────────────┘
           │
           ├─────────────────┬────────────────────┐
           ▼                 ▼                    ▼
    ┌──────────┐      ┌─────────────┐     ┌──────────────┐
    │   Unit   │      │ Integration │     │   Fixture    │
    │  Tests   │      │    Tests    │     │    Tests     │
    └──────────┘      └─────────────┘     └──────────────┘
         │                   │                    │
         │                   │                    │
         ▼                   ▼                    ▼
    Tests src/         Tests with          Uses package API
    functions          real fixture        in real project
    directly          (builds & runs)      (validates API)
```

## Component Test Flow (Fixture)

```
User writes test:
┌─────────────────────────────────────────────────┐
│  import { render } from '@stencil/test-utils';  │
│  import { h } from '@stencil/core';             │
│                                                  │
│  const result = await render(                   │
│    h('my-button', { variant: 'primary' })       │
│  );                                              │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  render() called │
           └────────┬─────────┘
                    │
                    ▼
    ┌────────────────────────────────┐
    │  1. Create element              │
    │     document.createElement()    │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │  2. Set props & attributes      │
    │     element[key] = value        │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │  3. Append to DOM               │
    │     document.body.appendChild() │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │  4. Wait for ready              │
    │     componentOnReady()          │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │  5. Return result object        │
    │     { root, waitForChanges,    │
    │       setProps, unmount }       │
    └────────────────────────────────┘
```

## Build & Test Workflow

```
┌──────────────────────────────────────────────────────────┐
│                    1. Package Build                       │
│                                                           │
│  pnpm build                                               │
│  ├─ tsc → dist/*.js (ES Module)                         │
│  └─ tsc -p tsconfig.cjs.json → dist/*.cjs (CommonJS)    │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 2. Fixture Build                          │
│                                                           │
│  cd test-fixtures/basic-stencil                          │
│  pnpm install  (installs @stencil/test-utils)            │
│  pnpm build    (runs stencil build)                      │
│  ├─ dist/esm/loader.js          ← Lazy loader           │
│  ├─ dist/components/            ← Custom elements        │
│  ├─ dist/hydrate/               ← Hydrate script         │
│  └─ www/                        ← Dev server             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   3. Run Tests                            │
│                                                           │
│  pnpm test                                                │
│  ├─ Unit Tests (tests/*.spec.ts)                        │
│  │  └─ Mock DOM, test functions directly                │
│  │                                                        │
│  ├─ Integration Tests (tests/integration.spec.ts)       │
│  │  └─ Verify fixture build & structure                 │
│  │                                                        │
│  └─ Fixture Tests (basic-stencil/src/**/*.spec.tsx)     │
│     ├─ Load components via loader                        │
│     ├─ Use render() API                                  │
│     └─ Test real component behavior                      │
└──────────────────────────────────────────────────────────┘
```

## Test Patterns in Fixture

```
Component Test (*.spec.tsx)
├─ Environment: mock-doc (node)
├─ Purpose: Fast component logic tests
└─ Example:
    describe('my-button', () => {
      it('renders with props', async () => {
        const result = await render(
          h('my-button', { variant: 'primary' })
        );
        expect(result.root).toBeTruthy();
      });
    });

E2E Test (*.e2e.tsx)
├─ Environment: browser (playwright/wdio)
├─ Purpose: Visual, interaction, accessibility tests
└─ Example:
    describe('my-button - e2e', () => {
      it('shows hover effects', async () => {
        const result = await render(
          h('my-button', { variant: 'primary' })
        );
        // Test real browser behavior
      });
    });
```

## File Dependency Graph

```
User Project (using @stencil/test-utils)
├─ vitest.config.ts
│  └─ imports defineVitestConfig
│     └─ from @stencil/test-utils
│
├─ my-component.spec.tsx
│  ├─ imports { render } from @stencil/test-utils
│  │  └─ uses testing/render.ts
│  │
│  └─ imports { h } from @stencil/core
│     └─ JSX rendering
│
└─ stencil.config.ts
   └─ read by config-loader.ts
      └─ generates vitest config
```

## Test Coverage Map

```
@stencil/test-utils Package
│
├─ config.ts
│  ├─ ✅ defineVitestConfig     → Tested by integration tests
│  └─ ✅ getTestPatterns        → Tested by integration tests
│
├─ testing/render.ts
│  ├─ ✅ render()               → Tested by render.spec.ts
│  ├─ ✅ props handling         → Tested by render.spec.ts
│  ├─ ✅ waitForChanges()       → Tested by render.spec.ts
│  ├─ ✅ setProps()             → Tested by render.spec.ts
│  └─ ✅ unmount()              → Tested by render.spec.ts
│
├─ testing/loader.ts
│  ├─ ⏳ loadComponents()       → Needs tests
│  ├─ ⏳ lazy loader            → Tested by fixture
│  ├─ ⏳ custom-elements        → Needs tests
│  └─ ⏳ hydrate loader         → Needs tests
│
└─ utils/
   ├─ ⏳ config-loader.ts       → Needs tests
   └─ ⏳ vitest-config.ts       → Tested by fixture
```

## Quick Reference

| Test Type | Location | Purpose | Environment |
|-----------|----------|---------|-------------|
| Unit Tests | `tests/*.spec.ts` | Test package functions | Node |
| Integration | `tests/integration.spec.ts` | Validate with fixture | Node |
| Component Spec | `fixture/**/*.spec.tsx` | Component logic | mock-doc |
| Component E2E | `fixture/**/*.e2e.tsx` | Browser behavior | Browser |

## Summary

This architecture provides:
1. ✅ **Isolated unit tests** for package functions
2. ✅ **Integration tests** with real Stencil project
3. ✅ **Real-world examples** in the fixture
4. ✅ **Both test patterns** (spec & e2e)
5. ✅ **Complete validation** of the package API

The fixture serves as both a test and an example of how users will consume the package!
