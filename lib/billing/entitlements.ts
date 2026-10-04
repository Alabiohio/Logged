import { db } from "@/lib/db";
import { projects, plans, usage } from "@/db/schema";
import { getBillingEnabled, getBillingConfig } from "./config";
import { getUserSubscription, ensureFreeSub } from "./subscription";
import { getUserBillingPreferences } from "./preferences";
import { eq, and, gte, count, asc, gt } from "drizzle-orm";

export async function getUserPlan(userId: string): Promise<string> {
  const subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan || subWithPlan.subscription.status !== "active") {
    return "free";
  }

  return subWithPlan.plan.name.toLowerCase();
}

export async function getUserLimits(userId: string) {
  let subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan) {
    await ensureFreeSub(userId);
    subWithPlan = await getUserSubscription(userId);
  }

  const [config, billingPreferences] = await Promise.all([
    getBillingConfig(),
    getUserBillingPreferences(userId),
  ]);
  const activePlan = subWithPlan?.subscription.status === "active" ? subWithPlan.plan : undefined;
  const planName = activePlan?.name.toLowerCase() ?? "free";
  const planConfig = config.plans[planName] ?? config.plans.free;
  if (!planConfig) {
    throw new Error(`Billing configuration for plan "${planName}" is missing.`);
  }

  const maxProjects = activePlan?.projectLimit ?? planConfig.projects;
  const maxLogsPerMonth = activePlan?.includedLogs ?? planConfig.logsPerMonth;
  const retentionDays = activePlan?.retentionDays ?? planConfig.retentionDays;

  const paygAvailable = activePlan?.paygEnabled ?? planConfig.paygEnabled;
  const paygEnabled = paygAvailable && billingPreferences.paygEnabled;
  const paygSpendingLimit = billingPreferences.paygSpendingLimit;

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
  currentPlan?: string;
  currentLimit?: number;
  projectCount?: number;
  nextPlan?: string;
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
  const [nextPlan] = limits.planName === "free"
    ? await db
        .select({ name: plans.name, projectLimit: plans.projectLimit })
        .from(plans)
        .where(and(eq(plans.isActive, true), gt(plans.price, 0)))
        .orderBy(asc(plans.sortOrder), asc(plans.price))
        .limit(1)
    : [];
  const nextPlanName = nextPlan?.name;
  const nextLimit = nextPlan?.projectLimit;

  return {
    allowed: activeProjectCount < limits.maxProjects,
    currentPlan: limits.planName,
    currentLimit: limits.maxProjects,
    projectCount: activeProjectCount,
    ...(nextPlanName ? { nextPlan: nextPlanName, nextLimit } : {}),
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
