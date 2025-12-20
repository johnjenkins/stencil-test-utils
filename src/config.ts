import { defineConfig, mergeConfig, type UserConfig } from 'vitest/config';
import { loadStencilConfig, getStencilSrcDir, getStencilOutputDirs, getStencilResolveAliases } from './utils/config-loader.js';
import type { Config as StencilConfig } from '@stencil/core/internal';

/**
 * Define a Vitest configuration for Stencil component testing
 * 
 * Accepts standard Vitest config with optional Stencil enhancements.
 * Automatically applies Stencil-specific defaults:
 * - JSX configuration (h, Fragment)
 * - Resolve aliases from Stencil config (@, @components, @utils)
 * - Coverage configuration based on srcDir
 * - Exclude patterns for build outputs
 * - Auto-injects mock-doc-setup for projects named 'mock-doc', 'unit', or 'spec'
 * - Auto-injects jsdom-setup for projects named 'jsdom' or containing 'jsdom'
 * - Auto-injects happy-dom-setup for projects named 'happy-dom' or containing 'happy-dom'
 * 
 * @example
 * ```ts
 * import { defineVitestConfig } from '@stencil/test-utils/config';
 * 
 * export default defineVitestConfig({
 *   test: {
 *     projects: [
 *       {
 *         test: {
 *           name: 'mock-doc', // ✨ Auto-injects mock-doc-setup!
 *           include: ['**\/*.spec.tsx'],
 *           environment: 'node',
 *           setupFiles: ['./vitest-setup.ts'],
 *         },
 *       },
 *       {
 *         test: {
 *           name: 'jsdom', // ✨ Auto-injects jsdom-setup!
 *           include: ['**\/*.jsdom.spec.tsx'],
 *           environment: 'jsdom',
 *           setupFiles: ['./vitest-setup.ts'],
 *         },
 *       },
 *       {
 *         test: {
 *           name: 'happy-dom', // ✨ Auto-injects happy-dom-setup!
 *           include: ['**\/*.happy.spec.tsx'],
 *           environment: 'happy-dom',
 *           setupFiles: ['./vitest-setup.ts'],
 *         },
 *       },
 *       {
 *         test: {
 *           name: 'browser',
 *           include: ['**\/*.e2e.tsx'],
 *           browser: {
 *             enabled: true,
 *             provider: 'playwright',
 *             instances: [
 *               { browser: 'chromium' }
 *             ],
 *           },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 */
export async function defineVitestConfig(
  config: UserConfig & { stencilConfig?: string | StencilConfig } = {}
): Promise<UserConfig> {
  // Load Stencil config if provided (optional)
  let stencilConfig: StencilConfig | undefined;
  
  if (typeof config.stencilConfig === 'string') {
    try {
      stencilConfig = await loadStencilConfig(config.stencilConfig);
    } catch (error) {
      // Silently ignore - config loading is optional
    }
  } else if (config.stencilConfig) {
    stencilConfig = config.stencilConfig;
  }

  // Remove stencilConfig from the final config
  const { stencilConfig: _, ...vitestConfig } = config;

  // Apply Stencil-specific defaults
  const enhancedConfig = applyStencilDefaults(vitestConfig, stencilConfig);

  return defineConfig(enhancedConfig);
}

/**
 * Apply Stencil-specific defaults to Vitest config
 */
function applyStencilDefaults(
  config: UserConfig,
  stencilConfig?: StencilConfig
): UserConfig {
  // Start with the user's config
  const result = { ...config };

  // Add esbuild JSX config if not present
  if (!result.esbuild) {
    result.esbuild = {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    };
  }

  // Add resolve aliases from Stencil config if not present
  if (!result.resolve) {
    result.resolve = {};
  }
  if (!result.resolve.alias) {
    result.resolve.alias = getStencilResolveAliases(stencilConfig);
  } else if (typeof result.resolve.alias === 'object' && !Array.isArray(result.resolve.alias)) {
    // Merge with existing aliases, user's aliases take precedence
    result.resolve.alias = {
      ...getStencilResolveAliases(stencilConfig),
      ...result.resolve.alias,
    };
  }

  // Ensure test config exists
  if (!result.test) {
    result.test = {};
  }

  // Add globals if not set
  if (result.test.globals === undefined) {
    result.test.globals = true;
  }

  // Add coverage config at root level if not present
  // This applies to all projects in multi-project mode
  if (!result.test.coverage) {
    const srcDir = getStencilSrcDir(stencilConfig);
    const outputDirs = getStencilOutputDirs(stencilConfig);
    result.test.coverage = {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [`${srcDir}/**/*.{ts,tsx}`],
      exclude: [
        `${srcDir}/**/*.spec.{ts,tsx}`,
        `${srcDir}/**/*.e2e.{ts,tsx}`,
        `${srcDir}/**/*.test.{ts,tsx}`,
        `${srcDir}/**/*.jsdom.spec.{ts,tsx}`,
        ...outputDirs.map(dir => `${dir}/**`),
      ],
    };
  }

  // If there are projects, enhance each one
  if (result.test.projects) {
    result.test.projects = (result.test.projects as any[]).map(project => 
      enhanceProject(project, stencilConfig)
    );
  } else {
    // Single project mode - enhance the test config directly
    result.test = enhanceTestConfig(result.test, stencilConfig);
  }

  return result;
}

