import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { eq, inArray } from "drizzle-orm";

async function testM5() {
  console.log("🧪 Testing Milestone M5 (Paystack Integration & Billing APIs)...");
  const { db } = await import("../lib/db");
  const { users, subscriptions, settings, billingEvents } = await import("../db/schema");
  const { ensureFreeSub, getUserSubscription } = await import("../lib/billing/subscription");
  const { getUserPlan } = await import("../lib/billing/entitlements");

  const { POST: webhookHandler } = await import("../app/api/webhooks/paystack/route");

  const testUserId = `test-user-m5-${uuidv4()}`;
  const testEmail = `${testUserId}@example.com`;
  console.log(`  Created test user: ${testUserId}`);

  // Create test user
  await db.insert(users).values({
    id: testUserId,
    name: "Test M5 User",
    email: testEmail,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await ensureFreeSub(testUserId);

  try {
    // 1. Test Webhook invalid signature (returns 401)
    console.log("  1. Testing webhook with invalid signature...");
    const badReq = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": "bad_sig" },
      body: JSON.stringify({ event: "charge.success" }),
    });
    const badRes = await webhookHandler(badReq as unknown as import("next/server").NextRequest);
    if (badRes.status !== 401) {
      throw new Error(`Expected 401 for bad signature, got ${badRes.status}`);
    }
    console.log("     ✓ Webhook correctly rejected invalid signature with 401!");

    // 2. Test Webhook valid charge.success event
    console.log("  2. Testing valid charge.success webhook event...");
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || "paystack_webhook_secret_dev";
    const eventId = `evt_${uuidv4()}`;

    const webhookBody = JSON.stringify({
      event: "charge.success",
      data: {
        id: eventId,
        reference: `ref_${uuidv4()}`,
        customer: {
          customer_code: "CUS_m5_test",
          email: testEmail,
        },
        plan: { plan_code: "PLN_plus" },
        metadata: { userId: testUserId },
      },
    });

    const validSignature = crypto
      .createHmac("sha512", webhookSecret)
      .update(webhookBody)
      .digest("hex");

    const validReq = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": validSignature },
      body: webhookBody,
    });

    const validRes = await webhookHandler(validReq as unknown as import("next/server").NextRequest);
    if (validRes.status !== 200) {
      throw new Error(`Webhook failed with status ${validRes.status}`);
    }

    // Verify user upgraded to Plus
    const planName = await getUserPlan(testUserId);
    if (planName !== "plus") {
      throw new Error(`charge.success failed to upgrade user to Plus! Plan name: ${planName}`);
    }
    console.log("     ✓ User upgraded to Plus via charge.success webhook!");

    // 3. Test Webhook Idempotency (Duplicate eventId)
    console.log("  3. Testing webhook idempotency with duplicate event...");
    const dupReq = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": validSignature },
      body: webhookBody,
    });
    const dupRes = await webhookHandler(dupReq as unknown as import("next/server").NextRequest);
    const dupJson = await dupRes.json();
    if (dupRes.status !== 200 || dupJson.message !== "Event already processed") {
      throw new Error(`Idempotency test failed: ${JSON.stringify(dupJson)}`);
    }
    console.log("     ✓ Duplicate webhook event ignored cleanly!");

    // 4. Test Webhook subscription.disable event (Downgrade to Free)
    console.log("  4. Testing subscription.disable webhook event...");
    const disableBody = JSON.stringify({
      event: "subscription.disable",
      data: {
        id: `evt_disable_${uuidv4()}`,
        customer: { email: testEmail },
        metadata: { userId: testUserId },
      },
    });
    const disableSig = crypto
      .createHmac("sha512", webhookSecret)
      .update(disableBody)
      .digest("hex");

    const disableReq = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": disableSig },
      body: disableBody,
    });

    const disableRes = await webhookHandler(disableReq as unknown as import("next/server").NextRequest);
    if (disableRes.status !== 200) {
      throw new Error(`subscription.disable webhook failed with status ${disableRes.status}`);
    }

    const planAfterDisable = await getUserPlan(testUserId);
    if (planAfterDisable !== "free") {
      throw new Error(`subscription.disable failed to downgrade user to Free! Got: ${planAfterDisable}`);
    }
    console.log("     ✓ User downgraded to Free via subscription.disable webhook!");

    console.log("🎉 All Milestone M5 tests passed successfully!");
  } finally {
    // Cleanup test records
    await db.delete(billingEvents).where(eq(billingEvents.userId, testUserId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log("🧹 Cleaned up test data.");
  }
}

testM5().catch((err) => {
  console.error("❌ M5 Test failed:", err);
  process.exit(1);
});
