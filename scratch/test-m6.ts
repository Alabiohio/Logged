import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

async function testM6() {
  console.log("🧪 Testing Milestone M6 (PAYG Metering & Settlement)...");
  const { db } = await import("../lib/db");
  const { users, subscriptions, usage, paygUsage, settings } = await import("../db/schema");
  const { ensureFreeSub, setSubscriptionPlan } = await import("../lib/billing/subscription");
  const {
    getCurrentPeriod,
    getCurrentUsage,
    getPaygAccrual,
    isOverPaygSpendingLimit,
  } = await import("../lib/billing/usage");
  const { canAcceptLog } = await import("../lib/billing/entitlements");
  const { settlePaygForUser, settleAllPaygUsers } = await import("../lib/billing/payg-settlement");

  const testUserId = `test-user-m6-${uuidv4()}`;
  const testEmail = `${testUserId}@example.com`;
  console.log(`  Created test user: ${testUserId}`);

  // Create test user
  await db.insert(users).values({
    id: testUserId,
    name: "Test M6 User",
    email: testEmail,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const sub = await setSubscriptionPlan(testUserId, "plus", {
    customerCode: "CUS_m6_test",
  });
  const period = getCurrentPeriod();

  try {
    // 1. Test getPaygAccrual & isOverPaygSpendingLimit
    console.log("  1. Testing getPaygAccrual & isOverPaygSpendingLimit...");
    // Initialize current usage row first
    await getCurrentUsage(testUserId);

    // Inflate usage to 140,000 logs (40,000 logs over Plus 100,000 limit)
    await db
      .update(usage)
      .set({ logsCount: 140000 })
      .where(and(eq(usage.userId, testUserId), eq(usage.periodStart, period.periodStart)));

    const accrual = await getPaygAccrual(testUserId);
    console.log("     ✓ Accrual for 140k logs on Plus plan:", accrual);
    if (accrual.extraLogs !== 40000 || accrual.billableUnits !== 4.0 || accrual.estimatedAmount !== 2000) {
      throw new Error(`Unexpected accrual values: ${JSON.stringify(accrual)}`);
    }

    // Set spending limit of ₦1,500 (lower than ₦2,000 estimated amount)
    await db
      .update(subscriptions)
      .set({ paygSpendingLimit: 1500 })
      .where(eq(subscriptions.userId, testUserId));

    const isOver = await isOverPaygSpendingLimit(testUserId);
    if (!isOver) {
      throw new Error("isOverPaygSpendingLimit returned false when ₦2,000 > ₦1,500 cap!");
    }
    console.log("     ✓ isOverPaygSpendingLimit returned true as expected!");

    // 2. Test spending limit enforcement in canAcceptLog
    console.log("  2. Testing spending limit enforcement in canAcceptLog (billing_enabled=true)...");
    await db
      .update(settings)
      .set({ value: "true" })
      .where(eq(settings.key, "billing_enabled"));

    try {
      const checkCap = await canAcceptLog(testUserId);
      if (checkCap.allowed || checkCap.reason !== "PAYG_LIMIT_REACHED") {
        throw new Error(`Expected PAYG_LIMIT_REACHED rejection, got: ${JSON.stringify(checkCap)}`);
      }
      console.log("     ✓ canAcceptLog correctly blocked log ingestion due to PAYG limit cap!");
    } finally {
      await db
        .update(settings)
        .set({ value: "false" })
        .where(eq(settings.key, "billing_enabled"));
    }

    // 3. Test settlePaygForUser
    console.log("  3. Testing settlePaygForUser...");
    const settlement1 = await settlePaygForUser(testUserId);
    console.log("     ✓ Settlement result 1:", settlement1);

    // Verify payg_usage row created in DB
    const paygRows = await db
      .select()
      .from(paygUsage)
      .where(and(eq(paygUsage.userId, testUserId), eq(paygUsage.periodStart, period.periodStart)));

    if (paygRows.length !== 1) {
      throw new Error(`Expected 1 payg_usage row, found ${paygRows.length}`);
    }
    const paygRow = paygRows[0];
    if (paygRow.includedLogs !== 100000 || paygRow.actualLogs !== 140000 || paygRow.billableLogs !== 40000 || paygRow.amount !== 2000) {
      throw new Error(`Unexpected payg_usage record values: ${JSON.stringify(paygRow)}`);
    }
    console.log("     ✓ payg_usage record fields verified:", paygRow);

    // 4. Test idempotency of settlePaygForUser
    console.log("  4. Testing settlePaygForUser idempotency...");
    const settlement2 = await settlePaygForUser(testUserId);
    console.log("     ✓ Settlement result 2 (idempotent):", settlement2);

    const recheckedPaygRows = await db
      .select()
      .from(paygUsage)
      .where(and(eq(paygUsage.userId, testUserId), eq(paygUsage.periodStart, period.periodStart)));

    if (recheckedPaygRows.length !== 1) {
      throw new Error(`Idempotency failed: duplicated payg_usage rows! Count: ${recheckedPaygRows.length}`);
    }
    console.log("     ✓ Idempotency verified: no duplicate payg_usage records created!");

    // 5. Test settleAllPaygUsers cron helper
    console.log("  5. Testing settleAllPaygUsers...");
    const allSettleRes = await settleAllPaygUsers();
    console.log("     ✓ settleAllPaygUsers output:", allSettleRes);

    console.log("🎉 All Milestone M6 tests passed successfully!");
  } finally {
    // Cleanup test data
    await db.delete(paygUsage).where(eq(paygUsage.userId, testUserId));
    await db.delete(usage).where(eq(usage.userId, testUserId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log("🧹 Cleaned up test data.");
  }
}

testM6().catch((err) => {
  console.error("❌ M6 Test failed:", err);
  process.exit(1);
});
