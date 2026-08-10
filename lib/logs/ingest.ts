import { db } from "@/lib/db";
import { logs } from "@/db/schema";
import crypto from "crypto";
import type { NormalizedLog } from "./normalize";

function generateLogId(): string {
    // Prefix + UUID v4 without dashes for a short recognisable ID
    return `log_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * Insert a single normalized log into the database.
 * Returns the generated log ID.
 */
export async function ingestLog(normalized: NormalizedLog): Promise<string> {
    const id = generateLogId();

    await db.insert(logs).values({
        id,
        ...normalized,
    });

    return id;
}

/**
 * Insert an array of normalized logs in a single database round-trip.
 * Returns the list of generated IDs in the same order as the input.
 */
export async function ingestBatch(normalizedLogs: NormalizedLog[]): Promise<string[]> {
    const records = normalizedLogs.map((normalized) => ({
        id: generateLogId(),
        ...normalized,
    }));

    await db.insert(logs).values(records);

    return records.map((r) => r.id);
}
