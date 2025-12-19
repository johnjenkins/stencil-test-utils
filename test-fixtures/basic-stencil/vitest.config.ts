import { defineVitestConfig } from '@stencil/test-utils/config';

// Unified config with projects - one config to rule them all!
export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  projects: [
    {
      runtime: 'node',
      environment: 'mock-doc',
      include: ['**/*.spec.{ts,tsx}'],
      exclude: ['node_modules/@stencil/test-utils/examples/**'],
      vitest: {
        test: {
          setupFiles: ['./vitest-setup.ts'],
        },
      },
    },
    {
      runtime: 'browser',
      environment: 'chromium',
      include: ['**/*.e2e.{ts,tsx}'],
      vitest: {
        test: {
          setupFiles: ['./vitest-browser-setup.ts'],
        },
      },
    },
  ],
});
