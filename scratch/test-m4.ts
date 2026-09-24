import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import { eq, inArray } from "drizzle-orm";

async function testM4() {
  console.log("🧪 Testing Milestone M4 (Retention Enforcement)...");
  const { db } = await import("../lib/db");
  const { users, projects, logs, settings, subscriptions } = await import("../db/schema");
  const { ensureFreeSub, setSubscriptionPlan } = await import("../lib/billing/subscription");
  const { GET: purgeCron } = await import("../app/api/cron/purge-logs/route");

  const freeUserId = `test-user-free-${uuidv4()}`;
  const plusUserId = `test-user-plus-${uuidv4()}`;

  const freeProjectId = `proj-free-${uuidv4()}`;
  const plusProjectId = `proj-plus-${uuidv4()}`;

  console.log(`  Free User: ${freeUserId}, Plus User: ${plusUserId}`);

  // Create test users & projects
  await db.insert(users).values([
    {
      id: freeUserId,
      name: "Free Retention User",
      email: `${freeUserId}@example.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: plusUserId,
      name: "Plus Retention User",
      email: `${plusUserId}@example.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await ensureFreeSub(freeUserId);
  await ensureFreeSub(plusUserId);
  await setSubscriptionPlan(plusUserId, "plus");

  await db.insert(projects).values([
    {
      id: freeProjectId,
      userId: freeUserId,
      name: "Free Retention Project",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: plusProjectId,
      userId: plusUserId,
      name: "Plus Retention Project",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Insert test logs with specific ages
  const freeLog8d = `log-free-8d-${uuidv4()}`;
  const freeLog31d = `log-free-31d-${uuidv4()}`;
  const freeLog91d = `log-free-91d-${uuidv4()}`;

  const plusLog8d = `log-plus-8d-${uuidv4()}`;
  const plusLog31d = `log-plus-31d-${uuidv4()}`;

  await db.insert(logs).values([
    {
      id: freeLog8d,
      projectId: freeProjectId,
      level: "info",
      message: "8 days old log (Free)",
      createdAt: new Date(now - 8 * DAY_MS),
    },
    {
      id: freeLog31d,
      projectId: freeProjectId,
      level: "info",
      message: "31 days old log (Free)",
      createdAt: new Date(now - 31 * DAY_MS),
    },
    {
      id: freeLog91d,
      projectId: freeProjectId,
      level: "info",
      message: "91 days old log (Free)",
      createdAt: new Date(now - 91 * DAY_MS),
    },
    {
      id: plusLog8d,
      projectId: plusProjectId,
      level: "info",
      message: "8 days old log (Plus)",
      createdAt: new Date(now - 8 * DAY_MS),
    },
    {
      id: plusLog31d,
      projectId: plusProjectId,
      level: "info",
      message: "31 days old log (Plus)",
      createdAt: new Date(now - 31 * DAY_MS),
    },
  ]);

  const authHeader = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : "";

  try {
    // 1. Run purge when billing_enabled = false
    console.log("  1. Testing purge cron when billing_enabled = false (90d soft retention)...");
    await db
      .update(settings)
      .set({ value: "false" })
      .where(eq(settings.key, "billing_enabled"));

    const req1 = new Request("http://localhost:3000/api/cron/purge-logs", {
      headers: { authorization: authHeader },
    });
    const res1 = await purgeCron(req1);
    const body1 = await res1.json();
    console.log("     ✓ Purge cron response (billing_enabled=false):", body1);

    // Verify 91d log deleted, 8d & 31d preserved
    const check91 = await db.select().from(logs).where(eq(logs.id, freeLog91d));
    const check31 = await db.select().from(logs).where(eq(logs.id, freeLog31d));
    const check8 = await db.select().from(logs).where(eq(logs.id, freeLog8d));

    if (check91.length !== 0 || check31.length === 0 || check8.length === 0) {
      throw new Error("90d soft retention check failed! Unexpected logs deleted or kept.");
    }
    console.log("     ✓ Soft 90-day retention verified (only >90d log purged).");

    // 2. Run purge when billing_enabled = true
    console.log("  2. Testing purge cron when billing_enabled = true (Free 7d / Plus 30d)...");
    await db
      .update(settings)
      .set({ value: "true" })
      .where(eq(settings.key, "billing_enabled"));

    const req2 = new Request("http://localhost:3000/api/cron/purge-logs", {
      headers: { authorization: authHeader },
    });
    const res2 = await purgeCron(req2);
    const body2 = await res2.json();
    console.log("     ✓ Purge cron response (billing_enabled=true):", body2);

    // Verify Free user: 8d log purged (7d limit), 31d log purged.
    // Verify Plus user: 8d log KEPT (30d limit), 31d log purged.
    const checkFree8 = await db.select().from(logs).where(eq(logs.id, freeLog8d));
    const checkPlus8 = await db.select().from(logs).where(eq(logs.id, plusLog8d));
    const checkPlus31 = await db.select().from(logs).where(eq(logs.id, plusLog31d));

    if (checkFree8.length !== 0) {
      throw new Error("Free user's 8-day old log was NOT purged!");
    }
    if (checkPlus8.length === 0) {
      throw new Error("Plus user's 8-day old log WAS incorrectly purged!");
    }
    if (checkPlus31.length !== 0) {
      throw new Error("Plus user's 31-day old log was NOT purged!");
    }

    console.log("     ✓ Per-tier retention verified! Free 7d purged, Plus 30d preserved.");

    // 3. Test idempotency (run again)
    console.log("  3. Testing idempotency...");
    const res3 = await purgeCron(req2);
    const body3 = await res3.json();
    console.log("     ✓ Second purge response:", body3);
    if (body3.deletedCount !== 0) {
      throw new Error(`Idempotency check failed: expected 0 deleted, got ${body3.deletedCount}`);
    }

    console.log("🎉 All Milestone M4 tests passed successfully!");
  } finally {
    // Revert billing_enabled back to false
    await db
      .update(settings)
      .set({ value: "false" })
      .where(eq(settings.key, "billing_enabled"));

    // Cleanup test records
    await db.delete(logs).where(inArray(logs.projectId, [freeProjectId, plusProjectId]));
    await db.delete(projects).where(inArray(projects.id, [freeProjectId, plusProjectId]));
    await db.delete(subscriptions).where(inArray(subscriptions.userId, [freeUserId, plusUserId]));
    await db.delete(users).where(inArray(users.id, [freeUserId, plusUserId]));
    console.log("🧹 Cleaned up test data.");
  }
}

testM4().catch((err) => {
  console.error("❌ M4 Test failed:", err);
  process.exit(1);
});
