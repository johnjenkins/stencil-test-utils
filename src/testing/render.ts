import { render as stencilRender } from '@stencil/core';
import type { RenderOptions, RenderResult, EventSpy } from '../types.js';

/**
 * Render using Stencil's render 
 */
export async function render<T extends HTMLElement = HTMLElement>(
  vnode: any,
): Promise<RenderResult<T>> {

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
  
  // Track event spies
  const eventSpies = new Map<string, EventSpy>();
  
  function waitForChanges(documentElement = document.documentElement) {
    return new Promise<void>((resolve) => {
      // Wait for Stencil's RAF-based update cycle
      // Use multiple RAF cycles to ensure all batched updates complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const promiseChain = [];
          const waitComponentOnReady = (elm, promises) => {
            if (!elm) return
            if ("shadowRoot" in elm) {
              waitComponentOnReady(elm.shadowRoot, promises);
            }
            const children = elm.children;
            const len = children.length;
            for (let i = 0; i < len; i++) {
              const childElm = children[i];
              const childStencilElm = childElm;
              if (childElm.tagName.includes("-") && typeof childStencilElm.componentOnReady === "function") {
                promises.push(childStencilElm.componentOnReady().then(() => {
                }));
              }
              waitComponentOnReady(childElm, promises);
            }
          };
          waitComponentOnReady(documentElement, promiseChain);
          Promise.all(promiseChain).then(() => resolve()).catch(() => resolve());
        });
      });
    });
  }
  
  const setProps = async (newProps: Record<string, any>) => {
    Object.entries(newProps).forEach(([key, value]) => {
      (element as any)[key] = value;
    });
    
    // Wait for multiple RAF cycles to ensure Stencil's batched updates complete
    // Stencil batches updates using requestAnimationFrame for performance
    await waitForChanges(container);
    
    // Additional RAF cycle to ensure rendering is complete
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
  };
  
  const unmount = () => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
    
    // Clean up event listeners
    eventSpies.forEach((spy) => {
      element.removeEventListener(spy.eventName, (spy as any)._listener);
    });
    eventSpies.clear();
  };
  
  const spyOnEvent = (eventName: string): EventSpy => {
    // Return existing spy if already created
    if (eventSpies.has(eventName)) {
      return eventSpies.get(eventName)!;
    }
    
    const spy: EventSpy = {
      eventName,
      events: [],
      firstEvent: undefined,
      lastEvent: undefined,
      length: 0,
    };
    
    // Store listener so we can remove it later
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent;
      spy.events.push(customEvent);
      spy.length = spy.events.length;
      spy.lastEvent = customEvent;
      if (spy.length === 1) {
        spy.firstEvent = customEvent;
      }
    };
    
    (spy as any)._listener = listener;
    element.addEventListener(eventName, listener);
    eventSpies.set(eventName, spy);
    
    return spy;
  };
  
  return {
    root: element,
    waitForChanges,
    instance: (element as any),
    setProps,
    unmount,
    spyOnEvent,
  };
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
