import type { LogPayload } from "../types";

export const REDACTION_PLACEHOLDER = "[REDACTED]";

export function normalizeSensitiveKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isSensitiveKey(key: string): boolean {
  const normalized = normalizeSensitiveKey(key);

  return /(?:password|passwd|secret|token|apikey|accesstoken|refreshtoken|authorization|bearer|cookie|sessionid|session|jwt|clientsecret|privatekey|credential|auth)/.test(normalized);
}

export function replaceTokenLikeStrings(value: string): string {
  let next = value;

  next = next.replace(
    /(authorization\s*:\s*)(?:bearer\s*)?([A-Za-z0-9._~+\-/]{4,})/gi,
    "$1[REDACTED]",
  );

  next = next.replace(/\bBearer\s+[A-Za-z0-9._~+\-/]{4,}/gi, REDACTION_PLACEHOLDER);

  next = next.replace(
    /((?:api[_-]?key|client[_-]?secret|secret|token|access[_-]?token|refresh[_-]?token|session[_-]?id|password|passwd|cookie|jwt|authorization|bearer)[\s:=]+)([A-Za-z0-9._~+\-/]+(?:-[A-Za-z0-9._~+\-/]+)*)/gi,
    "$1[REDACTED]",
  );

  return next;
}

export function redactValue<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") {
    if (typeof value === "string") {
      return replaceTokenLikeStrings(value) as T;
    }
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactValue(value.message, seen),
      stack: redactValue(value.stack ?? undefined, seen),
    } as T;
  }

  if (seen.has(value as object)) {
    return "[Circular]" as T;
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen)) as T;
  }

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      output[key] = REDACTION_PLACEHOLDER;
      continue;
    }

    output[key] = redactValue(nestedValue, seen);
  }

  return output as T;
}

export function redactLogPayload(payload: LogPayload): LogPayload {
  return redactValue(payload, new WeakSet<object>()) as LogPayload;
}
