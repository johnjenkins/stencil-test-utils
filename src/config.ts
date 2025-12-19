import { defineConfig, mergeConfig, type UserConfig, type WorkspaceProjectConfiguration } from 'vitest/config';
import type { StencilTestingConfig, ProjectConfig } from './types.js';
import { loadStencilConfig } from './utils/config-loader.js';
import { createVitestConfig } from './utils/vitest-config.js';
import type { Config as StencilConfig } from '@stencil/core/internal';

/**
 * Define a Vitest configuration for Stencil component testing with projects support
 * 
 * @example
 * ```ts
 * import { defineVitestConfig } from '@stencil/test-utils/config';
 * 
 * // Multi-project setup (recommended)
 * export default defineVitestConfig({
 *   stencilConfig: './stencil.config.ts',
 *   projects: [
 *     { 
 *       runtime: 'node', 
 *       environment: 'mock-doc', 
 *       include: ['**\/*.spec.tsx'] 
 *     },
 *     { 
 *       runtime: 'browser', 
 *       environment: 'playwright', 
 *       include: ['**\/*.e2e.tsx'] 
 *     }
 *   ]
 * });
 * 
 * // Legacy single environment setup
 * export default defineVitestConfig({
 *   stencilConfig: './stencil.config.ts',
 *   environment: 'mock-doc'
 * });
 * ```
 */
export async function defineVitestConfig(
  stencilTestingConfig: StencilTestingConfig = {},
  vitestConfig: UserConfig = {}
): Promise<UserConfig> {
  // Load Stencil config if needed (optional - only used for some defaults)
  let stencilConfig: StencilConfig | undefined;
  
  if (typeof stencilTestingConfig.stencilConfig === 'string') {
    // Try to load but don't fail if it errors (e.g., .ts files in Node)
    try {
      stencilConfig = await loadStencilConfig(stencilTestingConfig.stencilConfig);
    } catch (error) {
      // Silently ignore - config loading is optional for projects-based setup
      // The config is only used for deriving default paths which can use fallbacks
    }
  } else {
    stencilConfig = stencilTestingConfig.stencilConfig;
  }

  let config: UserConfig;

  // If projects are defined, use projects-based configuration
  if (stencilTestingConfig.projects && stencilTestingConfig.projects.length > 0) {
    const vitestProjects: WorkspaceProjectConfiguration[] = stencilTestingConfig.projects.map(project => 
      createProjectConfig(project, stencilConfig, stencilTestingConfig)
    );

    config = {
      test: {
        projects: vitestProjects as any,
      },
    };
  } else {
    // Legacy: single environment configuration
    config = createVitestConfig(stencilConfig, stencilTestingConfig);
  }

  // Merge with user's Vitest config
  const mergedConfig = mergeConfig(
    config as any,
    stencilTestingConfig.vitest || {} as any,
    vitestConfig as any
  ) as UserConfig;

  return defineConfig(mergedConfig);
}

/**
 * Create a Vitest project config for a single runtime/environment combination
 */
function createProjectConfig(
  project: ProjectConfig,
  stencilConfig: StencilConfig | undefined,
  globalConfig: StencilTestingConfig
): WorkspaceProjectConfiguration {
  const runtime = project.runtime || 'node';
  const environment = project.environment || (runtime === 'node' ? 'mock-doc' : 'chromium');
  
  const projectConfig: WorkspaceProjectConfiguration = {
    test: {
      name: `${runtime}:${environment}`,
      include: project.include ? (Array.isArray(project.include) ? project.include : [project.include]) : undefined,
      exclude: project.exclude ? (Array.isArray(project.exclude) ? project.exclude : [project.exclude]) : undefined,
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      // Don't use jsxInject - let users import h themselves to avoid conflicts
    },
  };

  // Configure based on runtime
  if (runtime === 'browser') {
    // Browser runtime - environment is the browser name (chromium, firefox, webkit)
    projectConfig.test!.browser = {
      enabled: true,
      name: environment as any,
      provider: 'playwright',
      headless: true,
    };
  } else {
    // Node runtime
    if (environment === 'mock-doc') {
      projectConfig.test!.environment = 'node';
      // Setup mock-doc via setupFiles
      const setupFiles = project.vitest?.test?.setupFiles || [];
      const setupFilesArray = Array.isArray(setupFiles) ? setupFiles : [setupFiles];
      projectConfig.test!.setupFiles = [
        '@stencil/test-utils/mock-doc-setup',
        ...setupFilesArray,
      ];
    } else {
      // jsdom or happy-dom
      projectConfig.test!.environment = environment;
    }
  }

  // Merge with project-specific vitest config
  if (project.vitest) {
    return mergeConfig(projectConfig as any, project.vitest as any) as WorkspaceProjectConfiguration;
  }

  return projectConfig;
}

/**
 * Get test patterns for filtering spec vs e2e tests
 */
export function getTestPatterns(config: StencilTestingConfig = {}) {
  return {
    spec: config.patterns?.spec || ['**/*.spec.ts', '**/*.spec.tsx'],
    e2e: config.patterns?.e2e || ['**/*.e2e.ts', '**/*.e2e.tsx'],
  };
}

export { type StencilTestingConfig, type ProjectConfig, type NodeEnvironment, type BrowserName } from './types.js';
