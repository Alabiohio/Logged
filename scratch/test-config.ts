import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function verifyBillingConfig() {
  console.log("🔍 Verifying billing configuration...");
  const { getBillingEnabled, getBillingConfig } = await import("../lib/billing/config");

  const enabled = await getBillingEnabled();
  console.log("  getBillingEnabled():", enabled);

  const config = await getBillingConfig();
  console.log("  getBillingConfig():", JSON.stringify(config, null, 2));

  if (
    enabled === config.billingEnabled &&
    Number.isSafeInteger(config.plans.free.projects) &&
    Number.isSafeInteger(config.plans.plus.projects) &&
    config.payg.logsPerUnit > 0 &&
    config.payg.pricePerUnit > 0
  ) {
    console.log("✅ All billing config assertions passed!");
    process.exit(0);
  } else {
    console.error("❌ Billing config assertions failed!");
    process.exit(1);
  }
}

verifyBillingConfig();
