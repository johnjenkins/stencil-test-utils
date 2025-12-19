/**
 * Example test file showing how to use @stencil/testing
 * 
 * This would typically live in your component directory:
 * src/components/my-button/my-button.spec.tsx
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, type RenderResult } from '@stencil/testing';
import { h, Fragment } from '@stencil/core';

// Mock component for demonstration
class MyButton {}

describe('my-button', () => {
  let result: RenderResult;

  beforeEach(async () => {
    result = await render(<my-button variant="primary" />);
  });

  it('renders correctly', () => {
    expect(result.root).toBeTruthy();
  });

  it('applies variant class', () => {
    expect(result.root.classList.contains('button--primary')).toBe(true);
  });

  it('updates on prop change', async () => {
    await result.setProps({ variant: 'secondary' });
    await result.waitForChanges();
    
    expect(result.root.classList.contains('button--secondary')).toBe(true);
  });

  it('renders slot content', async () => {
    const { root } = await render(<my-button>Click Me</my-button>);
    
    expect(root.textContent).toContain('Click Me');
  });

  it('handles click events', async () => {
    let clicked = false;
    result.root.addEventListener('click', () => {
      clicked = true;
    });
    
    result.root.click();
    await result.waitForChanges();
    
    expect(clicked).toBe(true);
  });
});

describe('my-button (e2e)', () => {
  it('renders in browser', async () => {
    const { root } = await render(MyButton, {
      props: { variant: 'primary' }
    });
    
    // This would run in a real browser with playwright/webdriverio
    expect(root.shadowRoot).toBeTruthy();
  });

  it('is keyboard accessible', async () => {
    const { root } = await render(MyButton);
    
    // Tab to focus
    root.focus();
    expect(document.activeElement).toBe(root);
    
    // Enter to click
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    root.dispatchEvent(event);
    
    // Verify interaction
  });
});
