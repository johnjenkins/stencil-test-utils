/**
 * Setup for mock-doc environment
 * This file is automatically loaded when using the mock-doc environment in Node.js
 * 
 * IMPORTANT: This should only be imported/executed in Node.js runtime, not in browsers.
 * The projects-based config ensures this is only loaded for node:mock-doc projects.
 */
import { MockWindow } from '@stencil/core/mock-doc';

// Only setup mock-doc if we're actually in Node.js (not a real browser)
// Check for Node.js-specific globals that don't exist in browsers
const isNodeEnvironment = typeof process !== 'undefined' && 
  process?.versions?.node !== undefined &&
  typeof window === 'undefined';

let win: any;
let doc: any;

if (!isNodeEnvironment) {
  // We're in a real browser, skip mock-doc setup and export real globals
  console.warn('[mock-doc-setup] Skipping mock-doc setup - running in real browser environment');
  win = typeof window !== 'undefined' ? window : undefined;
  doc = typeof document !== 'undefined' ? document : undefined;
} else {
  // We're in Node.js, setup mock-doc
  // Create mock window and document FIRST
  win = new MockWindow('http://localhost:3000/');
  doc = win.document;

  // Set baseURI manually
  Object.defineProperty(doc, 'baseURI', {
    value: 'http://localhost:3000/',
    writable: false,
    configurable: true
  });

  // Assign to globalThis BEFORE importing the loader
  globalThis.window = win as any;
  globalThis.document = doc as any;
  globalThis.HTMLElement = win.HTMLElement as any;
  globalThis.CustomEvent = win.CustomEvent as any;
  globalThis.Event = win.Event as any;
  globalThis.Element = win.Element as any;
  globalThis.Node = win.Node as any;
  globalThis.DocumentFragment = win.DocumentFragment as any;

  // Add requestAnimationFrame and related APIs
  globalThis.requestAnimationFrame = (cb: any) => {
    return setTimeout(cb, 0) as any;
  };
  globalThis.cancelAnimationFrame = (id: any) => {
    clearTimeout(id);
  };
}

// Export the mock window for use in custom setup
export { win, doc };

