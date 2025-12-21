# Basic Stencil Test Fixture

This is a test fixture for `@stencil/test-utils` that contains a basic Stencil project with sample components.

## Components

### my-button
A simple button component with:
- Variants: primary, secondary, danger
- Sizes: small, medium, large
- Disabled state
- Click event emission

### my-card
A card component with:
- Optional title
- Elevation levels (0-3)
- Interactive mode
- Slots: default, footer, header-actions

## Testing

This fixture includes both spec and e2e tests for each component:

- `*.spec.tsx` - Component/unit tests (run in node DOM environment)
- `*.e2e.tsx` - Browser-based tests (run in real browser environment)

## Setup

```bash
# Install dependencies
pnpm install

# Build Stencil components
pnpm build

# Run tests
pnpm test
```

## Usage in Integration Tests

This fixture is used by the parent `@stencil/test-utils` package to test its functionality.
