import { db } from "@/lib/db";
import { plans, settings } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import PricingClient, { PricingPlan, PaygRate } from "./PricingClient";

export default async function Pricing() {
  let activePlans: PricingPlan[] = [];
  let paygRate: PaygRate = {
    pricePerUnit: 500,
    logsPerUnit: 10_000,
    currency: "NGN",
  };

  try {
    const [fetchedPlans, fetchedSettings] = await Promise.all([
      db
        .select()
        .from(plans)
        .where(eq(plans.isActive, true))
        .orderBy(asc(plans.sortOrder), asc(plans.name)),
      db
        .select()
        .from(settings)
        .where(
          inArray(settings.key, [
            "payg_logs_per_unit",
            "payg_price_per_unit",
          ])
        ),
    ]);

    if (fetchedPlans && fetchedPlans.length > 0) {
      activePlans = fetchedPlans;
    }

    if (fetchedSettings && fetchedSettings.length > 0) {
      const settingsMap = new Map(fetchedSettings.map((s) => [s.key, s.value]));
      const logsVal = settingsMap.get("payg_logs_per_unit");
      const priceVal = settingsMap.get("payg_price_per_unit");

      if (logsVal && !isNaN(Number(logsVal))) {
        paygRate.logsPerUnit = Number(logsVal);
      }
      if (priceVal && !isNaN(Number(priceVal))) {
        paygRate.pricePerUnit = Number(priceVal);
      }
    }
  } catch (error) {
    console.error("Failed to query plans and settings for Pricing section:", error);
  }

  return <PricingClient initialPlans={activePlans} paygRate={paygRate} />;
}
