/**
 * Example Vitest configuration for a Stencil project
 * 
 * Users would place this in their project root as vitest.config.ts
 */

import { defineVitestConfig } from '@stencil/test-utils';

export default defineVitestConfig(
  {
    // Path to Stencil config (will read defaults from here)
    stencilConfig: './stencil.config.ts',
    
    // Use Stencil's mock-doc for fast, accurate component testing
    environment: 'mock-doc',
    
    // Test file patterns
    patterns: {
      spec: '**/*.spec.{ts,tsx}',
      e2e: '**/*.e2e.{ts,tsx}'
    },
    
    // Use the lazy loader (dist/esm) by default
    loader: {
      type: 'lazy',
      // modulePath: './dist/esm/loader.js',  // Optional: customize path
    }
  },
  {
    // Additional Vitest configuration
    test: {
      // Increase timeout for slower tests
      testTimeout: 10000,
      
      // Coverage thresholds
      coverage: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      
      // Browser configuration (for e2e tests)
      // browser: {
      //   enabled: true,
      //   name: 'chromium',
      //   provider: 'playwright'
      // }
    }
  }
);
