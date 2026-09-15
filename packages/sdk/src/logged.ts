import { Logged } from "./logger";

declare global {
  interface Window {
    Logged: typeof Logged;
    logged?: Logged;
  }

  var Logged: typeof import("./logger").Logged;
  var logged: Logged | undefined;
}

// Expose Logged globally in the browser
if (typeof window !== "undefined") {
  window.Logged = Logged;
}

if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { Logged: typeof Logged }).Logged = Logged;
}

// Auto-initialize if data-api-key or data-key is present on script tag
if (typeof document !== "undefined") {
  const script =
    document.currentScript ||
    document.querySelector("script[data-api-key], script[data-key]") ||
    document.querySelector('script[src*="logged"]');

  if (script) {
    const apiKey =
      script.getAttribute("data-api-key") ||
      script.getAttribute("data-key");

    if (apiKey) {
      const autoCapture = script.getAttribute("data-auto") !== "false";
      const consoleCapture = script.getAttribute("data-console") !== "false";
      const debug = script.getAttribute("data-debug") === "true";

      const instance = new Logged({
        apiKey,
        debug,
      });

      if (autoCapture) {
        instance.auto();
      }

      if (consoleCapture) {
        instance.interceptConsole();
      }

      if (typeof window !== "undefined") {
        window.logged = instance;
      }
    }
  }
}

// Default export for the IIFE/browser build
export default Logged;