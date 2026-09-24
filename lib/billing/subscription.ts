import { db } from "@/lib/db";
import { subscriptions, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export type SubscriptionWithPlan = {
  subscription: typeof subscriptions.$inferSelect;
  plan: typeof plans.$inferSelect;
};

export async function getUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
  try {
    const rows = await db
      .select()
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return {
      subscription: rows[0].subscriptions,
      plan: rows[0].plans,
    };
  } catch (error) {
    console.error(`Error fetching subscription for user ${userId}:`, error);
    return null;
  }
}

export async function ensureFreeSub(userId: string): Promise<typeof subscriptions.$inferSelect> {
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Ensure free plan exists in DB or fallback ID
  const freePlan = await db.select().from(plans).where(eq(plans.id, "free")).limit(1);
  const planId = freePlan.length > 0 ? freePlan[0].id : "free";

  const newSub = {
    id: uuidv4(),
    userId,
    planId,
    status: "active",
    paystackCustomerCode: null,
    paystackSubscriptionCode: null,
    paystackPlanCode: null,
    currentPeriodStart: new Date(),
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    paygEnabled: true,
    paygSpendingLimit: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const inserted = await db.insert(subscriptions).values(newSub).returning();
    return inserted[0] || newSub;
  } catch (error) {
    // Concurrent inserts might conflict on unique userId index
    const recheck = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (recheck.length > 0) {
      return recheck[0];
    }
    throw error;
  }
}

export async function setSubscriptionPlan(
  userId: string,
  planId: string,
  paystackData?: {
    customerCode?: string;
    subscriptionCode?: string;
    planCode?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }
) {
  const existing = await ensureFreeSub(userId);

  const updateData: Partial<typeof subscriptions.$inferInsert> = {
    planId,
    status: "active",
    updatedAt: new Date(),
  };

  if (paystackData?.customerCode !== undefined) {
    updateData.paystackCustomerCode = paystackData.customerCode;
  }
  if (paystackData?.subscriptionCode !== undefined) {
    updateData.paystackSubscriptionCode = paystackData.subscriptionCode;
  }
  if (paystackData?.planCode !== undefined) {
    updateData.paystackPlanCode = paystackData.planCode;
  }
  if (paystackData?.periodStart !== undefined) {
    updateData.currentPeriodStart = paystackData.periodStart;
  }
  if (paystackData?.periodEnd !== undefined) {
    updateData.currentPeriodEnd = paystackData.periodEnd;
  }

  const updated = await db
    .update(subscriptions)
    .set(updateData)
    .where(eq(subscriptions.id, existing.id))
    .returning();

  return updated[0];
}

export async function cancelSubscription(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub) {
    return null;
  }

  const updated = await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.subscription.id))
    .returning();

  return updated[0];
}

export async function expireSubscription(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub) {
    return null;
  }

  const updated = await db
    .update(subscriptions)
    .set({
      status: "expired",
      planId: "free",
      cancelAtPeriodEnd: false,
      paystackSubscriptionCode: null,
      paystackPlanCode: null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.subscription.id))
    .returning();

  return updated[0];
}
