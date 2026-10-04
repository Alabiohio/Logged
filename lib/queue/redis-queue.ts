import type { DequeueResult, EnqueueResult, LogQueueAdapter, LogQueueItem } from "./types";
import { MemoryQueueAdapter } from "./memory-queue";
import crypto from "crypto";

/**
 * High-Scale Redis Stream Queue Adapter.
 * Supports Upstash Redis REST API or standard Redis connection.
 * Automatically falls back to MemoryQueueAdapter if Redis env vars are omitted.
 */
export class RedisQueueAdapter implements LogQueueAdapter {
    private fallbackMemoryQueue = new MemoryQueueAdapter();
    private redisUrl: string | undefined;
    private redisToken: string | undefined;

    constructor() {
        this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
        this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
    }

    private isRedisConfigured(): boolean {
        return Boolean(this.redisUrl && this.redisToken);
    }

    async enqueueBatch(items: LogQueueItem[]): Promise<EnqueueResult> {
        if (!this.isRedisConfigured()) {
            return this.fallbackMemoryQueue.enqueueBatch(items);
        }

        const jobId = `job_${crypto.randomUUID().replace(/-/g, "")}`;
        const queueKey = "logged:queue:logs_stream";

        try {
            // Send pipeline of LPUSH or XADD requests to Redis REST endpoint
            const payload = items.map((item) => JSON.stringify(item));
            
            const res = await fetch(`${this.redisUrl}/pipeline`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.redisToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload.map((p) => ["RPUSH", queueKey, p])),
                cache: "no-store",
            });

            if (!res.ok) {
                console.warn("[RedisQueue] Pipeline push failed, switching to memory queue fallback.");
                return this.fallbackMemoryQueue.enqueueBatch(items);
            }

            return {
                success: true,
                queuedCount: items.length,
                jobId,
            };
        } catch (error) {
            console.error("[RedisQueue] Error enqueuing batch:", error);
            return this.fallbackMemoryQueue.enqueueBatch(items);
        }
    }

    async dequeueBatch(batchSize: number): Promise<DequeueResult> {
        if (!this.isRedisConfigured()) {
            return this.fallbackMemoryQueue.dequeueBatch(batchSize);
        }

        const queueKey = "logged:queue:logs_stream";
        try {
            // LPOP up to batchSize items from Redis queue
            const res = await fetch(`${this.redisUrl}/lpop/${queueKey}/${batchSize}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.redisToken}`,
                },
                cache: "no-store",
            });

            if (!res.ok) {
                return this.fallbackMemoryQueue.dequeueBatch(batchSize);
            }

            const data = await res.json() as { result?: string | string[] | null };
            const rawItems = data.result;

            if (!rawItems) {
                return { items: [] };
            }

            const stringArray = Array.isArray(rawItems) ? rawItems : [rawItems];
            const items: LogQueueItem[] = [];

            for (const str of stringArray) {
                try {
                    if (str) items.push(JSON.parse(str));
                } catch {
                    // Skip corrupt entry
                }
            }

            const ackHandle = `ack_${crypto.randomUUID().replace(/-/g, "")}`;
            return { items, ackHandle };
        } catch (error) {
            console.error("[RedisQueue] Error dequeuing batch:", error);
            return this.fallbackMemoryQueue.dequeueBatch(batchSize);
        }
    }

    async ack(_ackHandle: string): Promise<void> {
        // Redis LPOP automatically removes items upon pop
        return;
    }

    async length(): Promise<number> {
        if (!this.isRedisConfigured()) {
            return this.fallbackMemoryQueue.length();
        }

        const queueKey = "logged:queue:logs_stream";
        try {
            const res = await fetch(`${this.redisUrl}/llen/${queueKey}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.redisToken}`,
                },
                cache: "no-store",
            });

            if (!res.ok) return this.fallbackMemoryQueue.length();

            const data = await res.json() as { result?: number };
            return data.result ?? 0;
        } catch {
            return this.fallbackMemoryQueue.length();
        }
    }
}
