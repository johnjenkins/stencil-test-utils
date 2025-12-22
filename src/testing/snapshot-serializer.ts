/**
 * Custom snapshot serializer for Stencil components
 *
 * Formats HTMLElements with shadow DOM using the same serialization
 * as our toEqualHtml matcher, ensuring consistent <mock:shadow-root> output
 */

import type { SnapshotSerializer } from 'vitest';
import { expect } from 'vitest';
import { serializeHtml } from './html-serializer.js';

/**
 * Vitest snapshot serializer for Stencil components
 */
export const StencilSnapshotSerializer: SnapshotSerializer = {
  /**
   * Test if this serializer should handle the value
   */
  test(val: any): boolean {
    // Handle HTMLElement with shadow DOM (Stencil components)
    if (val && typeof val === 'object') {
      // Check if it's an HTMLElement with shadowRoot
      if ('shadowRoot' in val && val.shadowRoot) {
        return true;
      }

      // Check if it's an HTMLElement (could be Stencil component that hasn't hydrated yet)
      if ('nodeType' in val && val.nodeType === 1 && 'tagName' in val) {
        // Only serialize custom elements (Stencil components typically have hyphens)
        const tagName = val.tagName?.toLowerCase();
        return tagName && tagName.includes('-');
      }
    }

    return false;
  },

  /**
   * Serialize the value for snapshot
   */
  serialize(val: any): string {
    return serializeHtml(val, {
      serializeShadowRoot: true,
      pretty: true,
      excludeStyles: true,
    });
  },
};

/**
 * Default export for convenience
 */
export default StencilSnapshotSerializer;

export function installMatchers() {
  expect.addSnapshotSerializer(StencilSnapshotSerializer);
}

installMatchers();
