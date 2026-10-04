import type { ValidLogInput } from "./validate";
import { redactLogInput } from "./redact";
import type { projects } from "@/db/schema";

type Project = typeof projects.$inferSelect;

export interface NormalizedLog {
    projectId: string;
    level: string;
    message: string;
    metadata: string | null;
    environment: string | null;
    source: string | null;
    url: string | null;
    pathname: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    stack: string | null;
    timestamp: Date | null;
}

/**
 * Merge validated client-supplied fields with server-enriched fields.
 *
 * Rules:
 * - userAgent is read from the incoming HTTP request header (not trusted from body)
 * - ipAddress is extracted from x-forwarded-for or x-real-ip (not trusted from body)
 * - timestamp uses the client-supplied value only if it is a valid ISO date string;
 *   otherwise falls back to the current server time
 * - environment falls back to the project's default environment if not supplied
 */
export function normalizeLog(
    input: ValidLogInput,
    project: Project,
    environment: string,
    request: Request
): NormalizedLog {
    const redacted = redactLogInput(input);
    const userAgent = request.headers.get("user-agent") ?? null;
    const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        request.headers.get("x-real-ip") ??
        null;

    let timestamp: Date | null = null;
    if (redacted.timestamp) {
        const parsed = new Date(redacted.timestamp);
        // Only accept the client timestamp if it's a valid date and not absurdly in the future
        if (!isNaN(parsed.getTime()) && parsed.getTime() <= Date.now() + 60_000) {
            timestamp = parsed;
        }
    }

    const resolvedEnvironment = redacted.environment ?? environment;

    return {
        projectId: project.id,
        level: redacted.level,
        message: redacted.message,
        metadata: redacted.metadata ? JSON.stringify(redacted.metadata) : null,
        environment: resolvedEnvironment,
        source: redacted.source ?? null,
        url: redacted.url ?? null,
        pathname: redacted.pathname ?? null,
        userAgent,
        ipAddress,
        stack: redacted.stack ?? null,
        timestamp,
    };
}

export function normalizeBatch(
    inputs: ValidLogInput[],
    project: Project,
    environment: string,
    request: Request
): NormalizedLog[] {
    return inputs.map((input) => normalizeLog(input, project, environment, request));
}
