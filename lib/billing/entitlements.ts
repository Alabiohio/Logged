import { db } from "@/lib/db";
import { projects, usage, paygUsage } from "@/db/schema";
import { getBillingEnabled, getBillingConfig } from "./config";
import { getUserSubscription, ensureFreeSub } from "./subscription";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";

export async function getUserPlan(userId: string): Promise<"free" | "plus"> {
  const subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan || subWithPlan.subscription.status !== "active") {
    return "free";
  }

  const planName = subWithPlan.plan.name.toLowerCase();
  return planName === "plus" ? "plus" : "free";
}

export async function getUserLimits(userId: string) {
  let subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan) {
    await ensureFreeSub(userId);
    subWithPlan = await getUserSubscription(userId);
  }

  const config = await getBillingConfig();
  const planName = subWithPlan?.plan.name.toLowerCase() === "plus" ? "plus" : "free";
  const planConfig = config.plans[planName];

  const maxProjects = subWithPlan?.plan.projectLimit ?? planConfig.projects;
  const maxLogsPerMonth = subWithPlan?.plan.includedLogs ?? planConfig.logsPerMonth;
  const retentionDays = subWithPlan?.plan.retentionDays ?? planConfig.retentionDays;

  const paygEnabled = subWithPlan?.subscription.paygEnabled ?? true;
  const paygSpendingLimit = subWithPlan?.subscription.paygSpendingLimit ?? null;

  return {
    planName,
    maxProjects,
    maxLogsPerMonth,
    retentionDays,
    paygEnabled,
    paygSpendingLimit,
  };
}

export async function canAcceptLog(
  userId: string
): Promise<{ allowed: boolean; reason?: string; overageMode?: "payg" }> {
  const billingEnabled = await getBillingEnabled();
  if (!billingEnabled) {
    return { allowed: true };
  }

  const limits = await getUserLimits(userId);
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  // Query current period usage
  const usageRows = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), gte(usage.periodStart, startOfMonth)))
    .limit(1);

  const logsCount = usageRows.length > 0 ? usageRows[0].logsCount : 0;

  if (logsCount < limits.maxLogsPerMonth) {
    return { allowed: true };
  }

  // Over included monthly limit
  if (!limits.paygEnabled) {
    return { allowed: false, reason: "PAYG_DISABLED" };
  }

  // Check PAYG spending limit if set
  if (limits.paygSpendingLimit !== null) {
    const { isOverPaygSpendingLimit } = await import("./usage");
    const overLimit = await isOverPaygSpendingLimit(userId);
    if (overLimit) {
      return { allowed: false, reason: "PAYG_LIMIT_REACHED" };
    }
  }

  return { allowed: true, overageMode: "payg" };
}


export async function canCreateProject(userId: string): Promise<{ allowed: boolean }> {
  const billingEnabled = await getBillingEnabled();
  if (!billingEnabled) {
    return { allowed: true };
  }

  const limits = await getUserLimits(userId);

  const result = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, userId));

  const projectCount = result[0]?.count ?? 0;
  return { allowed: projectCount < limits.maxProjects };
}
