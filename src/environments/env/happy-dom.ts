import { importModule } from 'local-pkg';
import type { EnvironmentStencil } from '../types.js';

export default <EnvironmentStencil>async function (global, options) {
  const { Window, GlobalWindow } = (await importModule('happy-dom')) as any;

  const happyDomOptions = {
    url: 'http://localhost:3000',
    ...options.happyDom,
  };

  const window = new (GlobalWindow || Window)(happyDomOptions);

  return {
    window,
    teardown() {
      window.happyDOM.abort();
    },
  };
};
