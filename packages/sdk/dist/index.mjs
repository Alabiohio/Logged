// src/transport.ts
var DEFAULT_BASE_URL = "https://logged.site";
var Transport = class {
  config;
  endpoint;
  constructor(config) {
    this.config = config;
    const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.endpoint = `${normalizedBase}/api/v1/logs`;
  }
  async send(payload) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (this.config.debug) {
          const text = await response.text();
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
    } catch (e) {
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
    const now = Date.now();
    this.cleanup(now);
    const count = this.seen.get(fingerprint) || 0;
    if (count >= this.maxEventsPerType) {
      return true;
    }
    this.seen.set(fingerprint, count + 1);
    return false;
  }
  cleanup(now) {
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
    } catch (e) {
      if (logger.config?.debug) {
        console.error("[Logged SDK] Error during auto capture:", e);
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

// src/logger.ts
var Logged = class {
  config;
  transport;
  cleanupAutoCapture;
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
      } catch (e) {
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
};
export {
  Logged
};
