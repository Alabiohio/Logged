import { Logged } from "../logger";
import { getBrowserContext } from "./context";
import { normalizeError } from "./normalize-error";
import { DuplicateFilter, generateErrorFingerprint } from "../utils/fingerprint";
import { LogPayload } from "../types";

export function setupAutoCapture(logger: Logged): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const filter = new DuplicateFilter();

  const handleCapture = (error: unknown, fallbackMessage?: string) => {
    try {
      const normalized = normalizeError(error);
      const message = normalized.message || fallbackMessage || "Unknown error";
      
      const context = getBrowserContext();
      
      const fingerprint = generateErrorFingerprint(
        message, 
        normalized.stack, 
        context.pathname
      );

      if (filter.shouldFilter(fingerprint)) {
        return; // Skip duplicate
      }

      const payload: Partial<LogPayload> = {
        level: "error",
        message,
        stack: normalized.stack,
        ...context,
      };

      const metadata: Record<string, unknown> = {};
      if (normalized.name) {
        metadata.errorName = normalized.name;
      }

      // Send the payload through the logger's internal capture method.
      // Since Logged SDK has a capture method, we should leverage it but override the payload
      // or we can call an internal method if it existed.
      // Wait, `capture` constructs its own LogPayload. We might need to augment `capture` to accept
      // a pre-constructed context or we can just send it via an internal `send` method.
      // Let's use an internal method on Logged or modify `capture`.
      
      // We will cast logger to any to access private send, or we'll update logger.ts to have an internal send.
      // Let's use `(logger as any).transport.send(payload)` for now, but cleaner is to update `logger.ts` to export a protected method.
      // Wait, we can just call `logger.capture` and pass context in metadata, but `logger.ts` only sets message/stack.
      // Let's assume we update `logger.ts` to have an `_internalCapture` or `captureEvent`.
      
      // Let's just use the `transport` directly.
      (logger as any).transport.send(payload);

    } catch (e) {
      // Never break the app
      if ((logger as any).config?.debug) {
        console.error("[Logged SDK] Error during auto capture:", e);
      }
    }
  };

  const onError = (event: ErrorEvent) => {
    handleCapture(event.error || event, event.message);
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    handleCapture(event.reason, "Unhandled Promise Rejection");
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
