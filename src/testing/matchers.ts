/**
 * Custom matchers for Stencil component testing
 *
 * These extend Vitest's expect with Stencil-specific assertions
 */

import { expect } from 'vitest';
import { serializeHtml, normalizeHtml, prettifyHtml } from './html-serializer.js';
import type { EventSpy } from '../types.js';

/**
 * Custom matchers interface
 */
interface CustomMatchers<R = unknown> {
  toHaveClass(className: string): R;
  toHaveClasses(classNames: string[]): R;
  toMatchClasses(classNames: string[]): R;
  toHaveAttribute(attribute: string, value?: string): R;
  toEqualAttribute(attribute: string, value: string): R;
  toEqualAttributes(expectedAttrs: Record<string, string>): R;
  toHaveProperty(property: string, value?: any): R;
  toHaveTextContent(text: string): R;
  toEqualText(expectedText: string): R;
  toBeVisible(): R;
  toHaveShadowRoot(): R;
  toEmitEvent(eventName: string): R;
  toEqualHtml(expectedHtml: string): R;
  toEqualLightHtml(expectedHtml: string): R;
  toHaveReceivedEvent(): R;
  toHaveReceivedEventTimes(count: number): R;
  toHaveReceivedEventDetail(detail: any): R;
  toHaveFirstReceivedEventDetail(detail: any): R;
  toHaveLastReceivedEventDetail(detail: any): R;
  toHaveNthReceivedEventDetail(index: number, detail: any): R;
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
export function toHaveClass(received: HTMLElement, className: string): { pass: boolean; message: () => string } {
  const pass = received.classList.contains(className);

  return {
    pass,
    message: () =>
      pass ? `Expected element not to have class "${className}"` : `Expected element to have class "${className}"`,
  };
}

/**
 * Check if element has multiple classes
 * Checks if element has all of the specified CSS classes (order doesn't matter)
 */
export function toHaveClasses(received: HTMLElement, classNames: string[]): { pass: boolean; message: () => string } {
  const missingClasses: string[] = [];

  for (const className of classNames) {
    if (!received.classList.contains(className)) {
      missingClasses.push(className);
    }
  }

  const pass = missingClasses.length === 0;
  const actualClasses = Array.from(received.classList).join(', ');

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have classes [${classNames.join(', ')}]`
        : `Expected element to have classes [${classNames.join(', ')}], but missing [${missingClasses.join(', ')}]. Actual classes: [${actualClasses}]`,
  };
}

/**
 * Check if element has exactly the specified CSS classes (no more, no less)
 * Order doesn't matter, but the element must have exactly these classes
 */
export function toMatchClasses(received: HTMLElement, classNames: string[]): { pass: boolean; message: () => string } {
  // Get classes from the class attribute to support mock-doc
  const classAttr = received.getAttribute('class') || '';
  const actualClasses = classAttr.split(/\s+/).filter(Boolean).sort();
  const expectedClasses = [...classNames].filter(Boolean).sort();

  const pass =
    actualClasses.length === expectedClasses.length && actualClasses.every((cls, idx) => cls === expectedClasses[idx]);

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have exactly classes [${classNames.join(', ')}]`
        : `Expected element to have exactly classes [${classNames.join(', ')}], but got [${actualClasses.join(', ')}]`,
  };
}

/**
 * Check if element has an attribute
 */
export function toHaveAttribute(
  received: HTMLElement,
  attribute: string,
  value?: string,
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
 * Check if element has a specific attribute with an exact value
 */
export function toEqualAttribute(
  received: HTMLElement,
  attribute: string,
  value: string,
): { pass: boolean; message: () => string } {
  const actualValue = received.getAttribute(attribute);
  const pass = actualValue === value;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element attribute "${attribute}" not to equal "${value}"`
        : `Expected element attribute "${attribute}" to equal "${value}", but got "${actualValue}"`,
  };
}

/**
 * Check if element has all expected attributes with exact values
 */
export function toEqualAttributes(
  received: HTMLElement,
  expectedAttrs: Record<string, string>,
): { pass: boolean; message: () => string } {
  const mismatches: string[] = [];
  const actualAttrs: Record<string, string | null> = {};

  // Collect all actual attributes
  for (let i = 0; i < received.attributes.length; i++) {
    const attr = received.attributes[i];
    actualAttrs[attr.name] = attr.value;
  }

  // Check expected attributes
  for (const [name, expectedValue] of Object.entries(expectedAttrs)) {
    const actualValue = received.getAttribute(name);

    if (actualValue === null) {
      mismatches.push(`missing "${name}"`);
    } else if (actualValue !== expectedValue) {
      mismatches.push(`"${name}": expected "${expectedValue}", got "${actualValue}"`);
    }
  }

  const pass = mismatches.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have attributes ${JSON.stringify(expectedAttrs)}`
        : `Expected element attributes to match.\nMismatches: ${mismatches.join(', ')}\nExpected: ${JSON.stringify(expectedAttrs)}\nActual: ${JSON.stringify(actualAttrs)}`,
  };
}

