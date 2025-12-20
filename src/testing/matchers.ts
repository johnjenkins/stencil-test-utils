/**
 * Custom matchers for Stencil component testing
 * 
 * These extend Vitest's expect with Stencil-specific assertions
 */

import { expect } from 'vitest';

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
  toEqualHtml(expectedHtml: string): R;
  toEqualLightHtml(expectedHtml: string): R;
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
 * Serialize HTML element to string
 * Works across mock-doc, jsdom, and happy-dom environments
 */
function serializeHtml(
  input: HTMLElement | ShadowRoot | DocumentFragment,
  options: {
    serializeShadowRoot?: boolean;
    pretty?: boolean;
    excludeStyles?: boolean;
  } = {}
): string {
  const { serializeShadowRoot = true, pretty = true, excludeStyles = true } = options;

  // Try to use mock-doc serializer if available (best option)
  try {
    const mockDoc = require('@stencil/core/mock-doc');
    if (mockDoc.serializeNodeToHtml) {
      let html = mockDoc.serializeNodeToHtml(input, {
        prettyHtml: pretty,
        outerHtml: true,
        serializeShadowRoot,
        excludeTags: ['body'],
        removeHtmlComments: false,
      });
      
      // Remove style tags if requested
      if (excludeStyles) {
        html = html.replace(/<style[^>]*>[\s\S]*?<\/style>\s*/gi, '');
      }
      
      return html;
    }
  } catch {
    // mock-doc not available, use manual serialization
  }

  // Fallback: Manual serialization for jsdom/happy-dom
  let html = '';
  
  if ('innerHTML' in input) {
    html = (input as HTMLElement).outerHTML || (input as any).innerHTML || '';
  } else if ('innerHTML' in (input as any)) {
    html = (input as any).innerHTML || '';
  }
  
  // Remove style tags if requested
  if (excludeStyles) {
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>\s*/gi, '');
  }

  // Serialize shadow DOM if requested
  if (serializeShadowRoot && 'shadowRoot' in input && input.shadowRoot) {
    const shadowHtml = input.shadowRoot.innerHTML;
    // Insert shadow content in a template tag to represent shadow DOM
    html = html.replace('</host>', `<template shadowrootmode="open">${shadowHtml}</template></host>`);
  }

  if (pretty) {
    return prettifyHtml(html);
  }

  return html;
}

/**
 * Custom HTML prettifier
 */
