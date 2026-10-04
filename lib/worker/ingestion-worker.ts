import { logQueue } from "@/lib/queue";
import { bulkIngestLogs } from "@/lib/logs/bulk-ingest";

export interface WorkerOptions {
    batchSize?: number;
    pollIntervalMs?: number;
}

/**
 * High-Scale Background Ingestion Worker.
 * Dequeues logs from queue buffer in batches and executes bulk inserts.
 */
export class IngestionWorker {
    private isRunning = false;
    private batchSize: number;
    private pollIntervalMs: number;

    constructor(options: WorkerOptions = {}) {
        this.batchSize = options.batchSize ?? 2000;
        this.pollIntervalMs = options.pollIntervalMs ?? 100;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log(`[IngestionWorker] Worker started. Batch size: ${this.batchSize}`);
        void this.loop();
    }

    public stop() {
        this.isRunning = false;
        console.log("[IngestionWorker] Worker stopping...");
    }

    private async loop() {
        while (this.isRunning) {
            try {
                const dequeueRes = await logQueue.dequeueBatch(this.batchSize);

                if (dequeueRes.items.length > 0) {
                    const startTime = Date.now();
                    const result = await bulkIngestLogs(dequeueRes.items);
                    const elapsed = Date.now() - startTime;

                    if (dequeueRes.ackHandle) {
                        await logQueue.ack(dequeueRes.ackHandle);
                    }

                    console.log(
                        `[IngestionWorker] Processed ${result.inserted}/${result.totalProcessed} logs in ${elapsed}ms`
                    );
                } else {
                    // Queue empty — sleep briefly before polling again
                    await new Promise((r) => setTimeout(r, this.pollIntervalMs));
                }
            } catch (error) {
                console.error("[IngestionWorker] Error in worker loop:", error);
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
    }
}

// Global singleton worker instance for dev or embedded runner
const globalForWorker = globalThis as unknown as { ingestionWorker?: IngestionWorker };

export const ingestionWorker = globalForWorker.ingestionWorker ?? new IngestionWorker();

if (process.env.NODE_ENV !== "production") {
    globalForWorker.ingestionWorker = ingestionWorker;
}
