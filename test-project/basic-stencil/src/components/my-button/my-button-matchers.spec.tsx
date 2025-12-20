import { describe, it, expect } from 'vitest';
import { render, toEqualHtml, toEqualLightHtml } from '@stencil/test-utils';
import { h } from '@stencil/core';

// Extend expect with our custom matchers
// This MUST be done at module level after expect is imported
expect.extend({
  toEqualHtml,
  toEqualLightHtml,
});

describe('my-button - custom matchers', () => {
  describe('toEqualHtml', () => {
    it('should match complete HTML including shadow DOM', async () => {
      const { root, waitForChanges } = await render(
        <my-button variant="primary">Click me</my-button>
      );

      await waitForChanges();

      expect(root).toEqualHtml(`
        <my-button class="hydrated">
          <template shadowrootmode="open">
            <button class="button button--medium button--primary" type="button">
              <slot></slot>
            </button>
          </template>
        </my-button>
      `);
    });

    it('should match HTML with different variants', async () => {
      const { root, waitForChanges } = await render(
        <my-button variant="secondary" size="small">Small</my-button>
      );

      await waitForChanges();

      expect(root).toEqualHtml(`
        <my-button class="hydrated">
          <template shadowrootmode="open">
            <button class="button button--secondary button--small" type="button">
              <slot></slot>
            </button>
          </template>
        </my-button>
      `);
    });

    it('should match disabled button', async () => {
      const { root, waitForChanges } = await render(
        <my-button disabled>Disabled</my-button>
      );

      await waitForChanges();

      expect(root).toEqualHtml(`
        <my-button class="hydrated">
          <template shadowrootmode="open">
            <button class="button button--medium button--primary" disabled="" type="button">
              <slot></slot>
            </button>
          </template>
        </my-button>
      `);
    });

    it('should fail when HTML does not match', async () => {
      const { root, waitForChanges } = await render(
        <my-button>Test</my-button>
      );

      await waitForChanges();

      expect(() => {
        expect(root).toEqualHtml(`
          <my-button>
            <template shadowrootmode="open">
              <button class="wrong-class">
                <slot></slot>
              </button>
            </template>
          </my-button>
        `);
      }).toThrow();
    });
  });

  describe('toEqualLightHtml', () => {
    it('should match light DOM only (no shadow DOM)', async () => {
      const { root, waitForChanges } = await render(
        <my-button variant="primary">Click me</my-button>
      );

      await waitForChanges();

      expect(root).toEqualLightHtml(`
        <my-button class="hydrated">
        </my-button>
      `);
    });

    it('should match light DOM with slot content', async () => {
      const { root, waitForChanges } = await render(
        <my-button><span>Slotted content</span></my-button>
      );

      await waitForChanges();

      expect(root).toEqualLightHtml(`
        <my-button class="hydrated">
          <span></span>
        </my-button>
      `);
    });

    it('should not include shadow DOM in comparison', async () => {
      const { root, waitForChanges } = await render(
        <my-button>Test</my-button>
      );

      await waitForChanges();

      // This should NOT include the <button> from shadow DOM
      expect(root).toEqualLightHtml(`
        <my-button class="hydrated">
        </my-button>
      `);
    });

    it('should fail when light DOM does not match', async () => {
      const { root, waitForChanges } = await render(
        <my-button variant="primary">Test</my-button>
      );

      await waitForChanges();

      expect(() => {
        expect(root).toEqualLightHtml(`
          <my-button class="different">
          </my-button>
        `);
      }).toThrow();
    });
  });

  describe('toEqualHtml with nested components', () => {
    it('should match card with nested button', async () => {
      const { root, waitForChanges } = await render(
        <my-card cardTitle="Test Card">
          <p>Card content</p>
          <my-button slot="footer" variant="primary">Action</my-button>
        </my-card>
      );

      await waitForChanges();

      expect(root).toEqualHtml(`
        <my-card class="hydrated">
          <template shadowrootmode="open">
            <div class="card card--elevation-1">
              <div class="card__header">
                <h3 class="card__title">
                  Test Card
                </h3>
                <slot name="header-actions"></slot>
              </div>
              <div class="card__content">
                <slot></slot>
              </div>
              <div class="card__footer">
                <slot name="footer"></slot>
              </div>
            </div>
          </template>
          <p></p>
          <my-button class="hydrated" slot="footer" variant="primary">
            <template shadowrootmode="open">
              <button class="button button--medium button--primary" type="button">
                <slot></slot>
              </button>
            </template>
          </my-button>
        </my-card>
      `);
    });
  });

  describe('HTML string comparison', () => {
    it('should compare two HTML strings', () => {
      const html1 = '<div class="test"><span>Hello</span></div>';
      const html2 = '<div class="test"><span>Hello</span></div>';

      expect(html1).toEqualHtml(html2);
    });

    it('should normalize whitespace when comparing', () => {
      const html1 = '<div class="test">   <span>Hello</span>   </div>';
      const html2 = '<div class="test"><span>Hello</span></div>';

      expect(html1).toEqualHtml(html2);
    });

    it('should fail when HTML strings differ', () => {
      const html1 = '<div class="test"><span>Hello</span></div>';
      const html2 = '<div class="different"><span>Hello</span></div>';

      expect(() => {
        expect(html1).toEqualHtml(html2);
      }).toThrow();
    });
  });
});
