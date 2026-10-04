import type { NormalizedLog } from "@/lib/logs/normalize";

export interface LogQueueItem {
    id: string;
    log: NormalizedLog;
    userId: string;
    receivedAt: number;
}

export interface EnqueueResult {
    success: boolean;
    queuedCount: number;
    jobId: string;
}

export interface DequeueResult {
    items: LogQueueItem[];
    ackHandle?: string;
}

export interface LogQueueAdapter {
    enqueueBatch(items: LogQueueItem[]): Promise<EnqueueResult>;
    dequeueBatch(batchSize: number): Promise<DequeueResult>;
    ack(ackHandle: string): Promise<void>;
    length(): Promise<number>;
}
