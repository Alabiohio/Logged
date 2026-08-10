import { Logged } from "../logger";
import { getBrowserContext } from "./context";
import { DuplicateFilter, generateErrorFingerprint } from "../utils/fingerprint";
import { safeSerializeArgs } from "../utils/serialize";
import { LogPayload, LogLevel } from "../types";

const CONSOLE_METHODS = ["log", "info", "warn", "error"] as const;
type ConsoleMethod = typeof CONSOLE_METHODS[number];

// A mapping from console method to Logged method/level
const LEVEL_MAP: Record<ConsoleMethod, LogLevel> = {
  log: "log",
  info: "info",
  warn: "warn",
  error: "error",
};

export function setupConsoleCapture(logger: Logged): () => void {
  if (typeof window === "undefined" || typeof console === "undefined") {
    return () => {};
  }

  const filter = new DuplicateFilter();

  // Store original methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  const handleCapture = (method: ConsoleMethod, args: unknown[]) => {
    try {
      if (args.length === 0) return;

      const level = LEVEL_MAP[method];
      const serializedArgs = safeSerializeArgs(args);
      
      // Determine message: use first argument if it's a string or error, otherwise stringify or use default
      let message = "Console log";
      let stack: string | undefined;

      const firstArg = args[0];
      if (typeof firstArg === "string") {
        message = firstArg;
      } else if (firstArg instanceof Error) {
        message = firstArg.message;
        stack = firstArg.stack;
      }

      // Add context
      const context = getBrowserContext();

      // Simple deduplication based on fingerprinting
      // Fingerprint includes level, message, and pathname to avoid over-filtering
      const fingerprint = generateErrorFingerprint(
        `${level}:${message}`,
        stack,
        context.pathname
      );

      if (filter.shouldFilter(fingerprint)) {
        return; // Skip duplicate
      }

      const payload: Partial<LogPayload> = {
        level,
        message,
        stack,
        ...context,
      };

      // Add serialized arguments to metadata
      const metadata: Record<string, unknown> = {
        consoleArguments: serializedArgs,
      };

      if (firstArg instanceof Error && firstArg.name) {
        metadata.errorName = firstArg.name;
      }
      
      // We leverage the logger's transport directly like auto.ts
      (logger as any).transport.send({ ...payload, metadata });

    } catch (e) {
      if ((logger as any).config?.debug) {
        originalConsole.error("[Logged SDK] Error capturing console event:", e);
      }
    }
  };

  // Replace methods
  CONSOLE_METHODS.forEach((method) => {
    console[method] = function (...args: unknown[]) {
      // 1. Send to Logged
      handleCapture(method, args);

      // 2. Call original method (preserving exact DevTools behavior)
      originalConsole[method].apply(console, args);
    };
  });

  // Return cleanup function
  return () => {
    CONSOLE_METHODS.forEach((method) => {
      console[method] = originalConsole[method];
    });
  };
}
