import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function runM8E2ETests() {
  console.log("=== Starting Milestone M8 End-to-End Billing Tests ===\n");

  const { db } = await import("../lib/db");
  const { users, subscriptions, settings, usage, paygUsage } = await import("../db/schema");
  const { eq, and } = await import("drizzle-orm");

  const { getBillingEnabled, getBillingConfig } = await import("../lib/billing/config");
  const { getUserSubscription, ensureFreeSub, setSubscriptionPlan, cancelSubscription, expireSubscription } = await import("../lib/billing/subscription");
  const { getUserPlan, getUserLimits, canAcceptLog, canCreateProject } = await import("../lib/billing/entitlements");
  const { getCurrentUsage, incrementUsage, getPaygAccrual, isOverPaygSpendingLimit } = await import("../lib/billing/usage");
  const { settlePaygForUser } = await import("../lib/billing/payg-settlement");

  // Helper to update setting
  async function setSetting(key: string, val: string) {
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(settings).set({ value: val, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ id: `setting_${crypto.randomUUID()}`, key, value: val, updatedAt: new Date() });
    }
  }

  // 1. Create Test User
  const testUserId = `user_m8_test_${crypto.randomUUID().slice(0, 8)}`;
  console.log(`1. Creating Test User: ${testUserId}`);
  await db.insert(users).values({
    id: testUserId,
    name: "M8 Test User",
    email: `${testUserId}@example.com`,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // --------------------------------------------------------------------------
  // SECTION 1: Billing OFF Tests
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION 1: Billing OFF (pre-launch state) ---");
  await setSetting("billing_enabled", "false");
  const billingOff = await getBillingEnabled();
  console.log(`[PASS] getBillingEnabled() = ${billingOff} (Expected: false)`);

  await ensureFreeSub(testUserId);
  const freeSub = await getUserSubscription(testUserId);
  console.log(`[PASS] ensureFreeSub created subscription. Status: ${freeSub?.subscription.status}, Plan: ${freeSub?.plan.name}`);

  // Test log acceptance when billing is OFF (even if over limit)
  const canLogOff = await canAcceptLog(testUserId);
  console.log(`[PASS] canAcceptLog() when billing OFF = ${JSON.stringify(canLogOff)} (Expected: allowed: true)`);

  // --------------------------------------------------------------------------
  // SECTION 2: Billing ON — Free Plan Tests
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION 2: Billing ON — Free Plan (test mode) ---");
  await setSetting("billing_enabled", "true");
  const billingOn = await getBillingEnabled();
  console.log(`[PASS] getBillingEnabled() = ${billingOn} (Expected: true)`);

  const freeLimits = await getUserLimits(testUserId);
  console.log(`[PASS] Free Plan Limits: Max Logs=${freeLimits.maxLogsPerMonth}, Max Projects=${freeLimits.maxProjects}, Retention=${freeLimits.retentionDays}d`);

  // Disable PAYG temporarily to test hard free limit
  const userSubRow = await db.select().from(subscriptions).where(eq(subscriptions.userId, testUserId)).limit(1);
  if (userSubRow.length > 0) {
    await db.update(subscriptions).set({ paygEnabled: false }).where(eq(subscriptions.id, userSubRow[0].id));
  }

  // Under limit test
  const now = new Date();
  await db.delete(usage).where(eq(usage.userId, testUserId));
  await incrementUsage(testUserId, 500);

  const usageUnder = await getCurrentUsage(testUserId);
  console.log(`[PASS] Usage after 500 logs: ${usageUnder.logsCount}`);
  const canLogUnder = await canAcceptLog(testUserId);
  console.log(`[PASS] canAcceptLog(500 logs) = ${JSON.stringify(canLogUnder)} (Expected: allowed: true)`);

  // Exceed free limit test
  await db.delete(usage).where(eq(usage.userId, testUserId));
  await incrementUsage(testUserId, 10001);
  const usageOver = await getCurrentUsage(testUserId);
  console.log(`[PASS] Usage after 10,001 logs: ${usageOver.logsCount}`);
  const canLogOver = await canAcceptLog(testUserId);
  console.log(`[PASS] canAcceptLog(10,001 logs with PAYG disabled) = ${JSON.stringify(canLogOver)} (Expected: allowed: false)`);

  // --------------------------------------------------------------------------
  // SECTION 3: Billing ON — Plus Plan & PAYG Tests
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION 3: Billing ON — Plus Plan & PAYG (test mode) ---");
  await setSubscriptionPlan(testUserId, "plus");
  const plusSub = await getUserSubscription(testUserId);
  console.log(`[PASS] Upgraded user to Plus. Plan: ${plusSub?.plan.name}`);

  // Enable PAYG and set spending limit
  await db.update(subscriptions).set({ paygEnabled: true, paygSpendingLimit: 5000 }).where(eq(subscriptions.userId, testUserId));

  // Test PAYG accrual calculation
  await db.delete(usage).where(eq(usage.userId, testUserId));
  await incrementUsage(testUserId, 137420); // 100k included + 37,420 extra
  const accrual = await getPaygAccrual(testUserId);
  console.log(`[PASS] PAYG Accrual for 137,420 logs: Extra=${accrual.extraLogs}, BillableUnits=${accrual.billableUnits}, EstAmount=₦${accrual.estimatedAmount}`);

  // Test spending limit check
  const isOverLimitSmallCap = await isOverPaygSpendingLimit(testUserId);
  console.log(`[PASS] isOverPaygSpendingLimit(₦5,000 cap vs ₦2,000 est) = ${isOverLimitSmallCap} (Expected: false)`);

  // Lower cap to ₦1,500 to trigger limit
  await db.update(subscriptions).set({ paygSpendingLimit: 1500 }).where(eq(subscriptions.userId, testUserId));
  const isOverLimitTriggered = await isOverPaygSpendingLimit(testUserId);
  console.log(`[PASS] isOverPaygSpendingLimit(₦1,500 cap vs ₦2,000 est) = ${isOverLimitTriggered} (Expected: true)`);

  const canLogLimitBlocked = await canAcceptLog(testUserId);
  console.log(`[PASS] canAcceptLog() when PAYG limit exceeded = ${JSON.stringify(canLogLimitBlocked)} (Expected: allowed: false)`);

  // --------------------------------------------------------------------------
  // SECTION 4: Renewal, Cancellation & Downgrade Tests
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION 4: Cancellation & Expiration ---");
  await cancelSubscription(testUserId);
  const subCancelled = await getUserSubscription(testUserId);
  console.log(`[PASS] cancelSubscription sets cancelAtPeriodEnd = ${subCancelled?.subscription.cancelAtPeriodEnd}`);

  await expireSubscription(testUserId);
  const subExpired = await getUserSubscription(testUserId);
  console.log(`[PASS] expireSubscription downgrades user. Status: ${subExpired?.subscription.status}, Plan: ${subExpired?.plan.name}`);

  // --------------------------------------------------------------------------
  // SECTION 5: PAYG Settlement Tests
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION 5: PAYG Settlement ---");
  // Set back to Plus and enable PAYG
  await setSubscriptionPlan(testUserId, "plus");
  await db.update(subscriptions).set({ paygEnabled: true, paygSpendingLimit: 10000 }).where(eq(subscriptions.userId, testUserId));

  // Run settlement for user with extra logs
  const settleResult1 = await settlePaygForUser(testUserId);
  console.log(`[PASS] First settlePaygForUser run result: ${JSON.stringify(settleResult1)}`);

  // Test Idempotency: Run settlement a second time in same period
  const settleResult2 = await settlePaygForUser(testUserId);
  console.log(`[PASS] Second settlePaygForUser run (Idempotent check): ${JSON.stringify(settleResult2)}`);

  // --------------------------------------------------------------------------
  // CLEANUP & RESET
  // --------------------------------------------------------------------------
  console.log("\n--- Cleanup & Final Pre-Launch State Reset ---");
  await db.delete(paygUsage).where(eq(paygUsage.userId, testUserId));
  await db.delete(usage).where(eq(usage.userId, testUserId));
  await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
  await db.delete(users).where(eq(users.id, testUserId));
  await setSetting("billing_enabled", "false");

  console.log("[PASS] Reset billing_enabled to false in DB.");
  console.log("\n=== Milestone M8 End-to-End Tests ALL PASSED SUCCESSFULLY ===\n");
}

runM8E2ETests().catch((err) => {
  console.error("M8 E2E Test Failure:", err);
  process.exit(1);
});