/**
 * Check if element has a property
 */
export function toHaveProperty(received: any, property: string, value?: any): { pass: boolean; message: () => string } {
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
export function toHaveTextContent(received: HTMLElement, text: string): { pass: boolean; message: () => string } {
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
 * Check if element's text content exactly matches (after trimming)
 */
export function toEqualText(received: HTMLElement, expectedText: string): { pass: boolean; message: () => string } {
  const actualText = (received.textContent || '').trim();
  const trimmedExpected = expectedText.trim();
  const pass = actualText === trimmedExpected;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element text not to equal "${trimmedExpected}"`
        : `Expected element text to equal "${trimmedExpected}", but got "${actualText}"`,
  };
}

/**
 * Check if element is visible
 */
export function toBeVisible(received: HTMLElement): { pass: boolean; message: () => string } {
  const style = window.getComputedStyle(received);
  const pass = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

  return {
    pass,
    message: () => (pass ? `Expected element not to be visible` : `Expected element to be visible`),
  };
}

/**
 * Check if element has shadow root
 */
export function toHaveShadowRoot(received: HTMLElement): { pass: boolean; message: () => string } {
  const pass = !!received.shadowRoot;

  return {
    pass,
    message: () => (pass ? `Expected element not to have shadow root` : `Expected element to have shadow root`),
  };
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
  expected: string,
): { pass: boolean; message: () => string } {
  if (received == null) {
    throw new Error(`expect.toEqualHtml() received value is "${received}"`);
  }

  if (typeof (received as any).then === 'function') {
    throw new TypeError(`Element must be a resolved value, not a promise, before it can be tested`);
  }

  let receivedHtml: string;

  // Serialize the received value
  if (typeof received === 'string') {
    const fragment = parseHtmlFragment(received);
    // For string inputs, use innerHTML to avoid template wrapper
    receivedHtml = (fragment as any).innerHTML || fragment.textContent || '';
  } else if ((received as any).nodeType === 11) {
    // Document fragment
    receivedHtml = serializeHtml(received as any, { serializeShadowRoot: true });
  } else if ((received as any).nodeType === 1) {
    // Element node
    receivedHtml = serializeHtml(received as HTMLElement, { serializeShadowRoot: true });
  } else {
    throw new TypeError(`expect.toEqualHtml() value should be an element, shadow root, or string`);
  }

  // Parse and serialize expected HTML for consistent formatting
  // For expected HTML, just normalize whitespace without parsing through DOM
  // to preserve custom elements like <mock:shadow-root>
  let expectedHtml = normalizeHtml(expected.trim());
  receivedHtml = normalizeHtml(receivedHtml);

  // Debug logging
  if (expectedHtml !== receivedHtml) {
    console.log('Expected (normalized):', JSON.stringify(expectedHtml));
    console.log('Received (normalized):', JSON.stringify(receivedHtml));
  }

  const pass = receivedHtml === expectedHtml;

  return {
    pass,
    message: () =>
      pass
        ? `Expected HTML not to equal:\n${prettifyHtml(expectedHtml)}`
        : `Expected HTML to equal:\n${prettifyHtml(expectedHtml)}\n\nReceived:\n${prettifyHtml(receivedHtml)}`,
  };
} /**
 * Custom matcher to check if an element's Light DOM matches the expected HTML
 * Does not serialize shadow DOM
 */
export function toEqualLightHtml(
  received: string | HTMLElement | ShadowRoot,
  expected: string,
): { pass: boolean; message: () => string } {
  if (received == null) {
    throw new Error(`expect.toEqualLightHtml() received value is "${received}"`);
  }

  if (typeof (received as any).then === 'function') {
    throw new TypeError(`Element must be a resolved value, not a promise, before it can be tested`);
  }

  let receivedHtml: string;

  // Serialize the received value (without shadow DOM)
  if (typeof received === 'string') {
    const fragment = parseHtmlFragment(received);
    // For string inputs, use innerHTML to avoid template wrapper
    receivedHtml = (fragment as any).innerHTML || fragment.textContent || '';
  } else if ((received as any).nodeType === 11) {
    // Document fragment
    receivedHtml = serializeHtml(received as any, { serializeShadowRoot: false });
  } else if ((received as any).nodeType === 1) {
    // Element node
    receivedHtml = serializeHtml(received as HTMLElement, { serializeShadowRoot: false });
  } else {
    throw new TypeError(`expect.toEqualLightHtml() value should be an element, shadow root, or string`);
  }

  // For expected HTML, just normalize whitespace without parsing through DOM
  // to preserve custom elements like <mock:shadow-root>
  let expectedHtml = normalizeHtml(expected.trim());
  receivedHtml = normalizeHtml(receivedHtml);

  // Debug logging
  if (expectedHtml !== receivedHtml) {
    console.log('LightDOM Expected (normalized):', JSON.stringify(expectedHtml));
    console.log('LightDOM Received (normalized):', JSON.stringify(receivedHtml));
  }

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
 * Check if an EventSpy has received at least one event
 */
export function toHaveReceivedEvent(received: EventSpy): { pass: boolean; message: () => string } {
  const pass = received.length > 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected event "${received.eventName}" not to have been received`
        : `Expected event "${received.eventName}" to have been received, but it was not`,
  };
}

/**
 * Check if an EventSpy has received an event a specific number of times
 */
export function toHaveReceivedEventTimes(received: EventSpy, count: number): { pass: boolean; message: () => string } {
  const pass = received.length === count;

  return {
    pass,
    message: () =>
      pass
        ? `Expected event "${received.eventName}" not to have been received ${count} times`
        : `Expected event "${received.eventName}" to have been received ${count} times, but it was received ${received.length} times`,
  };
}

/**
 * Safely stringify a value, handling circular references
 */
function safeStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch {
    // If circular reference, just return a string representation
    return String(value);
  }
}

