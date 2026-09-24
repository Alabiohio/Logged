import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function testM2() {
  console.log("🧪 Testing Milestone M2 (Subscriptions & Entitlements)...");
  const { db } = await import("../lib/db");
  const { users } = await import("../db/schema");
  const {
    ensureFreeSub,
    getUserSubscription,
    setSubscriptionPlan,
    cancelSubscription,
    expireSubscription,
  } = await import("../lib/billing/subscription");
  const { getUserPlan, getUserLimits, canAcceptLog, canCreateProject } = await import(
    "../lib/billing/entitlements"
  );

  const testUserId = `test-user-${uuidv4()}`;
  console.log(`  Created test user ID: ${testUserId}`);

  // Insert a test user into DB
  await db.insert(users).values({
    id: testUserId,
    name: "Test M2 User",
    email: `${testUserId}@example.com`,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    // 1. Test ensureFreeSub idempotency
    console.log("  1. Testing ensureFreeSub idempotency...");
    const sub1 = await ensureFreeSub(testUserId);
    const sub2 = await ensureFreeSub(testUserId);
    if (sub1.id !== sub2.id || sub1.planId !== "free") {
      throw new Error(`Idempotency check failed: sub1.id=${sub1.id}, sub2.id=${sub2.id}`);
    }
    console.log("     ✓ Free subscription created & idempotent!");

    // 2. Test getUserSubscription & getUserPlan
    console.log("  2. Testing getUserSubscription & getUserPlan...");
    const subWithPlan = await getUserSubscription(testUserId);
    if (!subWithPlan || subWithPlan.plan.name !== "free") {
      throw new Error(`getUserSubscription returned invalid plan: ${subWithPlan?.plan.name}`);
    }
    const planName = await getUserPlan(testUserId);
    if (planName !== "free") {
      throw new Error(`getUserPlan returned: ${planName}`);
    }
    console.log("     ✓ getUserPlan returned 'free' as expected!");

    // 3. Test getUserLimits
    console.log("  3. Testing getUserLimits...");
    const limits = await getUserLimits(testUserId);
    if (limits.maxProjects !== 2 || limits.maxLogsPerMonth !== 10000 || limits.retentionDays !== 7) {
      throw new Error(`getUserLimits returned unexpected values: ${JSON.stringify(limits)}`);
    }
    console.log("     ✓ Free plan limits verified:", limits);

    // 4. Test canAcceptLog & canCreateProject
    console.log("  4. Testing canAcceptLog & canCreateProject (billing_enabled=false)...");
    const logCheck = await canAcceptLog(testUserId);
    const projCheck = await canCreateProject(testUserId);
    if (!logCheck.allowed || !projCheck.allowed) {
      throw new Error(`canAcceptLog or canCreateProject blocked request when billing disabled!`);
    }
    console.log("     ✓ Allowed when billing is disabled!");

    // 5. Test setSubscriptionPlan to Plus
    console.log("  5. Testing setSubscriptionPlan to 'plus'...");
    const updatedSub = await setSubscriptionPlan(testUserId, "plus", {
      customerCode: "CUS_test_123",
      subscriptionCode: "SUB_test_123",
    });
    if (updatedSub.planId !== "plus" || updatedSub.paystackCustomerCode !== "CUS_test_123") {
      throw new Error("setSubscriptionPlan failed to set plus plan or customer code");
    }
    const newPlanName = await getUserPlan(testUserId);
    if (newPlanName !== "plus") {
      throw new Error(`getUserPlan returned ${newPlanName} after upgrade to plus`);
    }
    console.log("     ✓ Upgraded to Plus subscription successfully!");

    // 6. Test cancelSubscription
    console.log("  6. Testing cancelSubscription...");
    const cancelled = await cancelSubscription(testUserId);
    if (!cancelled?.cancelAtPeriodEnd) {
      throw new Error("cancelSubscription failed to set cancelAtPeriodEnd");
    }
    const stillPlus = await getUserPlan(testUserId);
    if (stillPlus !== "plus") {
      throw new Error("cancelSubscription revoked Plus access prematurely!");
    }
    console.log("     ✓ cancelSubscription set cancelAtPeriodEnd=true while preserving Plus plan!");

    // 7. Test expireSubscription
    console.log("  7. Testing expireSubscription...");
    const expired = await expireSubscription(testUserId);
    if (expired?.status !== "expired" || expired?.planId !== "free") {
      throw new Error("expireSubscription failed to downgrade to free");
    }
    const finalPlanName = await getUserPlan(testUserId);
    if (finalPlanName !== "free") {
      throw new Error(`getUserPlan returned ${finalPlanName} after expiration`);
    }
    console.log("     ✓ Downgraded to free after expiration!");

    console.log("🎉 All Milestone M2 tests passed successfully!");
  } finally {
    // Cleanup test user & subscriptions
    const { subscriptions } = await import("../db/schema");
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    console.log("🧹 Cleaned up test data.");
  }
}

testM2().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
