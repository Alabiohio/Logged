import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

async function testM3() {
  console.log("🧪 Testing Milestone M3 (Usage Metering & Log Enforcement)...");
  const { db } = await import("../lib/db");
  const { users, subscriptions, usage, paygUsage, settings } = await import("../db/schema");
  const { ensureFreeSub, setSubscriptionPlan } = await import("../lib/billing/subscription");
  const {
    getCurrentPeriod,
    getCurrentUsage,
    incrementUsage,
    getPaygAccrual,
  } = await import("../lib/billing/usage");
  const { canAcceptLog } = await import("../lib/billing/entitlements");

  const testUserId = `test-user-m3-${uuidv4()}`;
  console.log(`  Created test user ID: ${testUserId}`);

  // Create test user
  await db.insert(users).values({
    id: testUserId,
    name: "Test M3 User",
    email: `${testUserId}@example.com`,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    // 1. Test getCurrentPeriod
    console.log("  1. Testing getCurrentPeriod...");
    const period = getCurrentPeriod();
    console.log("     ✓ Current period:", period.periodStart.toISOString(), "to", period.periodEnd.toISOString());

    // 2. Test getCurrentUsage creates usage row
    console.log("  2. Testing getCurrentUsage...");
    const usageRow = await getCurrentUsage(testUserId);
    if (!usageRow || usageRow.logsCount !== 0) {
      throw new Error(`getCurrentUsage failed: ${JSON.stringify(usageRow)}`);
    }
    console.log("     ✓ Usage row auto-created with 0 logs.");

    // 3. Test incrementUsage (single & batch)
    console.log("  3. Testing incrementUsage (single + batch)...");
    await incrementUsage(testUserId, 1);
    await incrementUsage(testUserId, 10);
    const updatedUsage = await getCurrentUsage(testUserId);
    if (updatedUsage.logsCount !== 11) {
      throw new Error(`incrementUsage expected 11 logs, got ${updatedUsage.logsCount}`);
    }
    console.log(`     ✓ Usage incremented to ${updatedUsage.logsCount} logs.`);

    // 4. Test getPaygAccrual
    console.log("  4. Testing getPaygAccrual...");
    await ensureFreeSub(testUserId);
    // Artificially inflate usage to 25,000 logs (15,000 over 10,000 limit)
    await db
      .update(usage)
      .set({ logsCount: 25000 })
      .where(and(eq(usage.userId, testUserId), eq(usage.periodStart, period.periodStart)));

    const accrual = await getPaygAccrual(testUserId);
    console.log("     ✓ Accrual calculation for 25k logs on Free plan:", accrual);
    if (accrual.extraLogs !== 15000 || accrual.billableUnits !== 1.5 || accrual.estimatedAmount !== 1000) {
      throw new Error(`Unexpected PAYG accrual calculation: ${JSON.stringify(accrual)}`);
    }

    // 5. Test log enforcement under billing_enabled = false
    console.log("  5. Testing log enforcement when billing_enabled = false...");
    const checkDisabled = await canAcceptLog(testUserId);
    if (!checkDisabled.allowed) {
      throw new Error("canAcceptLog rejected request when billing_enabled = false!");
    }
    console.log("     ✓ Accepted when billing_enabled = false even though over limit.");

    // 6. Test log enforcement under billing_enabled = true (Free plan over limit)
    console.log("  6. Testing log enforcement when billing_enabled = true (Free plan over limit)...");
    await db
      .update(settings)
      .set({ value: "true" })
      .where(eq(settings.key, "billing_enabled"));

    try {
      const checkFreeOver = await canAcceptLog(testUserId);
      if (checkFreeOver.allowed || checkFreeOver.reason !== "PLAN_LIMIT_REACHED") {
        throw new Error(`Expected PLAN_LIMIT_REACHED rejection, got: ${JSON.stringify(checkFreeOver)}`);
      }
      console.log("     ✓ Rejection verified for Free plan over limit:", checkFreeOver);

      // 7. Test Plus plan with PAYG enabled under billing_enabled = true
      console.log("  7. Testing Plus plan with PAYG enabled under billing_enabled = true...");
      const sub = await setSubscriptionPlan(testUserId, "plus");

      // Inflate usage to 125,000 logs (25,000 over Plus 100,000 limit)
      await db
        .update(usage)
        .set({ logsCount: 125000 })
        .where(and(eq(usage.userId, testUserId), eq(usage.periodStart, period.periodStart)));

      const checkPlusPayg = await canAcceptLog(testUserId);
      if (!checkPlusPayg.allowed || checkPlusPayg.overageMode !== "payg") {
        throw new Error(`Expected PAYG allowed, got: ${JSON.stringify(checkPlusPayg)}`);
      }
      console.log("     ✓ Plus plan with PAYG allowed overage:", checkPlusPayg);

      // 8. Test Plus plan with PAYG disabled
      console.log("  8. Testing Plus plan with PAYG disabled...");
      await db
        .update(subscriptions)
        .set({ paygEnabled: false })
        .where(eq(subscriptions.userId, testUserId));

      const checkPlusNoPayg = await canAcceptLog(testUserId);
      if (checkPlusNoPayg.allowed || checkPlusNoPayg.reason !== "PAYG_DISABLED") {
        throw new Error(`Expected PAYG_DISABLED rejection, got: ${JSON.stringify(checkPlusNoPayg)}`);
      }
      console.log("     ✓ Rejection verified when PAYG disabled:", checkPlusNoPayg);

      // 9. Test PAYG spending limit reached
      console.log("  9. Testing PAYG spending limit reached...");
      await db
        .update(subscriptions)
        .set({ paygEnabled: true, paygSpendingLimit: 500 }) // ₦500 cap
        .where(eq(subscriptions.userId, testUserId));

      // Insert payg_usage row of ₦500 (50000 kobo / 500 NGN)
      await db.insert(paygUsage).values({
        id: uuidv4(),
        userId: testUserId,
        subscriptionId: sub.id,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        includedLogs: 100000,
        actualLogs: 125000,
        billableLogs: 25000,
        billableUnits: "2.5000",
        amount: 50000, // 500 NGN in amount field
        currency: "NGN",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const checkCapReached = await canAcceptLog(testUserId);
      if (checkCapReached.allowed || checkCapReached.reason !== "PAYG_LIMIT_REACHED") {
        throw new Error(`Expected PAYG_LIMIT_REACHED rejection, got: ${JSON.stringify(checkCapReached)}`);
      }
      console.log("     ✓ Rejection verified when PAYG spending limit reached:", checkCapReached);

    } finally {
      // Revert billing_enabled back to false
      await db
        .update(settings)
        .set({ value: "false" })
        .where(eq(settings.key, "billing_enabled"));
    }

    console.log("🎉 All Milestone M3 tests passed successfully!");
  } finally {
    // Cleanup test data
    await db.delete(paygUsage).where(eq(paygUsage.userId, testUserId));
    await db.delete(usage).where(eq(usage.userId, testUserId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log("🧹 Cleaned up test data.");
  }
}

testM3().catch((err) => {
  console.error("❌ M3 Test failed:", err);
  process.exit(1);
});