/**
 * Safely compare two values, handling circular references
 */
function safeEquals(a: any, b: any): boolean {
  // Try JSON comparison first
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    // If circular reference, fall back to shallow comparison
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => a[key] === b[key]);
    }
    return a === b;
  }
}

/**
 * Check if the last received event has the expected detail
 */
export function toHaveReceivedEventDetail(received: EventSpy, detail: any): { pass: boolean; message: () => string } {
  if (received.length === 0) {
    return {
      pass: false,
      message: () =>
        `Expected event "${received.eventName}" to have been received with detail, but no events were received`,
    };
  }

  const lastEvent = received.lastEvent!;
  const pass = safeEquals(lastEvent.detail, detail);

  return {
    pass,
    message: () =>
      pass
        ? `Expected last event detail not to equal ${safeStringify(detail)}`
        : `Expected last event detail to equal ${safeStringify(detail)}, but got ${safeStringify(lastEvent.detail)}`,
  };
}

/**
 * Check if the first received event has the expected detail
 */
export function toHaveFirstReceivedEventDetail(
  received: EventSpy,
  detail: any,
): { pass: boolean; message: () => string } {
  if (received.length === 0) {
    return {
      pass: false,
      message: () =>
        `Expected event "${received.eventName}" to have been received with detail, but no events were received`,
    };
  }

  const firstEvent = received.firstEvent!;
  const pass = safeEquals(firstEvent.detail, detail);

  return {
    pass,
    message: () =>
      pass
        ? `Expected first event detail not to equal ${safeStringify(detail)}`
        : `Expected first event detail to equal ${safeStringify(detail)}, but got ${safeStringify(firstEvent.detail)}`,
  };
}

/**
 * Check if the last received event has the expected detail (alias for toHaveReceivedEventDetail)
 */
export function toHaveLastReceivedEventDetail(
  received: EventSpy,
  detail: any,
): { pass: boolean; message: () => string } {
  return toHaveReceivedEventDetail(received, detail);
}

/**
 * Check if the event at a specific index has the expected detail
 */
export function toHaveNthReceivedEventDetail(
  received: EventSpy,
  index: number,
  detail: any,
): { pass: boolean; message: () => string } {
  if (received.length === 0) {
    return {
      pass: false,
      message: () =>
        `Expected event "${received.eventName}" to have been received with detail, but no events were received`,
    };
  }

  if (index < 0 || index >= received.length) {
    return {
      pass: false,
      message: () => `Expected event at index ${index}, but only ${received.length} events were received`,
    };
  }

  const event = received.events[index];
  const pass = safeEquals(event.detail, detail);

  return {
    pass,
    message: () =>
      pass
        ? `Expected event at index ${index} detail not to equal ${safeStringify(detail)}`
        : `Expected event at index ${index} detail to equal ${safeStringify(detail)}, but got ${safeStringify(event.detail)}`,
  };
}

/**
 * Install custom matchers
 */
export function installMatchers() {
  expect.extend({
    toHaveClass,
    toHaveClasses,
    toMatchClasses,
    toHaveAttribute,
    toEqualAttribute,
    toEqualAttributes,
    toHaveProperty,
    toHaveTextContent,
    toEqualText,
    toBeVisible,
    toHaveShadowRoot,
    toEqualHtml,
    toEqualLightHtml,
    toHaveReceivedEvent,
    toHaveReceivedEventTimes,
    toHaveReceivedEventDetail,
    toHaveFirstReceivedEventDetail,
    toHaveLastReceivedEventDetail,
    toHaveNthReceivedEventDetail,
  });
}

// Auto-install matchers when this module is imported
installMatchers();
