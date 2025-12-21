/**
 * Tests demonstrating new matchers:
 * - toHaveClasses
 * - toMatchClasses
 * - toEqualAttributes
 * - toEqualText
 */
import { describe, it, expect } from 'vitest';
import { render } from '@stencil/test-utils';
import { h } from '@stencil/core';

describe('my-button - new matchers', () => {
  describe('toHaveClasses', () => {
    it('should pass when element has all specified classes', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(button).toHaveClasses(['button', 'button--primary', 'button--medium']);
    });

    it('should fail when element is missing one or more classes', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(() => {
        expect(button).toHaveClasses(['button', 'missing-class']);
      }).toThrow();
    });
  });

  describe('toMatchClasses', () => {
    it('should pass when element has exactly the specified classes', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      // toMatchClasses checks for exact match (no more, no less)
      expect(button).toMatchClasses(['button', 'button--primary', 'button--medium']);
    });

    it('should fail when element has extra classes', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(() => {
        // This will fail because button has more classes than just 'button'
        expect(button).toMatchClasses(['button']);
      }).toThrow();
    });
  });

  describe('toEqualAttribute', () => {
    it('should pass when attribute value matches exactly', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(button).toEqualAttribute('type', 'button');
      expect(button).toEqualAttribute('class', 'button button--primary button--medium');
    });

    it('should fail when attribute value does not match', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(() => {
        expect(button).toEqualAttribute('type', 'submit');
      }).toThrow();
    });
  });

  describe('toEqualAttributes', () => {
    it('should pass when all attributes match exactly', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(button).toEqualAttributes({
        class: 'button button--primary button--medium',
        type: 'button',
      });
    });

    it('should fail when attributes do not match', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(() => {
        expect(button).toEqualAttributes({
          class: 'wrong-class',
          type: 'button',
        });
      }).toThrow();
    });

    it('should fail when expected attribute is missing', async () => {
      const { root } = await render(<my-button variant="primary">Test</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      expect(() => {
        expect(button).toEqualAttributes({
          type: 'button',
          'data-missing': 'value',
        });
      }).toThrow();
    });
  });

  describe('toEqualText', () => {
    it('should pass when text content matches exactly (trimmed)', async () => {
      const { root } = await render(<my-button>Click Me</my-button>);

      expect(root).toEqualText('Click Me');
    });

    it('should trim whitespace before comparing', async () => {
      const { root } = await render(<my-button>  Spaced Out  </my-button>);

      expect(root).toEqualText('Spaced Out');
    });

    it('should fail when text does not match', async () => {
      const { root } = await render(<my-button>Click Me</my-button>);

      expect(() => {
        expect(root).toEqualText('Different Text');
      }).toThrow();
    });
  });

  describe('combined usage', () => {
    it('should allow using multiple new matchers together', async () => {
      const { root } = await render(<my-button variant="primary">Submit</my-button>);
      const button = root.shadowRoot?.querySelector('button');

      // Test multiple matchers
      expect(button).toHaveClasses(['button', 'button--primary']);
      expect(button).toMatchClasses(['button', 'button--primary', 'button--medium']);
      expect(button).toEqualAttribute('type', 'button');
      expect(button).toEqualAttributes({
        type: 'button',
        class: 'button button--primary button--medium',
      });
      
      // Check text on the root element (light DOM contains the text)
      expect(root).toEqualText('Submit');
    });
  });
});
