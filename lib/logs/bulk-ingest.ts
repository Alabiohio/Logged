import { db } from "@/lib/db";
import { logs, usage } from "@/db/schema";
import type { LogQueueItem } from "@/lib/queue/types";
import { getCurrentPeriod } from "@/lib/billing/usage";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const DB_BATCH_CHUNK_SIZE = 1000;

export interface BulkIngestResult {
    totalProcessed: number;
    inserted: number;
    failed: number;
}

/**
 * Perform high-throughput bulk database insertion for dequeued log items.
 * Groups log insertions into optimal chunk sizes and aggregates usage counts per user.
 */
export async function bulkIngestLogs(items: LogQueueItem[]): Promise<BulkIngestResult> {
    if (items.length === 0) {
        return { totalProcessed: 0, inserted: 0, failed: 0 };
    }

    const logRecords = items.map((item) => ({
        id: item.id,
        ...item.log,
    }));

    let insertedCount = 0;
    let failedCount = 0;

    // 1. Chunked bulk insert into `logs` table
    for (let i = 0; i < logRecords.length; i += DB_BATCH_CHUNK_SIZE) {
        const chunk = logRecords.slice(i, i + DB_BATCH_CHUNK_SIZE);
        try {
            await db.insert(logs).values(chunk);
            insertedCount += chunk.length;
        } catch (error) {
            console.error(`[BulkIngest] Error inserting chunk ${i}-${i + chunk.length}:`, error);
            failedCount += chunk.length;
        }
    }

    // 2. Aggregate log counts per user for periodic usage updates
    const userCounts = new Map<string, number>();
    for (const item of items) {
        if (item.userId) {
            userCounts.set(item.userId, (userCounts.get(item.userId) ?? 0) + 1);
        }
    }

    // 3. Perform atomic usage increment per user
    if (userCounts.size > 0) {
        const { periodStart, periodEnd } = getCurrentPeriod();

        for (const [userId, count] of userCounts.entries()) {
            try {
                await db
                    .insert(usage)
                    .values({
                        id: uuidv4(),
                        userId,
                        periodStart,
                        periodEnd,
                        logsCount: count,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: [usage.userId, usage.periodStart],
                        set: {
                            logsCount: sql`${usage.logsCount} + ${count}`,
                            updatedAt: new Date(),
                        },
                    });
            } catch (error) {
                console.error(`[BulkIngest] Error updating usage for user ${userId}:`, error);
            }
        }
    }

    return {
        totalProcessed: items.length,
        inserted: insertedCount,
        failed: failedCount,
    };
}
