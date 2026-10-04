import type { DequeueResult, EnqueueResult, LogQueueAdapter, LogQueueItem } from "./types";
import crypto from "crypto";

export class MemoryQueueAdapter implements LogQueueAdapter {
    private queue: LogQueueItem[] = [];
    private inFlight = new Map<string, LogQueueItem[]>();

    async enqueueBatch(items: LogQueueItem[]): Promise<EnqueueResult> {
        this.queue.push(...items);
        return {
            success: true,
            queuedCount: items.length,
            jobId: `job_${crypto.randomUUID().replace(/-/g, "")}`,
        };
    }

    async dequeueBatch(batchSize: number): Promise<DequeueResult> {
        if (this.queue.length === 0) {
            return { items: [] };
        }

        const items = this.queue.splice(0, Math.min(batchSize, this.queue.length));
        const ackHandle = `ack_${crypto.randomUUID().replace(/-/g, "")}`;
        this.inFlight.set(ackHandle, items);

        return {
            items,
            ackHandle,
        };
    }

    async ack(ackHandle: string): Promise<void> {
        this.inFlight.delete(ackHandle);
    }

    async length(): Promise<number> {
        return this.queue.length;
    }
}
