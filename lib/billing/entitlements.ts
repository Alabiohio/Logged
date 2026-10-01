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
  const planName: "free" | "plus" = subWithPlan?.plan.name.toLowerCase() === "plus" ? "plus" : "free";
  const planConfig = config.plans[planName];

  const maxProjects = subWithPlan?.plan.projectLimit ?? planConfig.projects;
  const maxLogsPerMonth = subWithPlan?.plan.includedLogs ?? planConfig.logsPerMonth;
  const retentionDays = subWithPlan?.plan.retentionDays ?? planConfig.retentionDays;

  const paygAvailable = planName === "plus" || config.paygAllowedPlans === "free_plus";
  const paygEnabled = paygAvailable && (subWithPlan?.subscription.paygEnabled ?? true);
  const paygSpendingLimit = subWithPlan?.subscription.paygSpendingLimit ?? null;

  return {
    planName,
    maxProjects,
    maxLogsPerMonth,
    retentionDays,
    paygEnabled,
    paygAvailable,
    paygSpendingLimit,
  };
}

export async function canAcceptLog(
  userId: string,
  additionalLogs = 0
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
  const projectedLogsCount = logsCount + Math.max(0, additionalLogs);

  if (projectedLogsCount <= limits.maxLogsPerMonth) {
    return { allowed: true };
  }

  // Over included monthly limit
  if (!limits.paygEnabled) {
    return { allowed: false, reason: "PAYG_DISABLED" };
  }

  // Check PAYG spending limit if set
  if (limits.paygSpendingLimit !== null) {
    const { isOverPaygSpendingLimit } = await import("./usage");
    const overLimit = await isOverPaygSpendingLimit(userId, additionalLogs);
    if (overLimit) {
      return { allowed: false, reason: "PAYG_LIMIT_REACHED" };
    }
  }

  return { allowed: true, overageMode: "payg" };
}


export async function canCreateProject(userId: string): Promise<{
  allowed: boolean;
  currentPlan?: "free" | "plus";
  currentLimit?: number;
  projectCount?: number;
  nextPlan?: "plus";
  nextLimit?: number;
}> {
  const billingEnabled = await getBillingEnabled();
  if (!billingEnabled) {
    return { allowed: true };
  }

  const limits = await getUserLimits(userId);

  const result = await db
    .select({ count: count() })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.isArchived, false)));

  const activeProjectCount = result[0]?.count ?? 0;
  const nextPlan = limits.planName === "free" ? "plus" : undefined;
  const nextLimit = nextPlan ? (await getBillingConfig()).plans[nextPlan].projects : undefined;

  return {
    allowed: activeProjectCount < limits.maxProjects,
    currentPlan: limits.planName,
    currentLimit: limits.maxProjects,
    projectCount: activeProjectCount,
    ...(nextPlan ? { nextPlan, nextLimit } : {}),
  };
}

/**
 * Syncs project archive status based on the user's current plan limits.
 * When billing is enabled or a plan downgrades, excess active projects
 * (beyond maxProjects) are automatically archived starting from the oldest.
 */
export async function syncUserProjectLimits(userId: string) {
  const billingEnabled = await getBillingEnabled();
  if (!billingEnabled) {
    // If billing is disabled, unarchive all projects
    await db
      .update(projects)
      .set({ isArchived: false, updatedAt: new Date() })
      .where(eq(projects.userId, userId));
    return;
  }

  const limits = await getUserLimits(userId);

  // Fetch all user projects ordered by creation date (oldest first)
  const userProjects = await db
    .select({ id: projects.id, isArchived: projects.isArchived })
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.createdAt);

  // First maxProjects remain active, remaining projects get archived
  for (let i = 0; i < userProjects.length; i++) {
    const proj = userProjects[i];
    const shouldBeArchived = i >= limits.maxProjects;

    if (proj.isArchived !== shouldBeArchived) {
      await db
        .update(projects)
        .set({ isArchived: shouldBeArchived, updatedAt: new Date() })
        .where(eq(projects.id, proj.id));
    }
  }
}

