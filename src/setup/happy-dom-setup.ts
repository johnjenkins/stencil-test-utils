/**
 * Setup file for happy-dom environment
 * Auto-loaded when using a project named 'happy-dom' or containing 'happy-dom'
 *
 * Configures happy-dom with Stencil-specific setup
 * happy-dom generally has better built-in support than jsdom, so fewer polyfills are needed
 */

/**
 * Main setup function for happy-dom environment
 */
export async function setup() {
  // happy-dom is generally more complete than jsdom out of the box
  // Add polyfills here as needed when issues are discovered
}

// Auto-run setup
setup();
