import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { billingEvents, plans, subscriptions, users } from "@/db/schema";
import { setSubscriptionPlan, expireSubscription } from "@/lib/billing/subscription";
import { syncUserProjectLimits } from "@/lib/billing/entitlements";
import { getPaymentProvider } from "@/lib/billing/providers";
import { creditWalletDeposit } from "@/lib/billing/wallet";
import { getBillingPeriodEnd } from "@/lib/billing/config";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

async function applyPlanPayment(
  userId: string,
  planId: string,
  interval?: string,
  paymentDetails?: { customerCode?: string; subscriptionCode?: string; planCode?: string }
) {
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  const billingInterval = interval || plan?.interval;
  if (!plan || plan.price <= 0 || !billingInterval) {
    console.warn(`Ignoring payment for missing or invalid plan "${planId}".`);
    return false;
  }

  const periodStart = new Date();
  await setSubscriptionPlan(userId, plan.id, {
    ...paymentDetails,
    periodStart,
    periodEnd: getBillingPeriodEnd(periodStart, billingInterval),
  });
  await syncUserProjectLimits(userId, { restoreWithinPlanLimit: true });
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const provider = await getPaymentProvider("paystack");

    // Paystack signs webhooks with your Secret Key (HMAC-SHA512)
    const webhookSecret = process.env.PAYSTACK_SECRET_KEY;

    // Verify HMAC signature with Secret Key
    if (!webhookSecret || !signature) {
      console.warn("Paystack webhook: PAYSTACK_SECRET_KEY not set or signature missing");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const expectedHash = crypto.createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
    if (expectedHash !== signature) {
      console.warn("Paystack webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    void provider; // provider still used below for parseWebhookEvent
    const parsedEvent = provider.parseWebhookEvent(rawBody);
    const { eventType, providerEventId } = parsedEvent;

    // 1. Duplicate check
    const existingEvent = await db
      .select()
      .from(billingEvents)
      .where(eq(billingEvents.providerEventId, providerEventId))
      .limit(1);

    if (existingEvent.length > 0) {
      console.log(`Duplicate Paystack webhook event ignored: ${providerEventId}`);
      return NextResponse.json({ status: true, message: "Event already processed" }, { status: 200 });
    }

    // Identify user
    let userId: string | null = parsedEvent.userId || null;
    const rawData = (parsedEvent.raw as { data?: { customer?: { email?: string } } })?.data;
    if (!userId && rawData?.customer?.email) {
      const u = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, rawData.customer.email))
        .limit(1);
      if (u.length > 0) {
        userId = u[0].id;
      }
    }

    // Insert billing_events audit log record
    const eventLogId = uuidv4();
    await db.insert(billingEvents).values({
      id: eventLogId,
      userId,
      eventType,
      provider: provider.name,
      providerEventId,
      payload: rawBody,
      createdAt: new Date(),
    });

    // 2. Process event actions
    if (userId) {
      switch (eventType) {
        case "charge.success": {
          if (parsedEvent.metadata?.type === "wallet_deposit") {
            const providerReference = (parsedEvent.raw as { data?: { reference?: string } })?.data?.reference;
            const metadataAmount = Number(parsedEvent.metadata.amount);
            const rawAmount = (parsedEvent.raw as { data?: { amount?: number } })?.data?.amount;
            const amount = Number.isInteger(metadataAmount) && metadataAmount > 0
              ? metadataAmount
              : typeof rawAmount === "number" ? Math.floor(rawAmount / 100) : 0;

            if (amount > 0 && providerReference) {
              await creditWalletDeposit({
                userId,
                amount,
                providerReference,
                idempotencyKey: `deposit:${provider.name}:${providerReference}`,
              });
            }
            break;
          }

          if (
            parsedEvent.metadata?.userId === userId &&
            typeof parsedEvent.metadata.planId === "string"
          ) {
            const interval = typeof parsedEvent.metadata.interval === "string"
              ? parsedEvent.metadata.interval
              : undefined;
            await applyPlanPayment(userId, parsedEvent.metadata.planId, interval, {
              customerCode: parsedEvent.customerCode,
              subscriptionCode: parsedEvent.subscriptionCode,
              planCode: parsedEvent.planCode,
            });
          } else {
            console.info(`Ignoring Paystack charge.success without plan metadata: ${providerEventId}`);
          }
          break;
        }

        case "subscription.create": {
          if (
            parsedEvent.metadata?.userId !== userId ||
            typeof parsedEvent.metadata.planId !== "string"
          ) {
            console.info(`Ignoring Paystack subscription.create without plan metadata: ${providerEventId}`);
            break;
          }

          const interval = typeof parsedEvent.metadata.interval === "string"
            ? parsedEvent.metadata.interval
            : undefined;
          await applyPlanPayment(userId, parsedEvent.metadata.planId, interval, {
            customerCode: parsedEvent.customerCode,
            subscriptionCode: parsedEvent.subscriptionCode,
            planCode: parsedEvent.planCode,
          });
          break;
        }

        case "subscription.not_renewed":
        case "invoice.payment_failed": {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.userId, userId));
          await syncUserProjectLimits(userId);
          break;
        }

        case "subscription.disable": {
          await expireSubscription(userId);
          await syncUserProjectLimits(userId);
          break;
        }
      }
    }

    // Mark event as processed
    await db
      .update(billingEvents)
      .set({ processedAt: new Date() })
      .where(eq(billingEvents.id, eventLogId));

    return NextResponse.json({ status: true, message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ status: false, error: "Internal processing error" }, { status: 200 });
  }
}
