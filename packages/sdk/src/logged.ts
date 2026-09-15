import { Logged } from "./logger";

// Expose as a global for CDN / script tag usage
if (typeof window !== "undefined") {
  (window as unknown as { Logged: typeof Logged }).Logged = Logged;
}

if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { Logged: typeof Logged }).Logged = Logged;
}

// Auto-initialize when data-api-key is present on the script tag
if (typeof document !== "undefined") {
  const script =
    document.currentScript ||
    document.querySelector('script[data-api-key], script[data-key]') ||
    document.querySelector('script[src*="logged"]');

  if (script) {
    const apiKey =
      script.getAttribute("data-api-key") ||
      script.getAttribute("data-key");

    if (apiKey) {
      const autoCapture  = script.getAttribute("data-auto")    !== "false";
      const consoleCapture = script.getAttribute("data-console") !== "false";
      const debug        = script.getAttribute("data-debug")   === "true";

      const instance = new Logged({ apiKey, debug });
      if (autoCapture)    instance.auto();
      if (consoleCapture) instance.interceptConsole();

      if (typeof window !== "undefined") {
        (window as unknown as { logged: Logged }).logged = instance;
      }
    }
  }
}

