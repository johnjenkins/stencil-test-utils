/**
 * Custom matchers for Stencil component testing
 * 
 * These extend Vitest's expect with Stencil-specific assertions
 */

import type { RenderResult } from '../types.js';

/**
 * Custom matchers interface
 */
interface CustomMatchers<R = unknown> {
  toHaveClass(className: string): R;
  toHaveAttribute(attribute: string, value?: string): R;
  toHaveProperty(property: string, value?: any): R;
  toHaveTextContent(text: string): R;
  toBeVisible(): R;
  toHaveShadowRoot(): R;
  toEmitEvent(eventName: string): R;
}

// Extend Vitest types if available
declare global {
  namespace Vi {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

/**
 * Check if element has a class
 */
export function toHaveClass(
  received: HTMLElement,
  className: string
): { pass: boolean; message: () => string } {
  const pass = received.classList.contains(className);
  
  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have class "${className}"`
        : `Expected element to have class "${className}"`,
  };
}

/**
 * Check if element has an attribute
 */
export function toHaveAttribute(
  received: HTMLElement,
  attribute: string,
  value?: string
): { pass: boolean; message: () => string } {
  const hasAttribute = received.hasAttribute(attribute);
  
  if (!hasAttribute) {
    return {
      pass: false,
      message: () => `Expected element to have attribute "${attribute}"`,
    };
  }
  
  if (value !== undefined) {
    const actualValue = received.getAttribute(attribute);
    const pass = actualValue === value;
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have attribute "${attribute}" with value "${value}"`
          : `Expected element to have attribute "${attribute}" with value "${value}", but got "${actualValue}"`,
    };
  }
  
  return {
    pass: true,
    message: () => `Expected element not to have attribute "${attribute}"`,
  };
}

/**
 * Check if element has a property
 */
export function toHaveProperty(
  received: any,
  property: string,
  value?: any
): { pass: boolean; message: () => string } {
  const hasProperty = property in received;
  
  if (!hasProperty) {
    return {
      pass: false,
      message: () => `Expected element to have property "${property}"`,
    };
  }
  
  if (value !== undefined) {
    const actualValue = received[property];
    const pass = actualValue === value;
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have property "${property}" with value ${JSON.stringify(value)}`
          : `Expected element to have property "${property}" with value ${JSON.stringify(value)}, but got ${JSON.stringify(actualValue)}`,
    };
  }
  
  return {
    pass: true,
    message: () => `Expected element not to have property "${property}"`,
  };
}

/**
 * Check if element has text content
 */
export function toHaveTextContent(
  received: HTMLElement,
  text: string
): { pass: boolean; message: () => string } {
  const actualText = received.textContent || '';
  const pass = actualText.includes(text);
  
  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have text content "${text}"`
        : `Expected element to have text content "${text}", but got "${actualText}"`,
  };
}

/**
 * Check if element is visible
 */
export function toBeVisible(
  received: HTMLElement
): { pass: boolean; message: () => string } {
  const style = window.getComputedStyle(received);
  const pass =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0';
  
  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to be visible`
        : `Expected element to be visible`,
  };
}

/**
 * Check if element has shadow root
 */
export function toHaveShadowRoot(
  received: HTMLElement
): { pass: boolean; message: () => string } {
  const pass = !!received.shadowRoot;
  
  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have shadow root`
        : `Expected element to have shadow root`,
  };
}

/**
 * Install custom matchers
 */
export function installMatchers() {
  try {
    const expectGlobal = (globalThis as any).expect;
    if (expectGlobal && typeof expectGlobal.extend === 'function') {
      expectGlobal.extend({
        toHaveClass,
        toHaveAttribute,
        toHaveProperty,
        toHaveTextContent,
        toBeVisible,
        toHaveShadowRoot,
      });
    }
  } catch {
    // expect not available in build context
  }
}
