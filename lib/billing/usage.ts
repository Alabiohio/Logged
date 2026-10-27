import { db } from "@/lib/db";
import { usage, logs, projects } from "@/db/schema";
import { getBillingConfig } from "./config";
import { getUserLimits } from "./entitlements";
import { eq, and, sql, count, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export function getPeriodForDate(date: Date = new Date()): { periodStart: Date; periodEnd: Date } {
  const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

  // Last millisecond of current UTC month
  const periodEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { periodStart, periodEnd };
}

export function getCurrentPeriod(): { periodStart: Date; periodEnd: Date } {
  return getPeriodForDate();
}

export function getPreviousPeriod(): { periodStart: Date; periodEnd: Date } {
  const previousMonth = new Date();
  previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1, 1);
  return getPeriodForDate(previousMonth);
}

export async function getUsageForPeriod(userId: string, periodStart: Date) {
  const rows = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)))
    .limit(1);

  return rows[0] ?? null;
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

export async function decrementUsage(userId: string, count: number = 1): Promise<void> {
  if (count <= 0) return;

  const { periodStart } = getCurrentPeriod();

  try {
    await db
      .update(usage)
      .set({
        logsCount: sql`GREATEST(0, ${usage.logsCount} - ${count})`,
        updatedAt: new Date(),
      })
      .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)));
  } catch (error) {
    console.error(`Failed to decrement usage for user ${userId}:`, error);
  }
}

export async function syncUserUsage(userId: string): Promise<void> {
  const { periodStart, periodEnd } = getCurrentPeriod();

  try {
    const [result] = await db
      .select({ count: count() })
      .from(logs)
      .innerJoin(projects, eq(logs.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          gte(logs.createdAt, periodStart),
          lte(logs.createdAt, periodEnd)
        )
      );

    const activeLogsCount = result?.count ?? 0;
    const current = await getCurrentUsage(userId);

    // If recorded usage in DB exceeds logs in active projects (e.g. project deleted),
    // sync recorded usage to reflect active projects.
    if (current.logsCount > activeLogsCount) {
      await db
        .update(usage)
        .set({
          logsCount: activeLogsCount,
          updatedAt: new Date(),
        })
        .where(and(eq(usage.userId, userId), eq(usage.periodStart, periodStart)));
    }
  } catch (error) {
    console.error(`Failed to sync user usage for user ${userId}:`, error);
  }
}

export async function getPaygAccrual(userId: string) {
  const [currentUsage, limits, config] = await Promise.all([
    getCurrentUsage(userId),
    getUserLimits(userId),
    getBillingConfig(),
  ]);

  return calculatePaygAccrual(currentUsage.logsCount, limits.maxLogsPerMonth, config);
}

export async function getPaygAccrualForPeriod(userId: string, periodStart: Date) {
  const [periodUsage, limits, config] = await Promise.all([
    getUsageForPeriod(userId, periodStart),
    getUserLimits(userId),
    getBillingConfig(),
  ]);

  return calculatePaygAccrual(periodUsage?.logsCount ?? 0, limits.maxLogsPerMonth, config);
}

function calculatePaygAccrual(
  logsCount: number,
  includedLogs: number,
  config: Awaited<ReturnType<typeof getBillingConfig>>
) {
  const extraLogs = Math.max(0, logsCount - includedLogs);
  const logsPerUnit = config.payg.logsPerUnit;
  const pricePerUnit = config.payg.pricePerUnit;

  const billableUnits = extraLogs / logsPerUnit;
  const estimatedAmount = Math.ceil(billableUnits) * pricePerUnit;

  return {
    extraLogs,
    billableUnits,
    estimatedAmount,
    currency: config.wallet.currency,
  };
}

export async function isOverPaygSpendingLimit(userId: string, additionalLogs = 0): Promise<boolean> {
  const limits = await getUserLimits(userId);
  if (limits.paygSpendingLimit === null) {
    return false;
  }
  const [currentUsage, config] = await Promise.all([
    getCurrentUsage(userId),
    getBillingConfig(),
  ]);
  const accrual = calculatePaygAccrual(
    currentUsage.logsCount + additionalLogs,
    limits.maxLogsPerMonth,
    config
  );
  return accrual.estimatedAmount >= limits.paygSpendingLimit;
}
