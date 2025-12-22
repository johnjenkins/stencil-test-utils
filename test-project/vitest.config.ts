import { defineVitestConfig } from '@stencil/test-utils/config';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      {
        test: {
          name: 'stencil',
          environment: 'stencil',
          include: ['**/*.spec.{ts,tsx}'],
          exclude: [
            '**/*.jsdom.spec.{ts,tsx}',
            '**/*-jsdom.spec.{ts,tsx}',
            '**/*-happy.spec.{ts,tsx}',
            '**/*.happy.spec.{ts,tsx}',
          ],
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      {
        test: {
          name: 'jsdom',
          include: ['**/*-jsdom.spec.{ts,tsx}', '**/*.jsdom.spec.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      {
        test: {
          name: 'happy-dom',
          include: ['**/*-happy.spec.{ts,tsx}', '**/*.happy.spec.{ts,tsx}'],
          environment: 'happy-dom',
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['**/*.e2e.{ts,tsx}'],
          setupFiles: ['./vitest-setup.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
