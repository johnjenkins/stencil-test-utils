/**
 * Setup file for @stencil/testing
 * This file is automatically loaded by Vitest before running tests
 */

import { installMatchers } from './testing/matchers.js';

// Setup mock-doc if it's the environment
if (typeof global !== 'undefined' && !global.window) {
  try {
    // Try to use Stencil's mock-doc
    const { MockDocument } = require('@stencil/core/mock-doc');
    
    const doc = new MockDocument();
    const win = doc.defaultView;
    
    // Assign globals
    global.document = doc;
    global.window = win as any;
    global.navigator = win.navigator;
    global.HTMLElement = win.HTMLElement as any;
    global.CustomEvent = win.CustomEvent as any;
    global.Event = win.Event as any;
    
    console.log('✓ Mock-doc environment initialized');
  } catch (error) {
    console.warn('Mock-doc not available, falling back to node environment');
  }
}

// Install custom matchers for Stencil components
installMatchers();

// Cleanup after each test (will be available when running in vitest)
try {
  if (typeof (globalThis as any).afterEach === 'function') {
    (globalThis as any).afterEach(() => {
      // Clean up DOM
      if (typeof document !== 'undefined' && document.body) {
        document.body.innerHTML = '';
      }
    });
  }
} catch {
  // afterEach not available in build context
}

export {};
