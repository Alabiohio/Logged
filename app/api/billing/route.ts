import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSubscription, ensureFreeSub } from "@/lib/billing/subscription";
import { getUserLimits, getUserPlan } from "@/lib/billing/entitlements";
import { getCurrentUsage, getPaygAccrual } from "@/lib/billing/usage";
import { getBillingEnabled } from "@/lib/billing/config";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    let subWithPlan = await getUserSubscription(userId);
    if (!subWithPlan) {
      await ensureFreeSub(userId);
      subWithPlan = await getUserSubscription(userId);
    }

    const [planCode, limits, currentUsage, paygAccrual, billingEnabled] = await Promise.all([
      getUserPlan(userId),
      getUserLimits(userId),
      getCurrentUsage(userId),
      getPaygAccrual(userId),
      getBillingEnabled(),
    ]);

    return NextResponse.json({
      plan: {
        id: subWithPlan?.plan.id ?? "free",
        name: subWithPlan?.plan.displayName ?? (planCode === "plus" ? "Plus Plan" : "Free Plan"),
        code: planCode,
        priceMonthly: subWithPlan?.plan.price ?? (planCode === "plus" ? 5000 : 0),
        currency: subWithPlan?.plan.currency ?? "NGN",
        maxLogsPerMonth: limits.maxLogsPerMonth,
        maxProjects: limits.maxProjects,
        retentionDays: limits.retentionDays,
        billingEnabled,
      },
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
        retentionDays: limits.retentionDays,
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