function prettifyHtml(html: string): string {
  const indentSize = 2;
  let indentLevel = 0;
  const lines: string[] = [];

  // Normalize whitespace and collapse empty tags
  html = html.replace(/\s+/g, ' ').replace(/>\s*</g, '><').trim();
  // Keep empty tags on one line
  html = html.replace(/<(\w+)([^>]*)>\s*<\/\1>/g, '<$1$2></$1>');

  // Split on tag boundaries
  const parts = html.split(/(<[^>]*>)/);
  
  let i = 0;
  while (i < parts.length) {
    const part = parts[i].trim();
    i++;
    
    if (!part) continue;

    if (part.startsWith('<')) {
      // This is a tag
      if (part.startsWith('</')) {
        // Closing tag
        // Check if previous line was the opening tag (empty element)
        const tagName = part.match(/<\/(\w+)/)?.[1];
        const lastLine = lines[lines.length - 1];
        if (lastLine && tagName && lastLine.trim().match(new RegExp(`^<${tagName}[^>]*>$`))) {
          // Empty element - append closing tag to same line
          lines[lines.length - 1] = lastLine + part;
        } else {
          // Decrease indent before adding
          indentLevel = Math.max(0, indentLevel - 1);
          lines.push(' '.repeat(indentLevel * indentSize) + part);
        }
      } else if (part.endsWith('/>')) {
        // Self-closing tag
        lines.push(' '.repeat(indentLevel * indentSize) + part);
      } else {
        // Opening tag
        lines.push(' '.repeat(indentLevel * indentSize) + part);
        
        // Check if this is a void element
        const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        const tagName = part.match(/<(\w+)/)?.[1]?.toLowerCase();
        if (!tagName || !voidElements.includes(tagName)) {
          indentLevel++;
        }
      }
    } else {
      // Text content
      if (part) {
        lines.push(' '.repeat(indentLevel * indentSize) + part);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Parse HTML string to fragment
 */
function parseHtmlFragment(html: string): DocumentFragment {
  // Try mock-doc parser first
  try {
    const mockDoc = require('@stencil/core/mock-doc');
    if (mockDoc.parseHtmlToFragment) {
      return mockDoc.parseHtmlToFragment(html);
    }
  } catch {
    // Fall through to standard parser
  }

  // Use standard DOM parser (works in jsdom/happy-dom)
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

/**
 * Custom matcher to check if an element's HTML matches the expected HTML
 * Serializes the entire component tree including shadow DOM
 */
export function toEqualHtml(
  received: string | HTMLElement | ShadowRoot,
  expected: string
): { pass: boolean; message: () => string } {
  if (received == null) {
    throw new Error(`expect.toEqualHtml() received value is "${received}"`);
  }

  if (typeof (received as any).then === 'function') {
    throw new TypeError(
      `Element must be a resolved value, not a promise, before it can be tested`
    );
  }

  let receivedHtml: string;

  // Serialize the received value
  if (typeof received === 'string') {
    const fragment = parseHtmlFragment(received);
    // For string inputs, use innerHTML to avoid template wrapper
    receivedHtml = ((fragment as any).innerHTML || fragment.textContent || '');
  } else if ((received as any).nodeType === 11) {
    // Document fragment
    receivedHtml = serializeHtml(received as any, { serializeShadowRoot: true });
  } else if ((received as any).nodeType === 1) {
    // Element node
    receivedHtml = serializeHtml(received as HTMLElement, { serializeShadowRoot: true });
  } else {
    throw new TypeError(
      `expect.toEqualHtml() value should be an element, shadow root, or string`
    );
  }

  // Parse and serialize expected HTML for consistent formatting  
  const expectedFragment = parseHtmlFragment(expected);
  let expectedHtml = (expectedFragment as any).innerHTML || expectedFragment.textContent || '';
  // Normalize whitespace for comparison - collapse multiple spaces/newlines
  expectedHtml = expectedHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  receivedHtml = receivedHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

  const pass = receivedHtml === expectedHtml;

  return {
    pass,
    message: () =>
      pass
        ? `Expected HTML not to equal:\n${prettifyHtml(expectedHtml)}`
        : `Expected HTML to equal:\n${prettifyHtml(expectedHtml)}\n\nReceived:\n${prettifyHtml(receivedHtml)}`,
  };
}

/**
 * Custom matcher to check if an element's Light DOM matches the expected HTML
 * Does not serialize shadow DOM
 */
export function toEqualLightHtml(
  received: string | HTMLElement | ShadowRoot,
  expected: string
): { pass: boolean; message: () => string } {
  if (received == null) {
    throw new Error(`expect.toEqualLightHtml() received value is "${received}"`);
  }

  if (typeof (received as any).then === 'function') {
    throw new TypeError(
      `Element must be a resolved value, not a promise, before it can be tested`
    );
  }

  let receivedHtml: string;

  // Serialize the received value (without shadow DOM)
  if (typeof received === 'string') {
    const fragment = parseHtmlFragment(received);
    // For string inputs, use innerHTML to avoid template wrapper
    receivedHtml = ((fragment as any).innerHTML || fragment.textContent || '');
  } else if ((received as any).nodeType === 11) {
    // Document fragment
    receivedHtml = serializeHtml(received as any, { serializeShadowRoot: false });
  } else if ((received as any).nodeType === 1) {
    // Element node
    receivedHtml = serializeHtml(received as HTMLElement, { serializeShadowRoot: false });
  } else {
    throw new TypeError(
      `expect.toEqualLightHtml() value should be an element, shadow root, or string`
    );
  }

  // Parse and serialize expected HTML for consistent formatting
  const expectedFragment = parseHtmlFragment(expected);
  let expectedHtml = (expectedFragment as any).innerHTML || expectedFragment.textContent || '';
  // Normalize whitespace for comparison - collapse multiple spaces/newlines
  expectedHtml = expectedHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  receivedHtml = receivedHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

  const pass = receivedHtml === expectedHtml;

  return {
    pass,
    message: () =>
      pass
        ? `Expected Light DOM HTML not to equal:\n${prettifyHtml(expectedHtml)}`
        : `Expected Light DOM HTML to equal:\n${prettifyHtml(expectedHtml)}\n\nReceived:\n${prettifyHtml(receivedHtml)}`,
  };
}

/**
 * Install custom matchers
 */
export function installMatchers() {
  expect.extend({
    toHaveClass,
    toHaveAttribute,
    toHaveProperty,
    toHaveTextContent,
    toBeVisible,
    toHaveShadowRoot,
    toEqualHtml,
    toEqualLightHtml,
  });
}

// Auto-install matchers when this module is imported
installMatchers();
