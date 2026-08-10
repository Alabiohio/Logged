export interface NormalizedError {
  message: string;
  stack?: string;
  name?: string;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  
  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  // Handle Event / ErrorEvent objects that might not be instances of Error
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    
    // If it has an embedded Error object (like ErrorEvent.error)
    if (obj.error instanceof Error) {
      return {
        message: obj.error.message,
        stack: obj.error.stack,
        name: obj.error.name,
      };
    }

    // If it has a message property but isn't an Error instance
    if (typeof obj.message === "string") {
      return {
        message: obj.message,
        name: typeof obj.name === "string" ? obj.name : undefined,
      };
    }

    try {
      return {
        message: JSON.stringify(error),
      };
    } catch (e) {
      return {
        message: "Unserializable error object",
      };
    }
  }

  return {
    message: "Unknown error",
  };
}
