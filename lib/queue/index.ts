import { LogQueueAdapter } from "./types";
import { RedisQueueAdapter } from "./redis-queue";
import { MemoryQueueAdapter } from "./memory-queue";

/**
 * Global singleton Queue Adapter instance.
 * Automatically switches between Redis Stream Queue and Memory Queue.
 */
function createLogQueue(): LogQueueAdapter {
    const hasRedis = Boolean(
        process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
    );

    if (hasRedis) {
        return new RedisQueueAdapter();
    }

    return new MemoryQueueAdapter();
}

// Global reference for Next.js HMR stability
const globalForQueue = globalThis as unknown as { logQueue?: LogQueueAdapter };

export const logQueue = globalForQueue.logQueue ?? createLogQueue();

if (process.env.NODE_ENV !== "production") {
    globalForQueue.logQueue = logQueue;
}

export * from "./types";
