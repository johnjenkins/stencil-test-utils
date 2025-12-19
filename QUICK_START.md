# 🚀 Quick Start - Testing @stencil/test-utils

## TL;DR

```bash
# One command to set everything up and run tests
./test-setup.sh
```

## What You Have Now

✅ **Complete test fixture** - A real Stencil project with 2 components  
✅ **38 comprehensive tests** - Component tests, e2e tests, unit tests, integration tests  
✅ **Full documentation** - Guides, examples, and architecture diagrams  
✅ **Ready to run** - Just install and test!

## Project Structure

```
@stencil/test-utils/
├── 📦 src/                          Your package source code
├── 🧪 tests/                        Unit & integration tests
├── 🎯 test-fixtures/               Test Stencil projects
│   └── basic-stencil/              Complete Stencil app with tests
└── 📚 Documentation files          Guides and references
```

## Quick Commands

### Setup (First Time)
```bash
# Automated setup
./test-setup.sh

# Or manual steps
pnpm install                    # Install dependencies
pnpm build                      # Build the package
pnpm test:integration:build     # Build test fixture
```

### Run Tests
```bash
pnpm test                       # All tests
pnpm test:unit                 # Unit tests only
pnpm test:integration          # Integration tests only
pnpm test:coverage             # With coverage report
pnpm test -- --watch           # Watch mode
```

### Work with Fixture
```bash
cd test-fixtures/basic-stencil

pnpm test                      # All fixture tests
pnpm test --run *.spec         # Only component tests
pnpm test --run *.e2e          # Only e2e tests
pnpm test --run my-button.spec # Specific component
```

## Test Fixture: basic-stencil

A complete Stencil project that uses your `@stencil/test-utils` package.

### Components
- **my-button** - Button with variants, sizes, events (17 spec + 7 e2e tests)
- **my-card** - Card with slots, elevation, interactivity (14 spec tests)

### Features Demonstrated
✅ `defineVitestConfig()` - Your main API  
✅ `render()` - Component rendering  
✅ Props & events - Full prop handling  
✅ Shadow DOM - Real shadow DOM testing  
✅ Slots - Named and default slots  
✅ Multiple loaders - Lazy, custom-elements, hydrate  
✅ Test patterns - Separate spec and e2e files  

### Example Test
```tsx
import { render } from '@stencil/test-utils';
import { h } from '@stencil/core';

it('should render button', async () => {
  const result = await render(
    h('my-button', { variant: 'primary' }, 'Click me')
  );
  
  const button = result.root.shadowRoot!.querySelector('button');
  expect(button?.classList.contains('button--primary')).toBe(true);
});
```

## Documentation Files

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | Visual diagrams of test architecture |
| `TESTING_GUIDE.md` | Comprehensive guide to testing |
| `TEST_SETUP_SUMMARY.md` | Quick reference for setup |
| `TEST_INFRASTRUCTURE_COMPLETE.md` | What was built |
| `FILES_CREATED.md` | List of all new files |
| **This file** | Quick start guide |

## What Gets Tested

### ✅ Package Functions (Unit Tests)
- `render()` function
- Props handling
- Lifecycle methods
- Cleanup/unmount

### ✅ Integration (Integration Tests)
- Fixture setup validation
- Build output verification
- Test execution
- Pattern matching

### ✅ Real Usage (Fixture Tests)
- Component rendering
- Props updates
- Event handling
- Shadow DOM
- Slots
- Variants & states

## Common Tasks

### Add a New Component to Fixture
```bash
cd test-fixtures/basic-stencil/src/components

# Create component directory
mkdir my-new-component
cd my-new-component

# Create files
touch my-new-component.tsx
touch my-new-component.css
touch my-new-component.spec.tsx
touch my-new-component.e2e.tsx

# Build and test
cd ../..
pnpm build
pnpm test
```

### Debug a Failing Test
```bash
# Run specific test with verbose output
pnpm test -t "test name" --reporter=verbose

# Run in watch mode
pnpm test --watch

# Check fixture build
cd test-fixtures/basic-stencil
pnpm build
ls -la dist/
```

### View Coverage
```bash
pnpm test:coverage
open coverage/index.html
```

## Test Statistics

- **Total Tests:** 38 tests
- **Test Suites:** 18 suites
- **Components:** 2 (my-button, my-card)
- **Test Files:** 4 (3 spec, 1 e2e)
- **Lines of Code:** ~2,500+ lines

## Next Steps

1. ✅ **Run the tests** - `./test-setup.sh`
2. ✅ **Explore the fixture** - `cd test-fixtures/basic-stencil`
3. ✅ **Review test examples** - Look at `*.spec.tsx` files
4. ⏳ **Add more tests** - Test different scenarios
5. ⏳ **Add browser tests** - Implement playwright/wdio
6. ⏳ **Add more fixtures** - Test different Stencil configs

## Need Help?

- **Setup issues?** See `TESTING_GUIDE.md`
- **Architecture questions?** See `ARCHITECTURE.md`
- **What was built?** See `TEST_INFRASTRUCTURE_COMPLETE.md`
- **File reference?** See `FILES_CREATED.md`

## Success Indicators

After running `./test-setup.sh`, you should see:
- ✅ Dependencies installed
- ✅ Package built to `dist/`
- ✅ Fixture built with all output targets
- ✅ Unit tests passing
- ✅ Integration tests passing
- ✅ No errors in fixture tests

## Key Features Validated

Your `@stencil/test-utils` package is tested to:

✅ Read and use Stencil config  
✅ Generate proper Vitest config  
✅ Support test file patterns (spec/e2e)  
✅ Load components via lazy loader  
✅ Provide render() API  
✅ Handle props dynamically  
✅ Handle events  
✅ Work with Shadow DOM  
✅ Support slots  
✅ Cleanup properly  

---

**You're all set!** 🎉

Run `./test-setup.sh` to get started, or jump to any documentation file for more details.
