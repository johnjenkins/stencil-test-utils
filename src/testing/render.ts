import { render as stencilRender } from '@stencil/core';
import type { RenderOptions, RenderResult } from '../types.js';

/**
 * Detect if we're in a browser environment (not mock-doc or Node.js)
 * Use the same detection logic as mock-doc-setup
 */
function isBrowserEnvironment(): boolean {
  // Check for Node.js environment (means we're in mock-doc or jsdom/happy-dom)
  const isNodeEnvironment = typeof process !== 'undefined' && 
    process?.versions?.node !== undefined;
  
  // If we're in Node.js, we're NOT in a real browser
  return !isNodeEnvironment;
}

/**
 * Render a Stencil component for testing
 * Works in both mock-doc (Node.js) and real browser environments
 * 
 * @example
 * ```tsx
 * // Browser environment
 * import { render } from '@stencil/test-utils';
 * const { root, unmount } = await render(<my-button variant="primary">Click me</my-button>);
 * 
 * // Mock-doc environment
 * import { render } from '@stencil/test-utils';
 * const { root, waitForChanges } = await render(<my-button variant="primary">Click me</my-button>);
 * ```
 */
export async function render<T extends HTMLElement = HTMLElement>(
  vnode: any,
  options: RenderOptions = {}
): Promise<RenderResult<T>> {
  // In browser environment, use Stencil's render for better compatibility
  if (isBrowserEnvironment()) {
    return await renderInBrowser<T>(vnode, options);
  }
  
  // In mock-doc environment, use our custom implementation
  return await renderInMockDoc<T>(vnode, options);
}

/**
 * Render using Stencil's render (for browser environments)
 */
async function renderInBrowser<T extends HTMLElement = HTMLElement>(
  vnode: any,
  options: RenderOptions = {}
): Promise<RenderResult<T>> {
  // Dynamically import Stencil's render to avoid issues in Node

  // Use Stencil's render which handles VNodes properly in the browser
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  await stencilRender(vnode, container);
  
  // Get the rendered element
  const element = container.firstElementChild as T;
  
  if (!element) {
    throw new Error('Failed to render component');
  }
  
  // Wait for component to be ready
  if (typeof (element as any).componentOnReady === 'function') {
    await (element as any).componentOnReady();
  }
  
  const waitForChanges = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (typeof (element as any).forceUpdate === 'function') {
      await (element as any).forceUpdate();
    }
  };
  
  const setProps = async (newProps: Record<string, any>) => {
    Object.entries(newProps).forEach(([key, value]) => {
      (element as any)[key] = value;
    });
    await waitForChanges();
  };
  
  const unmount = () => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  };
  
  return {
    root: element,
    waitForChanges,
    instance: (element as any),
    setProps,
    unmount,
  };
}

/**
 * Render for mock-doc environment (Node.js testing)
 */
async function renderInMockDoc<T extends HTMLElement = HTMLElement>(
  vnode: any,
  options: RenderOptions = {}
): Promise<RenderResult<T>> {
  // Handle JSX VNode (from h() function) or simple component descriptor
  let tagName: string;
  let props: Record<string, any> = {};
  let children: any[] = [];

  if (vnode && typeof vnode === 'object') {
    // Check if it's a simple component descriptor like { is: 'my-component' }
    if (vnode.is && typeof vnode.is === 'string') {
      tagName = vnode.is;
      props = { ...(options.props || {}) };
    }
    // It's a VNode from JSX/h()
    else if (typeof vnode.$tag$ === 'string') {
      // Stencil VNode format
      tagName = vnode.$tag$;
      props = { ...(vnode.$attrs$ || {}), ...(options.props || {}) };
      if (vnode.$children$) {
        children = Array.isArray(vnode.$children$) ? vnode.$children$ : [vnode.$children$];
      }
    } else if (vnode.vtag) {
      // Legacy VNode format
      tagName = vnode.vtag;
      props = { ...(vnode.vattrs || {}), ...(options.props || {}) };
      children = vnode.vchildren || [];
    } else {
      throw new Error('Invalid VNode format - expected JSX element, h() call, or { is: "component-name" }');
    }
  } else {
    throw new Error('render() expects a JSX element created with h() or <Component />, or { is: "component-name" }');
  }

  const {
    waitForLoad = true,
    attributes = {},
    html
  } = options;
  
  // Create the element
  const element = document.createElement(tagName) as T;
  
  // Set attributes from options
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Set props from VNode and options
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on')) {
      // Event handler - skip for now, handled by component
      return;
    }
    if (value !== null && value !== undefined) {
      (element as any)[key] = value;
    }
  });
  
  // Set innerHTML if provided (takes precedence over children)
  if (html) {
    element.innerHTML = html;
  }
  // Handle children/slot content
  else if (children.length > 0) {
    children.forEach((child: any) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child && typeof child === 'object') {
        // It's a VNode, create element recursively
        const childEl = createElementFromVNode(child);
        if (childEl) {
          element.appendChild(childEl);
        }
      }
    });
  }
  
  // Append to document body
  document.body.appendChild(element);
  
  // Wait for component to load
  if (waitForLoad && typeof (element as any).componentOnReady === 'function') {
    await (element as any).componentOnReady();
  }
  
  // Helper to wait for changes
  const waitForChanges = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (typeof (element as any).forceUpdate === 'function') {
      await (element as any).forceUpdate();
    }
  };
  
  // Helper to set props
  const setProps = async (newProps: Record<string, any>) => {
    Object.entries(newProps).forEach(([key, value]) => {
      (element as any)[key] = value;
    });
    await waitForChanges();
  };
  
  // Cleanup function
  const unmount = () => {
    if (element.parentElement) {
      element.parentElement.removeChild(element);
    }
  };
  
  return {
    root: element,
    waitForChanges,
    instance: (element as any),
    setProps,
    unmount,
  };
}

/**
 * Create an HTML element from a VNode
 */
function createElementFromVNode(vnode: any): HTMLElement | Text | null {
  if (!vnode) return null;
  
  // Handle text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  
  // Handle VNode
  const tag = vnode.$tag$ || vnode.vtag;
  if (!tag) return null;
  
  const element = document.createElement(tag);
  
  // Set attributes
  const attrs = vnode.$attrs$ || vnode.vattrs || {};
  Object.entries(attrs).forEach(([key, value]: [string, any]) => {
    if (key === 'class' || key === 'className') {
      element.className = value;
    } else if (key === 'slot') {
      element.setAttribute('slot', value);
    } else if (key.startsWith('on')) {
      // Skip event handlers for now
    } else if (value !== null && value !== undefined) {
      element.setAttribute(key, String(value));
    }
  });
  
  // Handle children
  const children = vnode.$children$ || vnode.vchildren || [];
  (Array.isArray(children) ? children : [children]).forEach((child: any) => {
    const childEl = createElementFromVNode(child);
    if (childEl) {
      element.appendChild(childEl);
    }
  });
  
  return element;
}

/**
 * Create a new page for testing (useful for e2e-like tests)
 */
export async function newPage() {
  // Clear the document
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  return {
    body: document.body,
    setContent: async (html: string) => {
      document.body.innerHTML = html;
      await new Promise(resolve => setTimeout(resolve, 0));
    },
    waitForChanges: async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    },
    find: (selector: string) => document.querySelector(selector),
    findAll: (selector: string) => Array.from(document.querySelectorAll(selector)),
  };
}
