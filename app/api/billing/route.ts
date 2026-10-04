import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSubscription, ensureFreeSub } from "@/lib/billing/subscription";
import { getUserLimits, getUserPlan, syncUserProjectLimits } from "@/lib/billing/entitlements";
import { getCurrentUsage, getPaygAccrual } from "@/lib/billing/usage";
import { getBillingEnabled } from "@/lib/billing/config";
import { db } from "@/lib/db";
import { plans, projects } from "@/db/schema";
import { and, asc, count, eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await syncUserProjectLimits(userId);
    let subWithPlan = await getUserSubscription(userId);
    if (!subWithPlan) {
      await ensureFreeSub(userId);
      subWithPlan = await getUserSubscription(userId);
    }

    const [
      planCode,
      limits,
      currentUsage,
      paygAccrual,
      billingEnabled,
      projectCountResult,
      configuredPlans,
    ] = await Promise.all([
      getUserPlan(userId),
      getUserLimits(userId),
      getCurrentUsage(userId),
      getPaygAccrual(userId),
      getBillingEnabled(),
      db
        .select({ count: count() })
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.isArchived, false))),
      db.select().from(plans).orderBy(asc(plans.sortOrder), asc(plans.name)),
    ]);

    const projectCount = projectCountResult[0]?.count ?? 0;
    const currentPlan = subWithPlan && subWithPlan.subscription.status !== "expired"
      ? subWithPlan.plan
      : configuredPlans.find((availablePlan) => availablePlan.name === "free");
    const availablePlans = configuredPlans.filter(
      (configuredPlan) => configuredPlan.isActive || configuredPlan.id === currentPlan?.id
    );

    return NextResponse.json({
      plan: {
        id: currentPlan?.id ?? "free",
        name: currentPlan?.displayName ?? "Plan unavailable",
        code: planCode,
        price: currentPlan?.price ?? null,
        currency: currentPlan?.currency ?? null,
        interval: currentPlan?.interval ?? null,
        maxLogsPerMonth: limits.maxLogsPerMonth,
        maxProjects: limits.maxProjects,
        retentionDays: limits.retentionDays,
        billingEnabled,
      },
      availablePlans: availablePlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        isActive: plan.isActive,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        includedLogs: plan.includedLogs,
        projectLimit: plan.projectLimit,
        retentionDays: plan.retentionDays,
        paygEnabled: plan.paygEnabled,
      })),
      subscription: subWithPlan
        ? {
            id: subWithPlan.subscription.id,
            status: subWithPlan.subscription.status,
            currentPeriodStart: subWithPlan.subscription.currentPeriodStart,
            currentPeriodEnd: subWithPlan.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subWithPlan.subscription.cancelAtPeriodEnd,
            paystackCustomerCode: subWithPlan.subscription.paystackCustomerCode,
          }
        : null,
      usage: {
        logsCount: currentUsage.logsCount,
        maxLogs: limits.maxLogsPerMonth,
        periodStart: currentUsage.periodStart,
        periodEnd: currentUsage.periodEnd,
      },
      limits: {
        maxProjects: limits.maxProjects,
        projectCount,
        retentionDays: limits.retentionDays,
        paygAvailable: limits.paygAvailable,
      },
      payg: {
        enabled: limits.paygEnabled,
        spendingLimit: limits.paygSpendingLimit,
        accrual: paygAccrual,
      },
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
