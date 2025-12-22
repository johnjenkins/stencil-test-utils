export interface EnvironmentReturn {
  window: Window & typeof globalThis;
  teardown: () => void;
}

export type EnvironmentStencil = (global: typeof globalThis, options: any) => Promise<EnvironmentReturn>;