/**
 * Enhance test config with Stencil defaults
 */
function enhanceTestConfig(
  testConfig: any,
  stencilConfig?: StencilConfig
): any {
  const enhanced = { ...testConfig };

  // Get output directories from Stencil config
  const outputDirs = getStencilOutputDirs(stencilConfig);
  const defaultExcludes = [
    '**/node_modules/**',
    ...outputDirs.map(dir => `**/${dir}/**`),
  ];

  // Add default excludes if not present
  if (!enhanced.exclude) {
    enhanced.exclude = defaultExcludes;
  } else {
    // Merge with existing excludes
    const existingExcludes = Array.isArray(enhanced.exclude) 
      ? enhanced.exclude 
      : [enhanced.exclude];
    
    enhanced.exclude = [
      ...defaultExcludes,
      ...existingExcludes.filter(pattern => !defaultExcludes.includes(pattern))
    ];
  }

  // Add coverage config based on Stencil srcDir if not present
  if (!enhanced.coverage) {
    const srcDir = getStencilSrcDir(stencilConfig);
    enhanced.coverage = {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [`${srcDir}/**/*.{ts,tsx}`],
      exclude: [
        `${srcDir}/**/*.spec.{ts,tsx}`,
        `${srcDir}/**/*.e2e.{ts,tsx}`,
        `${srcDir}/**/*.test.{ts,tsx}`,
        ...outputDirs.map(dir => `${dir}/**`),
      ],
    };
  }

  return enhanced;
}

/**
 * Enhance a single project with Stencil defaults
 */
function enhanceProject(
  project: any,
  stencilConfig?: StencilConfig
): any {
  const enhanced = { ...project };

  // Get output directories from Stencil config
  const outputDirs = getStencilOutputDirs(stencilConfig);
  const defaultExcludes = [
    '**/node_modules/**',
    ...outputDirs.map(dir => `**/${dir}/**`),
  ];

  // Merge default excludes with user-provided excludes
  if (enhanced.test) {
    if (!enhanced.test.exclude) {
      enhanced.test.exclude = defaultExcludes;
    } else {
      // Merge defaults with existing excludes, avoiding duplicates
      const existingExcludes = Array.isArray(enhanced.test.exclude) 
        ? enhanced.test.exclude 
        : [enhanced.test.exclude];
      
      enhanced.test.exclude = [
        ...defaultExcludes,
        ...existingExcludes.filter(pattern => !defaultExcludes.includes(pattern))
      ];
    }
    
    // Auto-inject setup files based on environment
    const setupFiles = enhanced.test.setupFiles || [];
    const setupFilesArray = Array.isArray(setupFiles) ? setupFiles : [setupFiles];
    const projectName = enhanced.test.name?.toLowerCase();
    
    // Auto-inject setup files based on project name
    // This provides predictable, explicit behavior based on naming convention
    
    // Auto-inject jsdom-setup for jsdom projects
    if (projectName === 'jsdom' || projectName?.includes('jsdom')) {
      if (!setupFilesArray.includes('@stencil/test-utils/jsdom-setup')) {
        enhanced.test.setupFiles = ['@stencil/test-utils/jsdom-setup', ...setupFilesArray];
      }
    }
    
    // Auto-inject happy-dom-setup for happy-dom projects
    if (projectName === 'happy-dom' || projectName?.includes('happy-dom')) {
      if (!setupFilesArray.includes('@stencil/test-utils/happy-dom-setup')) {
        enhanced.test.setupFiles = ['@stencil/test-utils/happy-dom-setup', ...setupFilesArray];
      }
    }
    
    // Auto-inject mock-doc-setup for mock-doc, unit, or spec projects
    if (projectName === 'mock-doc' || 
        projectName?.includes('mock-doc') ||
        projectName === 'unit' ||
        projectName === 'spec') {
      if (!setupFilesArray.includes('@stencil/test-utils/mock-doc-setup')) {
        enhanced.test.setupFiles = ['@stencil/test-utils/mock-doc-setup', ...setupFilesArray];
      }
    }
    
    // Note: coverage config is applied at the root test level, not per-project
  }

  return enhanced;
}

