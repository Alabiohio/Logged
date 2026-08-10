/**
 * In-memory sliding-window rate limiter.
 *
 * MVP-grade: works for a single process. In a multi-replica deployment,
 * replace the `store` with an Upstash Redis / Vercel KV adapter while
 * keeping this interface identical.
 */

interface WindowEntry {
    timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// Prune the store periodically to avoid unbounded memory growth
setInterval(
    () => {
        const cutoff = Date.now() - WINDOW_MS;
        for (const [key, entry] of store.entries()) {
            entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
            if (entry.timestamps.length === 0) {
                store.delete(key);
            }
        }
    },
    60_000 // every minute
);

const LIMIT = 100;           // max requests
const WINDOW_MS = 60_000;    // per minute

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    /** Unix seconds at which the window resets */
    resetAt: number;
}

/**
 * Check and record a request for the given key.
 * Mutates the in-memory store on every call.
 */
export function checkRateLimit(key: string, limit = LIMIT, windowMs = WINDOW_MS): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Slide the window — drop timestamps older than the window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    const count = entry.timestamps.length;

    if (count >= limit) {
        // Find the oldest timestamp still in the window → that's when the window resets
        const oldestInWindow = entry.timestamps[0]!;
        const resetAt = Math.ceil((oldestInWindow + windowMs) / 1000);

        return { allowed: false, limit, remaining: 0, resetAt };
    }

    // Record this request
    entry.timestamps.push(now);

    const resetAt = Math.ceil((now + windowMs) / 1000);
    return {
        allowed: true,
        limit,
        remaining: limit - entry.timestamps.length,
        resetAt,
    };
}

/**
 * Build the standard rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
    };

    if (!result.allowed) {
        headers["Retry-After"] = String(result.resetAt - Math.floor(Date.now() / 1000));
    }

    return headers;
}
