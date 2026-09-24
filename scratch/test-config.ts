import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function verifyBillingConfig() {
  console.log("🔍 Verifying billing configuration...");
  const { getBillingEnabled, getBillingConfig, BILLING_DEFAULTS } = await import("../lib/billing/config");

  const enabled = await getBillingEnabled();
  console.log("  getBillingEnabled():", enabled);

  const config = await getBillingConfig();
  console.log("  getBillingConfig():", JSON.stringify(config, null, 2));

  if (enabled === false && config.billingEnabled === false && config.plans.free.projects === 2 && config.plans.plus.projects === 10) {
    console.log("✅ All billing config assertions passed!");
    process.exit(0);
  } else {
    console.error("❌ Billing config assertions failed!");
    process.exit(1);
  }
}

verifyBillingConfig();
