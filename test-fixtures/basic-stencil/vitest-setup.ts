/**
 * Vitest setup for basic-stencil fixture
 * Extends the base mock-doc setup from @stencil/test-utils
 */
import { win } from '@stencil/test-utils/mock-doc-setup';

// Load the Stencil components for this project
const { defineCustomElements } = await import('./dist/esm/loader.js');
await defineCustomElements(win);

