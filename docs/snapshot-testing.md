# Snapshot Testing with Stencil Components

The `StencilSnapshotSerializer` provides automatic snapshot formatting for Stencil components, including shadow DOM serialization.

## Setup

Add the snapshot serializer to your test file:

```typescript
import { expect } from 'vitest';
import { StencilSnapshotSerializer } from '@stencil/test-utils';

// Add the serializer once per test file
expect.addSnapshotSerializer(StencilSnapshotSerializer);
```

Or configure it globally in your Vitest config:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { StencilSnapshotSerializer } from '@stencil/test-utils';

export default defineConfig({
  test: {
    snapshotSerializers: [StencilSnapshotSerializer],
  },
});
```

## Usage

```typescript
import { describe, it, expect } from 'vitest';
import { render, StencilSnapshotSerializer } from '@stencil/test-utils';
import { h } from '@stencil/core';

expect.addSnapshotSerializer(StencilSnapshotSerializer);

describe('my-button snapshots', () => {
  it('should match snapshot', async () => {
    const { root, waitForChanges } = await render(
      <my-button variant="primary">Click me</my-button>
    );

    await waitForChanges();
    
    // The snapshot will include the shadow DOM!
    expect(root).toMatchSnapshot();
  });
});
```

## Output Formats

The serializer automatically detects your test environment and uses the appropriate format:

### mock-doc Environment

Uses the standard `<template shadowrootmode="open">` format:

```html
<my-button class="hydrated">
  <template shadowrootmode="open">
    <button class="button button--primary button--medium" type="button">
      <slot></slot>
    </button>
  </template>
  Click me
</my-button>
```

### jsdom / happy-dom Environments

Uses the `<mock:shadow-root>` format to clearly indicate shadow DOM boundaries:

```html
<my-button class="hydrated">
  <mock:shadow-root>
    <button class="button button--primary button--medium" type="button">
      <slot></slot>
    </button>
  </mock:shadow-root>
  Click me
</my-button>
```

## Features

- **Automatic Shadow DOM Serialization**: Works across mock-doc, jsdom, and happy-dom
- **Pretty Formatting**: Properly indented HTML for readable snapshots
- **Style Exclusion**: Automatically excludes `<style>` tags from snapshots
- **Nested Components**: Handles nested Stencil components with multiple shadow roots
- **Smart Detection**: Only applies to custom elements (components with hyphens in the tag name)

## Options

The serializer automatically:
- Includes shadow DOM in snapshots
- Prettifies HTML with 2-space indentation
- Excludes `<style>` tags to keep snapshots focused on structure
- Preserves text content and attributes

## Comparison with toEqualHtml

Both the snapshot serializer and the `toEqualHtml` matcher use the same underlying serialization:

```typescript
// Snapshot testing - good for regression testing
expect(root).toMatchSnapshot();

// Explicit assertion - good for specific expectations
expect(root).toEqualHtml(`
  <my-button class="hydrated">
    <mock:shadow-root>
      <button class="button button--primary button--medium" type="button">
        <slot></slot>
      </button>
    </mock:shadow-root>
    Click me
  </my-button>
`);
```

Use snapshots when:
- You want to catch any unexpected changes
- The exact HTML structure is complex
- You're doing regression testing

Use `toEqualHtml` when:
- You have specific HTML expectations
- The test should clearly document expected output
- You want more explicit, readable tests
