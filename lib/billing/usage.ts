import { db } from "@/lib/db";
import { usage } from "@/db/schema";
import { getBillingConfig } from "./config";
import { getUserLimits } from "./entitlements";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export function getCurrentPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  
  // Last millisecond of current UTC month
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { periodStart, periodEnd };
}

export async function getCurrentUsage(userId: string) {
  const { periodStart, periodEnd } = getCurrentPeriod();

  const rows = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)))
    .limit(1);

  if (rows.length > 0) {
    return rows[0];
  }

  // Create usage row for current period if none exists
  const newUsage = {
    id: uuidv4(),
    userId,
    periodStart,
    periodEnd,
    logsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const inserted = await db.insert(usage).values(newUsage).returning();
    return inserted[0] || newUsage;
  } catch (error) {
    // Concurrent query check
    const recheck = await db
      .select()
      .from(usage)
      .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)))
      .limit(1);

    if (recheck.length > 0) {
      return recheck[0];
    }
    throw error;
  }
}

export async function incrementUsage(userId: string, count: number = 1): Promise<void> {
  if (count <= 0) return;

  const { periodStart, periodEnd } = getCurrentPeriod();
  const id = uuidv4();

  try {
    await db
      .insert(usage)
      .values({
        id,
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
    console.error(`Failed to increment usage for user ${userId}:`, error);
  }
}

export async function getPaygAccrual(userId: string) {
  const [currentUsage, limits, config] = await Promise.all([
    getCurrentUsage(userId),
    getUserLimits(userId),
    getBillingConfig(),
  ]);

  const logsCount = currentUsage.logsCount;
  const extraLogs = Math.max(0, logsCount - limits.maxLogsPerMonth);
  const logsPerUnit = config.payg.logsPerUnit || 10_000;
  const pricePerUnit = config.payg.pricePerUnit || 500;

  const billableUnits = extraLogs / logsPerUnit;
  const estimatedAmount = Math.ceil(billableUnits) * pricePerUnit;

  return {
    extraLogs,
    billableUnits,
    estimatedAmount,
    currency: "NGN",
  };
}

export async function isOverPaygSpendingLimit(userId: string): Promise<boolean> {
  const limits = await getUserLimits(userId);
  if (limits.paygSpendingLimit === null) {
    return false;
  }
  const accrual = await getPaygAccrual(userId);
  return accrual.estimatedAmount >= limits.paygSpendingLimit;
}

