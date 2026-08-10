import { LogLevel, LogMetadata, LoggedConfig, LogPayload } from "./types";
import { Transport } from "./transport";
import { setupAutoCapture } from "./browser/auto";
import { setupConsoleCapture } from "./browser/console";

export class Logged {
  private config: LoggedConfig;
  private transport: Transport;
  private cleanupAutoCapture?: () => void;
  private cleanupConsoleCapture?: () => void;

  constructor(config: LoggedConfig) {
    if (!config.apiKey) {
      console.warn("[Logged SDK] Missing apiKey. Logs will not be sent.");
    }
    this.config = config;
    this.transport = new Transport(config);
  }

  private send(level: LogLevel, message: string, metadata?: LogMetadata) {
    if (!this.config.apiKey) return;

    const payload: LogPayload = {
      level,
      message,
    };

    if (metadata) {
      payload.metadata = metadata;
    }

    // Fire and forget
    this.transport.send(payload);
  }

  log(message: string, metadata?: LogMetadata) {
    this.send("log", message, metadata);
  }

  info(message: string, metadata?: LogMetadata) {
    this.send("info", message, metadata);
  }

  success(message: string, metadata?: LogMetadata) {
    this.send("success", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.send("warn", message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.send("error", message, metadata);
  }

  debug(message: string, metadata?: LogMetadata) {
    this.send("debug", message, metadata);
  }

  capture(error: unknown, metadata?: LogMetadata) {
    if (!this.config.apiKey) return;

    let message = "Unknown error";
    let stack: string | undefined;
    let name: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      name = error.name;
    } else if (typeof error === "string") {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch (e) {
        message = "Unserializable error";
      }
    }

    const payload: LogPayload = {
      level: "error",
      message,
      stack,
    };

    const combinedMetadata = { ...metadata };
    if (name) {
      combinedMetadata.errorName = name;
    }

    if (Object.keys(combinedMetadata).length > 0) {
      payload.metadata = combinedMetadata;
    }

    this.transport.send(payload);
  }

  auto() {
    if (this.cleanupAutoCapture) {
      return; // Already initialized
    }
    this.cleanupAutoCapture = setupAutoCapture(this);
  }

  stopAutoCapture() {
    if (this.cleanupAutoCapture) {
      this.cleanupAutoCapture();
      this.cleanupAutoCapture = undefined;
    }
  }

  interceptConsole() {
    if (this.cleanupConsoleCapture) {
      return; // Already initialized
    }
    this.cleanupConsoleCapture = setupConsoleCapture(this);
  }

  stopConsoleInterception() {
    if (this.cleanupConsoleCapture) {
      this.cleanupConsoleCapture();
      this.cleanupConsoleCapture = undefined;
    }
  }
}
