import { db } from "@/lib/db";
import { logs, usage, walletAccounts, walletTransactions } from "@/db/schema";
import crypto from "crypto";
import type { NormalizedLog } from "./normalize";
import { getCurrentPeriod } from "@/lib/billing/usage";
import { getBillingConfig, getBillingEnabled } from "@/lib/billing/config";
import { getUserLimits } from "@/lib/billing/entitlements";
import { and, eq, gte, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

function generateLogId(): string {
    // Prefix + UUID v4 without dashes for a short recognisable ID
    return `log_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * Insert a single normalized log into the database.
 * Returns the generated log ID.
 */
export async function ingestLog(normalized: NormalizedLog, userId?: string): Promise<string> {
    const id = generateLogId();

    await db.transaction(async (tx) => {
        await insertLogsAndUsage(tx, [{ id, ...normalized }], userId);
    });

    return id;
}

/**
 * Insert an array of normalized logs in a single database round-trip.
 * Returns the list of generated IDs in the same order as the input.
 */
export async function ingestBatch(normalizedLogs: NormalizedLog[], userId?: string): Promise<string[]> {
    const records = normalizedLogs.map((normalized) => ({
        id: generateLogId(),
        ...normalized,
    }));

    await db.transaction(async (tx) => {
        await insertLogsAndUsage(tx, records, userId);
    });

    return records.map((r) => r.id);
}

async function insertLogsAndUsage(
    tx: TransactionClient,
    records: Array<{ id: string } & NormalizedLog>,
    userId?: string
) {
    await tx.insert(logs).values(records);
    if (!userId || records.length === 0) return;

    const { periodStart, periodEnd } = getCurrentPeriod();
    const [limits, billingEnabled, config] = await Promise.all([
        getUserLimits(userId),
        getBillingEnabled(),
        getBillingConfig(),
    ]);

    const currentRows = await tx
        .select({ logsCount: usage.logsCount })
        .from(usage)
        .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)))
        .limit(1);
    const currentLogs = currentRows[0]?.logsCount ?? 0;
    const projectedLogs = currentLogs + records.length;
    const logsPerUnit = config.payg.logsPerUnit || 10_000;
    const currentUnits = Math.ceil(Math.max(0, currentLogs - limits.maxLogsPerMonth) / logsPerUnit);
    const projectedUnits = Math.ceil(Math.max(0, projectedLogs - limits.maxLogsPerMonth) / logsPerUnit);
    const newUnits = billingEnabled && limits.paygEnabled
        ? Math.max(0, projectedUnits - currentUnits)
        : 0;

    for (let unit = 1; unit <= newUnits; unit++) {
        const idempotencyKey = `payg:${userId}:${periodStart.toISOString()}:${currentUnits + unit}`;
        const existing = await tx
            .select({ id: walletTransactions.id })
            .from(walletTransactions)
            .where(eq(walletTransactions.idempotencyKey, idempotencyKey))
            .limit(1);
        if (existing[0]) continue;

        const wallet = await tx
            .select()
            .from(walletAccounts)
            .where(eq(walletAccounts.userId, userId))
            .limit(1);
        if (!wallet[0]) throw new Error("PAYG wallet is not available");

        const amount = config.payg.pricePerUnit || 500;
        const updated = await tx
            .update(walletAccounts)
            .set({ balance: sql`${walletAccounts.balance} - ${amount}`, updatedAt: new Date() })
            .where(and(eq(walletAccounts.id, wallet[0].id), gte(walletAccounts.balance, amount)))
            .returning();
        if (!updated[0]) throw new Error("PAYG wallet balance is insufficient");

        await tx.insert(walletTransactions).values({
            id: uuidv4(),
            walletId: wallet[0].id,
            userId,
            type: "payg_debit",
            amount: -amount,
            balanceBefore: updated[0].balance + amount,
            balanceAfter: updated[0].balance,
            currency: wallet[0].currency,
            status: "completed",
            provider: null,
            providerReference: null,
            idempotencyKey,
            metadata: JSON.stringify({ periodStart: periodStart.toISOString() }),
            createdAt: new Date(),
        });
    }

    await tx
        .insert(usage)
        .values({
            id: uuidv4(),
            userId,
            periodStart,
            periodEnd,
            logsCount: records.length,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [usage.userId, usage.periodStart],
            set: {
                logsCount: sql`${usage.logsCount} + ${records.length}`,
                updatedAt: new Date(),
            },
        });
}

