// src/transport.ts
var LOGGED_ENDPOINT = "https://logged.oheo.site/api/v1/logs";
var Transport = class {
  config;
  constructor(config) {
    this.config = config;
  }
  async send(payload) {
    try {
      const response = await fetch(LOGGED_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (this.config.debug) {
          let text = await response.text();
          if (text.trim().startsWith("<")) {
            text = "[HTML Response / Not Found]";
          } else if (text.length > 300) {
            text = text.slice(0, 300) + "...";
          }
          console.error(`[Logged SDK] Failed to send log: ${response.status} ${response.statusText} - ${text}`);
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("[Logged SDK] Network error while sending log:", error);
      }
    }
  }
};

// src/browser/context.ts
function getBrowserContext() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }
  const context = {
    url: window.location.href,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent
  };
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
    context.browser = "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    context.browser = "Safari";
  } else if (ua.includes("Firefox")) {
    context.browser = "Firefox";
  } else if (ua.includes("Edg")) {
    context.browser = "Edge";
  }
  if (ua.includes("Win")) context.os = "Windows";
  else if (ua.includes("Mac")) context.os = "macOS";
  else if (ua.includes("Linux")) context.os = "Linux";
  else if (ua.includes("Android")) context.os = "Android";
  else if (ua.includes("like Mac")) context.os = "iOS";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
    ua
  )) {
    context.device = "Mobile";
  } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    context.device = "Tablet";
  } else {
    context.device = "Desktop";
  }
  return context;
}

// src/browser/normalize-error.ts
function normalizeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  if (typeof error === "string") {
    return {
      message: error
    };
  }
  if (error && typeof error === "object") {
    const obj = error;
    if (obj.error instanceof Error) {
      return {
        message: obj.error.message,
        stack: obj.error.stack,
        name: obj.error.name
      };
    }
    if (typeof obj.message === "string") {
      return {
        message: obj.message,
        name: typeof obj.name === "string" ? obj.name : void 0
      };
    }
    try {
      return {
        message: JSON.stringify(error)
      };
    } catch {
      return {
        message: "Unserializable error object"
      };
    }
  }
  return {
    message: "Unknown error"
  };
}

// src/utils/fingerprint.ts
function generateErrorFingerprint(message, stack, pathname) {
  const parts = [message, pathname || ""];
  if (stack) {
    const stackLines = stack.split("\n").slice(0, 3).join("\n");
    parts.push(stackLines);
  }
  return parts.join("|");
}
var DuplicateFilter = class {
  seen = /* @__PURE__ */ new Map();
  maxAgeMs = 1e4;
  // 10 seconds timeout for duplicates
  maxEventsPerType = 5;
  // allow at most 5 similar errors per 10s
  shouldFilter(fingerprint) {
    this.cleanup();
    const count = this.seen.get(fingerprint) || 0;
    if (count >= this.maxEventsPerType) {
      return true;
    }
    this.seen.set(fingerprint, count + 1);
    return false;
  }
  cleanup() {
    if (Math.random() > 0.1) return;
    if (this.seen.size > 100) {
      this.seen.clear();
    }
  }
};

// src/browser/auto.ts
function setupAutoCapture(logger) {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  const filter = new DuplicateFilter();
  const handleCapture = (error, fallbackMessage) => {
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
        return;
      }
      const payload = {
        level: "error",
        message,
        stack: normalized.stack,
        ...context
      };
      const metadata = {};
      if (normalized.name) {
        metadata.errorName = normalized.name;
      }
      logger.transport.send(payload);
    } catch (error2) {
      if (logger.config?.debug) {
        console.error("[Logged SDK] Error during auto capture:", error2);
      }
    }
  };
  const onError = (event) => {
    handleCapture(event.error || event, event.message);
  };
  const onUnhandledRejection = (event) => {
    handleCapture(event.reason, "Unhandled Promise Rejection");
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}

// src/utils/serialize.ts
function serialize(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    if (value === void 0) {
      return "[undefined]";
    }
    return value;
  }
  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack
    };
  }
  if (seen.has(value)) {
    return "[Circular]";
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => serialize(item, seen));
  }
  const serializedObject = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      try {
        serializedObject[key] = serialize(
          value[key],
          seen
        );
      } catch {
        serializedObject[key] = "[Unserializable]";
      }
    }
  }
  return serializedObject;
}
function safeSerializeArgs(args) {
  return args.map((arg) => serialize(arg));
}

