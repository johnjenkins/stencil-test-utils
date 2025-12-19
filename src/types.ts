import type { Config as StencilConfig } from '@stencil/core/internal';
import type { UserConfig as VitestUserConfig } from 'vitest/config';

/**
 * Test runtime - where tests execute
 */
export type TestRuntime = 'node' | 'browser';

/**
 * Test environment options for Node runtime
 */
export type NodeEnvironment = 'mock-doc' | 'jsdom' | 'happy-dom';

/**
 * Browser options for browser runtime
 */
export type BrowserName = 'chromium' | 'firefox' | 'webkit';

/**
 * Legacy browser provider type
 * @deprecated Use BrowserName instead
 */
export type BrowserProvider = 'playwright' | 'webdriverio';

/**
 * Loader types for different Stencil output targets
 */
export type LoaderType = 'lazy' | 'custom-elements' | 'dist' | 'hydrate';

/**
 * Test file patterns configuration
 */
export interface TestPatterns {
  /**
   * Pattern for spec (unit/component) tests
   * @default '**\/*.spec.{ts,tsx}'
   */
  spec?: string | string[];
  
  /**
   * Pattern for e2e (browser) tests
   * @default '**\/*.e2e.{ts,tsx}'
   */
  e2e?: string | string[];
}

/**
 * Loader configuration for Stencil components
 */
export interface LoaderConfig {
  /**
   * Type of loader to use
   * @default 'lazy'
   */
  type?: LoaderType;
  
  /**
   * Custom loader module path (for type: 'custom-elements' or custom loaders)
   */
  modulePath?: string;
  
  /**
   * Additional loader options
   */
  options?: Record<string, any>;
}

/**
 * Project configuration for a specific test runtime and environment
 */
export interface ProjectConfig {
  /**
   * Test runtime - where tests execute
   * @default 'node'
   */
  runtime?: TestRuntime;
  
  /**
   * Environment to use (depends on runtime)
   * - For node: 'mock-doc' | 'jsdom' | 'happy-dom'
   * - For browser: 'chromium' | 'firefox' | 'webkit'
   * @default 'mock-doc' for node, 'chromium' for browser
   */
  environment?: NodeEnvironment | BrowserName;
  
  /**
   * Test file patterns for this project
   */
  include?: string | string[];
  
  /**
   * Files to exclude
   */
  exclude?: string | string[];
  
  /**
   * Additional Vitest configuration to merge
   */
  vitest?: VitestUserConfig;
}

/**
 * Configuration for @stencil/testing
 */
export interface StencilTestingConfig {
  /**
   * Path to stencil.config.ts
   * @default 'stencil.config.ts'
   */
  stencilConfig?: string | StencilConfig;
  
  /**
   * Projects configuration - allows multiple test environments in one config
   * Similar to Nuxt's test-utils approach
   * 
   * @example
   * ```ts
   * projects: [
   *   { runtime: 'node', environment: 'mock-doc', include: ['**\/*.spec.tsx'] },
   *   { runtime: 'browser', environment: 'playwright', include: ['**\/*.e2e.tsx'] }
   * ]
   * ```
   */
  projects?: ProjectConfig[];
  
  /**
   * Legacy: Test environment for spec tests (deprecated - use projects instead)
   * @deprecated Use projects configuration instead
   * @default 'mock-doc'
   */
  environment?: NodeEnvironment;
  
  /**
   * Legacy: Browser environment for e2e tests (deprecated - use projects instead)
   * @deprecated Use projects configuration instead
   */
  browserEnvironment?: BrowserProvider;
  
  /**
   * Legacy: Test file patterns (deprecated - use projects instead)
   * @deprecated Use projects configuration instead
   */
  patterns?: TestPatterns;
  
  /**
   * Loader configuration
   */
  loader?: LoaderConfig;
  
  /**
   * Additional Vitest configuration to merge
   */
  vitest?: VitestUserConfig;
}

/**
 * Component render options
 */
export interface RenderOptions {
  /**
   * Props to pass to the component
   */
  props?: Record<string, any>;
  
  /**
   * Slots content (for shadow DOM components)
   */
  slots?: Record<string, string | HTMLElement>;
  
  /**
   * HTML content to place inside the component
   */
  html?: string;
  
  /**
   * Wait for component to be loaded before returning
   * @default true
   */
  waitForLoad?: boolean;
  
  /**
   * Additional HTML attributes
   */
  attributes?: Record<string, string>;
}

/**
 * Render result for component testing
 */
export interface RenderResult<T = HTMLElement> {
  /**
   * The rendered component element
   */
  root: T;
  
  /**
   * Wait for changes to be applied
   */
  waitForChanges: () => Promise<void>;
  
  /**
   * Get the component instance (if available)
   */
  instance?: any;
  
  /**
   * Update component props
   */
  setProps: (props: Record<string, any>) => Promise<void>;
  
  /**
   * Unmount/cleanup the component
   */
  unmount: () => void;
}
