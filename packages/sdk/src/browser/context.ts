import { LogPayload } from "../types";

export function getBrowserContext(): Partial<LogPayload> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }

  const context: Partial<LogPayload> = {
    url: window.location.href,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
  };

  const ua = navigator.userAgent;

  // Simple browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
    context.browser = "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    context.browser = "Safari";
  } else if (ua.includes("Firefox")) {
    context.browser = "Firefox";
  } else if (ua.includes("Edg")) {
    context.browser = "Edge";
  }

  // Simple OS detection
  if (ua.includes("Win")) context.os = "Windows";
  else if (ua.includes("Mac")) context.os = "macOS";
  else if (ua.includes("Linux")) context.os = "Linux";
  else if (ua.includes("Android")) context.os = "Android";
  else if (ua.includes("like Mac")) context.os = "iOS";

  // Simple Device detection
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    context.device = "Mobile";
  } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    context.device = "Tablet";
  } else {
    context.device = "Desktop";
  }

  return context;
}
