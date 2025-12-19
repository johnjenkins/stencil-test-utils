import type { Config as StencilConfig } from '@stencil/core/internal';
import type { UserConfig } from 'vitest/config';
import type { StencilTestingConfig } from '../types.js';
import { getStencilOutputDir, getStencilSrcDir } from './config-loader.js';

/**
 * Create a Vitest configuration based on Stencil config
 * Note: This is for legacy single-environment configs. Use projects-based config for multi-environment support.
 */
export function createVitestConfig(
  stencilConfig: StencilConfig | undefined,
  testingConfig: StencilTestingConfig
): UserConfig {
  const srcDir = getStencilSrcDir(stencilConfig);
  const outDir = getStencilOutputDir(stencilConfig);
  
  // For legacy support, default to mock-doc for node environment
  const environment = testingConfig.environment || 'mock-doc';
  const patterns = testingConfig.patterns || {};

  // Base Vitest config
  const config: UserConfig = {
    test: {
      // Environment setup - mock-doc uses node environment
      environment: environment === 'mock-doc' ? 'node' : environment,
      
      // Setup files - add mock-doc setup if using that environment
      setupFiles: environment === 'mock-doc' 
        ? ['@stencil/test-utils/mock-doc-setup']
        : undefined,
      
      // Test patterns - only include patterns that are explicitly set
      include: [
        ...(patterns.spec !== undefined 
          ? (Array.isArray(patterns.spec) ? patterns.spec : [patterns.spec]) 
          : (patterns.e2e === undefined ? ['**/*.spec.{ts,tsx}'] : [])),
        ...(patterns.e2e !== undefined
          ? (Array.isArray(patterns.e2e) ? patterns.e2e : [patterns.e2e])
          : [])
      ],
      
      // Globals (for expect, describe, it, etc.)
      globals: true,
      
      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: [srcDir],
        exclude: [
          '**/*.spec.{ts,tsx}',
          '**/*.e2e.{ts,tsx}',
          '**/test/**',
          '**/tests/**'
        ]
      },
      
      // Watch mode settings
      watch: false,
      
      // Reporter settings
      reporters: ['default'],
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        // Allow imports from the src directory
        '@': srcDir,
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs']
    },
  };

  // Add mock-doc specific setup
  if (environment === 'mock-doc') {
    config.test = config.test || {};
    config.test.environmentOptions = {
      ...config.test.environmentOptions,
      // Will be handled by setup file
    };
  }

  return config;
}

/**
 * Get CLI filter for running only spec or e2e tests
 */
export function getTestFilter(type: 'spec' | 'e2e', patterns?: StencilTestingConfig['patterns']) {
  const defaultPatterns = {
    spec: ['**/*.spec.ts', '**/*.spec.tsx'],
    e2e: ['**/*.e2e.ts', '**/*.e2e.tsx']
  };
  
  const pattern = patterns?.[type] || defaultPatterns[type];
  return Array.isArray(pattern) ? pattern : [pattern];
}
