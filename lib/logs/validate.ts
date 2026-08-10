const VALID_LEVELS = ["log", "debug", "info", "success", "warn", "error"] as const;
const VALID_ENVIRONMENTS = ["development", "staging", "production"] as const;
const VALID_SOURCES = ["server", "client", "edge"] as const;

export type LogLevel = (typeof VALID_LEVELS)[number];
export type LogEnvironment = (typeof VALID_ENVIRONMENTS)[number];
export type LogSource = (typeof VALID_SOURCES)[number];

const MAX_MESSAGE_BYTES = 10 * 1024;       // 10 KB
const MAX_METADATA_BYTES = 50 * 1024;      // 50 KB
const MAX_STACK_BYTES = 50 * 1024;         // 50 KB

export interface ValidLogInput {
    level: LogLevel;
    message: string;
    metadata?: Record<string, unknown> | null;
    environment?: LogEnvironment | null;
    source?: LogSource | null;
    url?: string | null;
    pathname?: string | null;
    stack?: string | null;
    timestamp?: string | null;
}

type ValidationResult =
    | { valid: true; data: ValidLogInput }
    | { valid: false; error: { code: string; message: string } };

function byteLength(str: string): number {
    return new TextEncoder().encode(str).length;
}

function validateSingleLog(body: unknown): ValidationResult {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return {
            valid: false,
            error: { code: "INVALID_LOG", message: "Log must be a JSON object." },
        };
    }

    const raw = body as Record<string, unknown>;

    // --- level ---
    if (!raw.level || typeof raw.level !== "string") {
        return {
            valid: false,
            error: { code: "INVALID_LOG", message: "Missing required field: level." },
        };
    }
    if (!(VALID_LEVELS as readonly string[]).includes(raw.level)) {
        return {
            valid: false,
            error: {
                code: "INVALID_LOG",
                message: `Invalid log level. Must be one of: ${VALID_LEVELS.join(", ")}.`,
            },
        };
    }

    // --- message ---
    if (!raw.message || typeof raw.message !== "string") {
        return {
            valid: false,
            error: { code: "INVALID_LOG", message: "Missing required field: message." },
        };
    }
    if (byteLength(raw.message) > MAX_MESSAGE_BYTES) {
        return {
            valid: false,
            error: { code: "INVALID_LOG", message: "Field 'message' exceeds 10 KB limit." },
        };
    }

    // --- metadata (optional) ---
    if (raw.metadata !== undefined && raw.metadata !== null) {
        if (typeof raw.metadata !== "object" || Array.isArray(raw.metadata)) {
            return {
                valid: false,
                error: { code: "INVALID_LOG", message: "Field 'metadata' must be a JSON object." },
            };
        }
        const serialized = JSON.stringify(raw.metadata);
        if (byteLength(serialized) > MAX_METADATA_BYTES) {
            return {
                valid: false,
                error: { code: "INVALID_LOG", message: "Field 'metadata' exceeds 50 KB limit." },
            };
        }
    }

    // --- environment (optional) ---
    if (raw.environment !== undefined && raw.environment !== null) {
        if (!(VALID_ENVIRONMENTS as readonly string[]).includes(raw.environment as string)) {
            return {
                valid: false,
                error: {
                    code: "INVALID_LOG",
                    message: `Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(", ")}.`,
                },
            };
        }
    }

    // --- source (optional) ---
    if (raw.source !== undefined && raw.source !== null) {
        if (!(VALID_SOURCES as readonly string[]).includes(raw.source as string)) {
            return {
                valid: false,
                error: {
                    code: "INVALID_LOG",
                    message: `Invalid source. Must be one of: ${VALID_SOURCES.join(", ")}.`,
                },
            };
        }
    }

    // --- stack (optional) ---
    if (raw.stack !== undefined && raw.stack !== null) {
        if (typeof raw.stack !== "string") {
            return {
                valid: false,
                error: { code: "INVALID_LOG", message: "Field 'stack' must be a string." },
            };
        }
        if (byteLength(raw.stack) > MAX_STACK_BYTES) {
            return {
                valid: false,
                error: { code: "INVALID_LOG", message: "Field 'stack' exceeds 50 KB limit." },
            };
        }
    }

    return {
        valid: true,
        data: {
            level: raw.level as LogLevel,
            message: raw.message as string,
            metadata: (raw.metadata as Record<string, unknown>) ?? null,
            environment: (raw.environment as LogEnvironment) ?? null,
            source: (raw.source as LogSource) ?? null,
            url: typeof raw.url === "string" ? raw.url : null,
            pathname: typeof raw.pathname === "string" ? raw.pathname : null,
            stack: typeof raw.stack === "string" ? raw.stack : null,
            timestamp: typeof raw.timestamp === "string" ? raw.timestamp : null,
        },
    };
}

export type BatchValidationResult = {
    valid: ValidLogInput[];
    rejected: Array<{ index: number; error: { code: string; message: string } }>;
};

export function validateLog(body: unknown): ValidationResult {
    return validateSingleLog(body);
}

export function validateBatch(items: unknown[]): BatchValidationResult {
    const valid: ValidLogInput[] = [];
    const rejected: BatchValidationResult["rejected"] = [];

    for (let i = 0; i < items.length; i++) {
        const result = validateSingleLog(items[i]);
        if (result.valid) {
            valid.push(result.data);
        } else {
            rejected.push({ index: i, error: result.error });
        }
    }

    return { valid, rejected };
}
