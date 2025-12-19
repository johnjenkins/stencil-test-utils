import type { RenderOptions, RenderResult } from '../types.js';
import { render as stencilRender } from '@stencil/core';

/**
 * Render a Stencil component in a real browser environment
 * 
 * @example
 * ```tsx
 * import { render } from '@stencil/test-utils/browser';
 * const { root } = await render(<my-button variant="primary">Click me</my-button>);
 * ```
 */
export async function render<T extends HTMLElement = HTMLElement>(
  vnode: any,
  options: RenderOptions = {}
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
