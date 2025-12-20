/**
 * Setup jsdom environment for Stencil component testing
 * 
 * This module provides polyfills and initialization for testing Stencil components
 * in a jsdom environment. It handles:
 * - Polyfilling adoptedStyleSheets for Shadow DOM
 * - Polyfilling CSS support detection
 * - Loading and initializing Stencil lazy loader
 * 
 * @example
 * ```ts
 * // vitest.config.ts
 * export default defineVitestConfig({
 *   test: {
 *     setupFiles: ['@stencil/test-utils/jsdom-setup'],
 *   },
 * });
 * ```
 */

/**
 * Setup adoptedStyleSheets polyfill for jsdom
 * jsdom doesn't support adoptedStyleSheets which Stencil uses for Shadow DOM styling
 */
function setupAdoptedStyleSheetsPolyfill() {
  // Polyfill for Document
  if (!document.adoptedStyleSheets) {
    Object.defineProperty(document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  // Polyfill for ShadowRoot
  if (typeof ShadowRoot !== 'undefined' && !ShadowRoot.prototype.hasOwnProperty('adoptedStyleSheets')) {
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
      get() {
        if (!this._adoptedStyleSheets) {
          this._adoptedStyleSheets = [];
        }
        return this._adoptedStyleSheets;
      },
      set(value) {
        this._adoptedStyleSheets = value;
      },
      configurable: true,
    });
  }
}

/**
 * Setup CSS polyfill for jsdom
 * jsdom doesn't have window.CSS which Stencil checks for CSS support
 */
function setupCSSPolyfill() {
  if (!window.CSS) {
    (window as any).CSS = {
      supports: () => true,
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

  setupAdoptedStyleSheetsPolyfill();
  setupCSSPolyfill();
}

// Auto-run setup when imported
setup();

