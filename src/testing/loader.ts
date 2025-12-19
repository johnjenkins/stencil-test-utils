import type { LoaderConfig, LoaderType } from '../types.js';

/**
 * Load Stencil components using the specified loader
 */
export async function loadComponents(config: LoaderConfig = {}) {
  const { type = 'lazy', modulePath, options = {} } = config;
  
  switch (type) {
    case 'lazy':
      return loadLazyComponents(modulePath, options);
    
    case 'custom-elements':
      return loadCustomElements(modulePath, options);
    
    case 'dist':
      return loadDistComponents(modulePath, options);
    
    case 'hydrate':
      return loadHydrateComponents(modulePath, options);
    
    default:
      throw new Error(`Unknown loader type: ${type}`);
  }
}

/**
 * Load components using the lazy loader (dist/esm)
 */
async function loadLazyComponents(modulePath?: string, options: Record<string, any> = {}) {
  const loaderPath = modulePath || './dist/esm/loader.js';
  
  try {
    const { defineCustomElements } = await import(loaderPath);
    
    if (typeof defineCustomElements === 'function') {
      await defineCustomElements(window, options);
    }
    
    return { type: 'lazy' as LoaderType, loaded: true };
  } catch (error) {
    console.error(`Failed to load lazy components from ${loaderPath}:`, error);
    throw error;
  }
}

/**
 * Load components using custom elements bundle
 */
async function loadCustomElements(modulePath?: string, options: Record<string, any> = {}) {
  const elementsPath = modulePath || './dist/components/index.js';
  
  try {
    const components = await import(elementsPath);
    
    // If there's a defineCustomElements function, use it
    if (typeof components.defineCustomElements === 'function') {
      await components.defineCustomElements(window, options);
    }
    
    return { type: 'custom-elements' as LoaderType, loaded: true, components };
  } catch (error) {
    console.error(`Failed to load custom elements from ${elementsPath}:`, error);
    throw error;
  }
}

/**
 * Load components from dist output
 */
async function loadDistComponents(modulePath?: string, options: Record<string, any> = {}) {
  const distPath = modulePath || './dist/index.js';
  
  try {
    const components = await import(distPath);
    return { type: 'dist' as LoaderType, loaded: true, components };
  } catch (error) {
    console.error(`Failed to load dist components from ${distPath}:`, error);
    throw error;
  }
}

/**
 * Load components for hydrate/SSR testing
 */
async function loadHydrateComponents(modulePath?: string, options: Record<string, any> = {}) {
  const hydratePath = modulePath || './dist/hydrate/index.js';
  
  try {
    const hydrate = await import(hydratePath);
    return { type: 'hydrate' as LoaderType, loaded: true, hydrate };
  } catch (error) {
    console.error(`Failed to load hydrate components from ${hydratePath}:`, error);
    throw error;
  }
}

/**
 * Setup component loader for tests
 */
export async function setupLoader(config: LoaderConfig = {}) {
  try {
    const result = await loadComponents(config);
    console.log(`Components loaded successfully using ${result.type} loader`);
    return result;
  } catch (error) {
    console.warn('Failed to load components. Tests may not work correctly.');
    console.warn('Make sure your Stencil project is built before running tests.');
    throw error;
  }
}
