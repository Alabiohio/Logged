import { authenticateApiKey, hashApiKey } from "./api-key";

interface CachedAuthResult {
    data: Awaited<ReturnType<typeof authenticateApiKey>>;
    expiresAt: number;
}

const authCache = new Map<string, CachedAuthResult>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

// Periodic cache pruning
if (typeof globalThis !== "undefined") {
    const globalRef = globalThis as unknown as { __authCachePruneTimer?: NodeJS.Timeout };
    if (!globalRef.__authCachePruneTimer) {
        globalRef.__authCachePruneTimer = setInterval(() => {
            const now = Date.now();
            for (const [key, item] of authCache.entries()) {
                if (item.expiresAt < now) {
                    authCache.delete(key);
                }
            }
        }, 60_000);
    }
}

/**
 * Fast cached wrapper for API key authentication.
 * Resolves authentication in sub-millisecond time on cache hits without DB load.
 */
export async function authenticateApiKeyCached(rawKey: string) {
    const hash = hashApiKey(rawKey);
    const now = Date.now();

    const cached = authCache.get(hash);
    if (cached && cached.expiresAt > now) {
        return cached.data;
    }

    const authResult = await authenticateApiKey(rawKey);
    authCache.set(hash, {
        data: authResult,
        expiresAt: now + CACHE_TTL_MS,
    });

    return authResult;
}

/**
 * Invalidate a cached key (e.g. when an API key is revoked or project is updated).
 */
export function invalidateApiKeyCache(rawKey: string) {
    const hash = hashApiKey(rawKey);
    authCache.delete(hash);
}
