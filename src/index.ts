// Testing utilities - mock-doc render
export { render, newPage } from './testing/render.js';

// Matcher installation and individual matcher exports
export { installMatchers } from './testing/matchers.js';
export {
  toHaveClass,
  toHaveAttribute,
  toHaveProperty,
  toHaveTextContent,
  toBeVisible,
  toHaveShadowRoot,
  toEqualHtml,
  toEqualLightHtml,
} from './testing/matchers.js';

// Type exports
export type {
  RenderOptions,
  RenderResult,
} from './types.js';

// Note: Configuration exports (defineVitestConfig) are available at '@stencil/test-utils/config'
// Note: Mock-doc setup is available at '@stencil/test-utils/mock-doc-setup'
// Note: jsdom setup is available at '@stencil/test-utils/jsdom-setup'

