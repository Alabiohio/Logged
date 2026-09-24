import { db } from "@/lib/db";
import { paygUsage, subscriptions, plans, users } from "@/db/schema";
import { getUserSubscription } from "./subscription";
import { getCurrentPeriod, getCurrentUsage, getPaygAccrual } from "./usage";
import { getPaymentProvider } from "./providers";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function settlePaygForUser(userId: string) {
  const subWithPlan = await getUserSubscription(userId);
  if (!subWithPlan || subWithPlan.subscription.status !== "active") {
    return { status: "skipped", reason: "No active subscription" };
  }

  const { periodStart, periodEnd } = getCurrentPeriod();

  // Idempotency check: if charged for this period already, return existing
  const existingCharged = await db
    .select()
    .from(paygUsage)
    .where(and(eq(paygUsage.userId, userId), eq(paygUsage.periodStart, periodStart)))
    .limit(1);

  if (existingCharged.length > 0 && existingCharged[0].status === "charged") {
    return { status: "already_charged", paygUsage: existingCharged[0] };
  }

  const currentUsage = await getCurrentUsage(userId);
  const accrual = await getPaygAccrual(userId);

  if (accrual.extraLogs <= 0 || accrual.estimatedAmount <= 0) {
    return { status: "skipped", reason: "No extra logs to bill" };
  }

  let paygRecordId = existingCharged.length > 0 ? existingCharged[0].id : uuidv4();

  if (existingCharged.length === 0) {
    await db.insert(paygUsage).values({
      id: paygRecordId,
      userId,
      subscriptionId: subWithPlan.subscription.id,
      periodStart,
      periodEnd,
      includedLogs: subWithPlan.plan.includedLogs,
      actualLogs: currentUsage.logsCount,
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
  const userRows = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  const userEmail = userRows[0]?.email;
  const customerCode = subWithPlan.subscription.paystackCustomerCode;

  try {
    if (!customerCode || !userEmail) {
      throw new Error("Missing customer code or user email for settlement charge");
    }

    const provider = await getPaymentProvider();
    const amountKobo = accrual.estimatedAmount * 100;
    const chargeRes = await provider.chargeAuthorization({
      authorizationCode: customerCode,
      email: userEmail,
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

