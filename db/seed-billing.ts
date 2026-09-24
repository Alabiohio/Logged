import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function seedBilling() {
  console.log("🌱 Seeding billing data...");
  const { db } = await import("../lib/db");
  const { plans, settings } = await import("./schema");

  // 1. Seed Plans
  const plansData = [
    {
      id: "free",
      name: "free",
      displayName: "Free",
      description: "Default free tier for all accounts",
      price: 0, // ₦0
      currency: "NGN",
      interval: null,
      includedLogs: 10_000,
      projectLimit: 2,
      retentionDays: 7,
      paystackPlanCode: null,
      updatedAt: new Date(),
    },
    {
      id: "plus",
      name: "plus",
      displayName: "Plus",
      description: "Pro plan with higher limits and longer retention",
      price: 500_000, // ₦5,000 in kobo
      currency: "NGN",
      interval: "monthly",
      includedLogs: 100_000,
      projectLimit: 10,
      retentionDays: 30,
      paystackPlanCode: null,
      updatedAt: new Date(),
    },
  ];

  for (const plan of plansData) {
    const existing = await db.select().from(plans).where(eq(plans.id, plan.id)).limit(1);
    if (existing.length === 0) {
      await db.insert(plans).values({
        ...plan,
        createdAt: new Date(),
      });
      console.log(`  ✓ Inserted plan: ${plan.displayName}`);
    } else {
      await db.update(plans).set(plan).where(eq(plans.id, plan.id));
      console.log(`  ✓ Updated plan: ${plan.displayName}`);
    }
  }

  // 2. Seed Settings
  const settingsData = [
    { key: "billing_enabled", value: "false" },
    { key: "signups_enabled", value: "true" },
    { key: "maintenance_mode", value: "false" },
    { key: "payg_logs_per_unit", value: "10000" },
    { key: "payg_price_per_unit", value: "500" },
  ];

  for (const setting of settingsData) {
    const existing = await db.select().from(settings).where(eq(settings.key, setting.key)).limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values({
        id: uuidv4(),
        key: setting.key,
        value: setting.value,
        updatedAt: new Date(),
      });
      console.log(`  ✓ Inserted setting: ${setting.key} = ${setting.value}`);
    } else {
      console.log(`  ✓ Setting already exists: ${setting.key} = ${existing[0].value}`);
    }
  }

  console.log("✅ Billing seed completed successfully!");
  process.exit(0);
}

seedBilling().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
