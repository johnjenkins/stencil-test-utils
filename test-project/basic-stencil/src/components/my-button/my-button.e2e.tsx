/**
 * Browser tests for my-button component
 * These tests run in a real browser using Playwright
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@stencil/test-utils';
import { h } from '@stencil/core';

// Test cleanup tracking
let containers: HTMLElement[] = [];

afterEach(() => {
  // Cleanup all rendered containers
  containers.forEach(container => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });
  containers = [];
});

describe('my-button - browser tests', () => {
  describe('rendering in real browser', () => {
    it('should render button in DOM', async () => {
      const { root } = await render(<my-button>Click me</my-button>);

      expect(root).toBeTruthy();
      expect(root.textContent).toBe('Click me');
      
      if (root.parentElement) containers.push(root.parentElement);
    });

    it('should have shadow DOM', async () => {
      const { root } = await render(<my-button variant="primary">Primary Button</my-button>);

      // Check shadow root exists
      expect(root.shadowRoot).toBeTruthy();

      // Check shadow DOM content
      const shadowButton = root.shadowRoot?.querySelector('button');
      expect(shadowButton).toBeTruthy();
      expect(shadowButton?.classList.contains('button--primary')).toBe(true);
      
      if (root.parentElement) containers.push(root.parentElement);
    });

    it('should handle click events', async () => {
      const { root } = await render(<my-button>Click me</my-button>);

      let clicked = false;
      root.addEventListener('buttonClick', () => {
        clicked = true;
      });

      // Click the shadow button
      const shadowButton = root.shadowRoot?.querySelector('button');
      shadowButton?.click();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(clicked).toBe(true);
      
      if (root.parentElement) containers.push(root.parentElement);
    });
  });
});
