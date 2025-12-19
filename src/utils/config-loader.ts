import type { Config as StencilConfig } from '@stencil/core/internal';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Load Stencil configuration from a file path
 * Uses jiti to handle TypeScript files in Node.js
 */
export async function loadStencilConfig(configPath: string): Promise<StencilConfig | undefined> {
  const resolvedPath = resolve(process.cwd(), configPath);
  
  if (!existsSync(resolvedPath)) {
    console.warn(`Stencil config not found at ${resolvedPath}`);
    return undefined;
  }

  try {
    // Use jiti for loading TypeScript configs in Node.js
    const { createJiti } = await import('jiti');
    const jiti = createJiti(import.meta.url, {
      interopDefault: true,
      moduleCache: false,
    });
    
    const configModule = jiti(resolvedPath);
    return configModule.config || configModule.default || configModule;
  } catch (error) {
    console.error(`Failed to load Stencil config from ${resolvedPath}:`, error);
    return undefined;
  }
}

/**
 * Get the output directory from Stencil config
 */
export function getStencilOutputDir(config?: StencilConfig): string {
  const distTarget = config?.outputTargets?.find((t: any) => t.type === 'dist');
  return (distTarget as any)?.dir || 'dist';
}

/**
 * Get the source directory from Stencil config
 */
export function getStencilSrcDir(config?: StencilConfig): string {
  return config?.srcDir || 'src';
}
