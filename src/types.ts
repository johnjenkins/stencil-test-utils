import type { Config as StencilConfig } from '@stencil/core/internal';

/**
 * Component render options
 */
export interface RenderOptions {
  /**
   * Props to pass to the component
   */
  props?: Record<string, any>;
  
  /**
   * Slots content (for shadow DOM components)
   */
  slots?: Record<string, string | HTMLElement>;
  
  /**
   * HTML content to place inside the component
   */
  html?: string;
  
  /**
   * Wait for component to be loaded before returning
   * @default true
   */
  waitForLoad?: boolean;
  
  /**
   * Additional HTML attributes
   */
  attributes?: Record<string, string>;
}

/**
 * Render result for component testing
 */
export interface RenderResult<T = HTMLElement> {
  /**
   * The rendered component element
   */
  root: T;
  
  /**
   * Wait for changes to be applied
   */
  waitForChanges: () => Promise<void>;
  
  /**
   * Get the component instance (if available)
   */
  instance?: any;
  
  /**
   * Update component props
   */
  setProps: (props: Record<string, any>) => Promise<void>;
  
  /**
   * Unmount/cleanup the component
   */
  unmount: () => void;
}
