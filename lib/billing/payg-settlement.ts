import { db } from "@/lib/db";
import { paygUsage, subscriptions, plans } from "@/db/schema";
import { getUserSubscription } from "./subscription";
import { getPreviousPeriod, getUsageForPeriod, getPaygAccrualForPeriod } from "./usage";
import { getPaymentProvider } from "./providers";
import { getBillingProfile, isBillingProfileComplete } from "./profile";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function settlePaygForUser(userId: string) {
  const subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan || subWithPlan.subscription.status !== "active") {
    return { status: "skipped", reason: "No active subscription" };
  }

  const { periodStart, periodEnd } = getPreviousPeriod();

  // Idempotency check: if charged for this period already, return existing
  const existingCharged = await db
    .select()
    .from(paygUsage)
    .where(and(eq(paygUsage.userId, userId), eq(paygUsage.periodStart, periodStart)))
    .limit(1);

  if (existingCharged.length > 0 && existingCharged[0].status === "charged") {
    return { status: "already_charged", paygUsage: existingCharged[0] };
  }

  const periodUsage = await getUsageForPeriod(userId, periodStart);
  if (!periodUsage) {
    return { status: "skipped", reason: "No usage for previous period" };
  }

  const accrual = await getPaygAccrualForPeriod(userId, periodStart);

  if (accrual.extraLogs <= 0 || accrual.estimatedAmount <= 0) {
    return { status: "skipped", reason: "No extra logs to bill" };
  }

  const paygRecordId = existingCharged.length > 0 ? existingCharged[0].id : uuidv4();

  if (existingCharged.length === 0) {
    await db.insert(paygUsage).values({
      id: paygRecordId,
      userId,
      subscriptionId: subWithPlan.subscription.id,
      periodStart,
      periodEnd,
      includedLogs: subWithPlan.plan.includedLogs,
      actualLogs: periodUsage.logsCount,
      billableLogs: accrual.extraLogs,
      billableUnits: accrual.billableUnits.toFixed(4),
      amount: accrual.estimatedAmount,
      currency: accrual.currency,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Look up user email for payment provider charge
  const billingProfile = await getBillingProfile(userId);
  const customerCode = subWithPlan.subscription.paystackCustomerCode;

  try {
    if (!isBillingProfileComplete(billingProfile)) {
      return { status: "skipped", reason: "Billing information required before PAYG settlement" };
    }

    if (!customerCode || !billingProfile?.email) {
      throw new Error("Missing customer code or billing email for settlement charge");
    }

    const provider = await getPaymentProvider();
    const amountKobo = accrual.estimatedAmount * 100;
    const chargeRes = await provider.chargeAuthorization({
      authorizationCode: customerCode,
      email: billingProfile.email,
      amount: amountKobo,
      metadata: {
        userId,
        settlementType: "payg",
        periodStart: periodStart.toISOString(),
      },
    });

    const updated = await db
      .update(paygUsage)
      .set({
        status: "charged",
        paystackRef: chargeRes.reference,
        updatedAt: new Date(),
      })
      .where(eq(paygUsage.id, paygRecordId))
      .returning();

    return { status: "charged", paygUsage: updated[0], reference: chargeRes.reference };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`PAYG settlement failed for user ${userId}:`, errMsg);

    const updated = await db
      .update(paygUsage)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(paygUsage.id, paygRecordId))
      .returning();

    return { status: "failed", error: errMsg, paygUsage: updated[0] };
  }
}

export async function settleAllPaygUsers() {
  const plusSubs = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(and(eq(plans.name, "plus"), eq(subscriptions.status, "active")));

  let totalSettled = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of plusSubs) {
    const res = await settlePaygForUser(sub.userId);
    if (res.status === "charged") {
      totalSettled++;
    } else if (res.status === "failed") {
      failed++;
    } else {
      skipped++;
    }
  }

  return { totalSettled, failed, skipped, processedCount: plusSubs.length };
}
