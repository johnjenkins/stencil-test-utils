// Testing utilities - mock-doc render
export { render, newPage } from './testing/render.js';
export { installMatchers } from './testing/matchers.js';

// Environment setup - exports the mock window for custom setup
export { win, doc } from './testing/mock-doc-setup.js';

// Type exports
export type {
  TestRuntime,
  NodeEnvironment,
  BrowserName,
  BrowserProvider,
  LoaderType,
  LoaderConfig,
  TestPatterns,
  RenderOptions,
  RenderResult,
  ProjectConfig,
} from './types.js';

// Note: Configuration exports (defineVitestConfig, etc.) are available at '@stencil/test-utils/config'
export type { StencilTestingConfig } from './types.js';