// src/browser/console.ts
var CONSOLE_METHODS = ["log", "info", "warn", "error", "table"];
var LEVEL_MAP = {
  log: "log",
  info: "info",
  warn: "warn",
  error: "error",
  table: "info"
};
function setupConsoleCapture(logger) {
  if (typeof window === "undefined" || typeof console === "undefined") {
    return () => {
    };
  }
  const filter = new DuplicateFilter();
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    table: console.table ?? console.log
  };
  const handleCapture = (method, args) => {
    try {
      if (args.length === 0) return;
      const firstArg = args[0];
      if (typeof firstArg === "string" && firstArg.startsWith("[Logged SDK]")) {
        return;
      }
      const serializedArgs = safeSerializeArgs(args);
      let message = "Console log";
      let stack;
      if (typeof firstArg === "string") {
        message = firstArg;
      } else if (firstArg instanceof Error) {
        message = firstArg.message;
        stack = firstArg.stack;
      } else if (method === "table") {
        message = "Console table";
      }
      const context = getBrowserContext();
      const level = LEVEL_MAP[method];
      const fingerprint = generateErrorFingerprint(
        `${level}:${message}`,
        stack,
        context.pathname
      );
      if (filter.shouldFilter(fingerprint)) {
        return;
      }
      const payload = {
        level,
        message,
        stack,
        ...context
      };
      const metadata = {
        consoleArguments: serializedArgs
      };
      if (method === "table") {
        const tableData = serializedArgs[0];
        if (tableData !== void 0) {
          metadata.table = tableData;
        }
        if (args[1] !== void 0) {
          metadata.tableColumns = serializedArgs[1];
        }
      }
      if (firstArg instanceof Error && firstArg.name) {
        metadata.errorName = firstArg.name;
      }
      logger.transport.send({ ...payload, metadata });
    } catch (error) {
      if (logger.config?.debug) {
        originalConsole.error("[Logged SDK] Error capturing console event:", error);
      }
    }
  };
  CONSOLE_METHODS.forEach((method) => {
    console[method] = function(...args) {
      handleCapture(method, args);
      originalConsole[method].apply(console, args);
    };
  });
  return () => {
    CONSOLE_METHODS.forEach((method) => {
      console[method] = originalConsole[method];
    });
  };
}

// src/logger.ts
var Logged = class {
  config;
  transport;
  cleanupAutoCapture;
  cleanupConsoleCapture;
  constructor(config) {
    if (!config.apiKey) {
      console.warn("[Logged SDK] Missing apiKey. Logs will not be sent.");
    }
    this.config = config;
    this.transport = new Transport(config);
  }
  send(level, message, metadata) {
    if (!this.config.apiKey) return;
    const payload = {
      level,
      message
    };
    if (metadata) {
      payload.metadata = metadata;
    }
    this.transport.send(payload);
  }
  log(message, metadata) {
    this.send("log", message, metadata);
  }
  info(message, metadata) {
    this.send("info", message, metadata);
  }
  success(message, metadata) {
    this.send("success", message, metadata);
  }
  warn(message, metadata) {
    this.send("warn", message, metadata);
  }
  error(message, metadata) {
    this.send("error", message, metadata);
  }
  debug(message, metadata) {
    this.send("debug", message, metadata);
  }
  table(message, data, metadata) {
    const payloadMetadata = {
      ...metadata ?? {},
      table: data
    };
    this.send("info", message, payloadMetadata);
  }
  capture(error, metadata) {
    if (!this.config.apiKey) return;
    let message = "Unknown error";
    let stack;
    let name;
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      name = error.name;
    } else if (typeof error === "string") {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        message = "Unserializable error";
      }
    }
    const payload = {
      level: "error",
      message,
      stack
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
      return;
    }
    this.cleanupAutoCapture = setupAutoCapture(this);
  }
  stopAutoCapture() {
    if (this.cleanupAutoCapture) {
      this.cleanupAutoCapture();
      this.cleanupAutoCapture = void 0;
    }
  }
  interceptConsole() {
    if (this.cleanupConsoleCapture) {
      return;
    }
    this.cleanupConsoleCapture = setupConsoleCapture(this);
  }
  stopConsoleInterception() {
    if (this.cleanupConsoleCapture) {
      this.cleanupConsoleCapture();
      this.cleanupConsoleCapture = void 0;
    }
  }
};
export {
  Logged
};
