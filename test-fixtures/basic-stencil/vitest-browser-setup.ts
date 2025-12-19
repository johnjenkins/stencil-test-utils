/**
 * Vitest setup for browser environment
 * Extends the base setup and loads Stencil components in the browser
 */

// Load the Stencil components for this project
const { defineCustomElements } = await import('./dist/esm/loader.js');
await defineCustomElements();

export {};
