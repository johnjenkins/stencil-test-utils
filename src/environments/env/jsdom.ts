import { importModule } from 'local-pkg';
import type { EnvironmentStencil } from '../types.js';
import { applyJsdomPolyfills } from '../../setup/jsdom-setup.js';

export default <EnvironmentStencil>async function (global, options) {
  const { JSDOM, ResourceLoader, VirtualConsole, CookieJar } = (await importModule('jsdom')) as any;

  const jsdomOptions = {
    html: '<!DOCTYPE html>',
    url: 'http://localhost:3000',
    contentType: 'text/html' as const,
    pretendToBeVisual: true,
    includeNodeLocations: false,
    runScripts: 'dangerously' as const,
    console: false,
    cookieJar: false,
    ...options.jsdom,
  };

  const virtualConsole =
    jsdomOptions.console && global.console ? new VirtualConsole().sendTo(global.console) : undefined;

  const window = new JSDOM(jsdomOptions.html, {
    ...jsdomOptions,
    resources:
      jsdomOptions.resources ??
      (jsdomOptions.userAgent ? new ResourceLoader({ userAgent: jsdomOptions.userAgent }) : undefined),
    virtualConsole,
    cookieJar: jsdomOptions.cookieJar ? new CookieJar() : undefined,
  }).window;

  // Apply all polyfills using shared logic
  applyJsdomPolyfills(window as any);

  return {
    window,
    teardown() {
      window.close();
    },
  };
};
