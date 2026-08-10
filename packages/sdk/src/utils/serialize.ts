/**
 * Utility for safe serialization of console arguments to ensure they can be sent as JSON.
 * Protects against circular references and ensures Error objects are extracted safely.
 */

export function serialize(value: unknown, seen = new WeakSet()): unknown {
  // Primitives and functions
  if (value === null || typeof value !== "object") {
    // If it's undefined or function, we might want to cast to string or undefined.
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    if (value === undefined) {
      return "[undefined]";
    }
    return value;
  }

  // Handle Error objects
  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
    };
  }

  // Circular reference detection
  if (seen.has(value)) {
    return "[Circular]";
  }
  seen.add(value);

  // Handle Arrays
  if (Array.isArray(value)) {
    return value.map((item) => serialize(item, seen));
  }

  // Handle Objects
  const serializedObject: Record<string, unknown> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      try {
        serializedObject[key] = serialize((value as any)[key], seen);
      } catch (err) {
        serializedObject[key] = "[Unserializable]";
      }
    }
  }

  return serializedObject;
}

export function safeSerializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => serialize(arg));
}
