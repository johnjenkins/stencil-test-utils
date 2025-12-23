/**
 * Setup jsdom environment for Stencil component testing
 *
 * This module provides polyfills and initialization for testing Stencil components
 * in a jsdom environment. It handles:
 * - Polyfilling adoptedStyleSheets for Shadow DOM
 * - Polyfilling CSS support detection
 * - Polyfilling requestAnimationFrame and related APIs
 * - Loading and initializing Stencil lazy loader
 *
 * @example
 * ```ts
 * // vitest.config.ts
 * export default defineVitestConfig({
 *   test: {
 *     setupFiles: ['@johnjenkins/stencil-vitest/jsdom-setup'],
 *   },
 * });
 * ```
 */

/**
 * Apply polyfills to a jsdom window object for Stencil components
 * This function is reused by both the setup file and the custom environment
 */
export function applyJsdomPolyfills(window: Window & typeof globalThis) {
  // Polyfill adoptedStyleSheets for Shadow DOM
  if (!window.document.adoptedStyleSheets) {
    Object.defineProperty(window.document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  if (
    typeof window.ShadowRoot !== 'undefined' &&
    !Object.prototype.hasOwnProperty.call(window.ShadowRoot.prototype, 'adoptedStyleSheets')
  ) {
    Object.defineProperty(window.ShadowRoot.prototype, 'adoptedStyleSheets', {
      get() {
        if (!(this as any)._adoptedStyleSheets) {
          (this as any)._adoptedStyleSheets = [];
        }
        return (this as any)._adoptedStyleSheets;
      },
      set(value) {
        (this as any)._adoptedStyleSheets = value;
      },
      configurable: true,
    });
  }

  // Polyfill CSS support
  if (!window.CSS) {
    (window as any).CSS = {
      supports: () => true,
    };
  }

  // Polyfill scrollTo
  window.scrollTo = () => {};

  // Add requestAnimationFrame and related APIs
  if (!window.requestAnimationFrame) {
    (window as any).requestAnimationFrame = (cb: any) => {
      return setTimeout(cb, 0) as any;
    };
  }
  if (!window.cancelAnimationFrame) {
    (window as any).cancelAnimationFrame = (id: any) => {
      clearTimeout(id);
    };
  }
  if (!(window as any).requestIdleCallback) {
    (window as any).requestIdleCallback = (cb: any) => {
      return setTimeout(cb, 0) as any;
    };
  }
  if (!(window as any).cancelIdleCallback) {
    (window as any).cancelIdleCallback = (id: any) => {
      clearTimeout(id);
    };
  }
}

/**
 * Initialize jsdom environment for Stencil testing
 */
export async function setup() {
  // Only run in jsdom environment (Node.js with DOM)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Skip if running in actual browser (Playwright, WebdriverIO, etc.)
  // In actual browsers, process is undefined or doesn't have cwd
  if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
    return;
  }

  applyJsdomPolyfills(window as any);
}

// Auto-run setup when imported
setup();
