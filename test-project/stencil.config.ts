import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'test-components',
  suppressReservedPublicNameWarnings: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'dist-hydrate-script',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
  testing: {
    browserHeadless: true,
  },
  sourceMap: false,
  // Exclude test files and snapshots from Stencil's file watcher
  // to prevent infinite rebuild loops when running tests in watch mode
  // watchIgnoredRegex: [/\.(spec|test|e2e)\.(ts|tsx|js|jsx)$/, /__snapshots__/, /__screenshots__/, /vitest\.config/],
};
