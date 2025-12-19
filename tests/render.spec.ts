/**
 * Unit tests for the core render functionality
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '../src/testing/render';

describe('render function', () => {
  let mockElement: any;

  beforeEach(() => {
    // Create a mock custom element
    mockElement = {
      tagName: 'MY-COMPONENT',
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      componentOnReady: vi.fn().mockResolvedValue(undefined),
      forceUpdate: vi.fn().mockResolvedValue(undefined),
      shadowRoot: null,
      isConnected: false,
      parentElement: null,
    };

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
    
    // Mock document.body.appendChild
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      (node as any).isConnected = true;
      (node as any).parentElement = document.body;
      return node as any;
    });
    
    // Mock document.body.removeChild
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      (node as any).isConnected = false;
      (node as any).parentElement = null;
      return node as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic rendering', () => {
    it('should create element with correct tag name', async () => {
      const component = { is: 'my-component' };
      
      await render(component);
      
      expect(document.createElement).toHaveBeenCalled();
    });

    it('should append element to document body', async () => {
      const component = { is: 'my-component' };
      
      await render(component);
      
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should return render result with root element', async () => {
      const component = { is: 'my-component' };
      
      const result = await render(component);
      
      expect(result.root).toBe(mockElement);
    });
  });

  describe('props', () => {
    it('should set props on element', async () => {
      const component = { is: 'my-component' };
      const props = { name: 'Test', value: 42 };
      
      await render(component, { props });
      
      expect(mockElement.name).toBe('Test');
      expect(mockElement.value).toBe(42);
    });

    it('should support setProps method', async () => {
      const component = { is: 'my-component' };
      
      const result = await render(component, { props: { count: 0 } });
      
      expect(mockElement.count).toBe(0);
      
      await result.setProps({ count: 1 });
      
      expect(mockElement.count).toBe(1);
    });
  });

  describe('attributes', () => {
    it('should set attributes on element', async () => {
      const component = { is: 'my-component' };
      const attributes = { id: 'test-id', class: 'test-class' };
      
      await render(component, { attributes });
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'test-id');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'test-class');
    });
  });

  describe('HTML content', () => {
    it('should set innerHTML when html option provided', async () => {
      const component = { is: 'my-component' };
      const html = '<span>Test Content</span>';
      
      await render(component, { html });
      
      expect(mockElement.innerHTML).toBe(html);
    });
  });

  describe('lifecycle', () => {
    it('should wait for componentOnReady by default', async () => {
      const component = { is: 'my-component' };
      
      await render(component);
      
      expect(mockElement.componentOnReady).toHaveBeenCalled();
    });

    it('should skip componentOnReady when waitForLoad is false', async () => {
      const component = { is: 'my-component' };
      
      await render(component, { waitForLoad: false });
      
      expect(mockElement.componentOnReady).not.toHaveBeenCalled();
    });

    it('should provide waitForChanges method', async () => {
      const component = { is: 'my-component' };
      
      const result = await render(component);
      
      expect(result.waitForChanges).toBeTypeOf('function');
      
      await result.waitForChanges();
      
      expect(mockElement.forceUpdate).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should provide unmount method', async () => {
      const component = { is: 'my-component' };
      
      const result = await render(component);
      
      expect(result.unmount).toBeTypeOf('function');
    });

    it('should remove element from DOM on unmount', async () => {
      const component = { is: 'my-component' };
      
      const result = await render(component);
      expect(mockElement.isConnected).toBe(true);
      
      result.unmount();
      
      expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.isConnected).toBe(false);
    });
  });
});
