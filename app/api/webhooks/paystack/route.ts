import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { billingEvents, subscriptions, users } from "@/db/schema";
import { setSubscriptionPlan, expireSubscription } from "@/lib/billing/subscription";
import { getPaymentProvider } from "@/lib/billing/providers";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const provider = await getPaymentProvider("paystack");

    // Verify HMAC signature via provider
    if (!provider.verifyWebhookSignature(rawBody, signature)) {
      console.warn("Paystack webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

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
          await setSubscriptionPlan(userId, "plus", {
            customerCode: parsedEvent.customerCode,
            subscriptionCode: parsedEvent.subscriptionCode,
            planCode: parsedEvent.planCode,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
          break;
        }

        case "subscription.create": {
          await setSubscriptionPlan(userId, "plus", {
            customerCode: parsedEvent.customerCode,
            subscriptionCode: parsedEvent.subscriptionCode,
            planCode: parsedEvent.planCode,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
          break;
        }

        case "subscription.not_renewed":
        case "invoice.payment_failed": {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.userId, userId));
          break;
        }

        case "subscription.disable": {
          await expireSubscription(userId);
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

