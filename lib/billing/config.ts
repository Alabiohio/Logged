import { db } from "@/lib/db";
import { settings, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export const BILLING_DEFAULTS = {
  free: { projects: 2, logsPerMonth: 10_000, retentionDays: 7 },
  plus: { projects: 10, logsPerMonth: 100_000, retentionDays: 30 },
  payg: { logsPerUnit: 10_000, pricePerUnit: 500 },
} as const;

export type PlanLimits = {
  projects: number;
  logsPerMonth: number;
  retentionDays: number;
};

export type BillingConfig = {
  billingEnabled: boolean;
  signupsEnabled: boolean;
  maintenanceMode: boolean;
  plans: {
    free: PlanLimits;
    plus: PlanLimits;
  };
  payg: {
    logsPerUnit: number;
    pricePerUnit: number; // in NGN
  };
};

export async function getBillingEnabled(): Promise<boolean> {
  try {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "billing_enabled"))
      .limit(1);

    if (row.length === 0) {
      return false;
    }
    return row[0].value.toLowerCase() === "true";
  } catch (error) {
    console.error("Error reading billing_enabled setting:", error);
    return false;
  }
}

export async function getBillingConfig(): Promise<BillingConfig> {
  const defaultConfig: BillingConfig = {
    billingEnabled: false,
    signupsEnabled: true,
    maintenanceMode: false,
    plans: {
      free: { ...BILLING_DEFAULTS.free },
      plus: { ...BILLING_DEFAULTS.plus },
    },
    payg: { ...BILLING_DEFAULTS.payg },
  };

  try {
    const dbSettings = await db.select().from(settings);
    const dbPlans = await db.select().from(plans);

    const config = { ...defaultConfig };

    for (const s of dbSettings) {
      switch (s.key) {
        case "billing_enabled":
          config.billingEnabled = s.value.toLowerCase() === "true";
          break;
        case "signups_enabled":
          config.signupsEnabled = s.value.toLowerCase() === "true";
          break;
        case "maintenance_mode":
          config.maintenanceMode = s.value.toLowerCase() === "true";
          break;
        case "payg_logs_per_unit":
          config.payg.logsPerUnit = parseInt(s.value, 10) || BILLING_DEFAULTS.payg.logsPerUnit;
          break;
        case "payg_price_per_unit":
          config.payg.pricePerUnit = parseInt(s.value, 10) || BILLING_DEFAULTS.payg.pricePerUnit;
          break;
      }
    }

    for (const p of dbPlans) {
      if (p.name === "free") {
        config.plans.free = {
          projects: p.projectLimit,
          logsPerMonth: p.includedLogs,
          retentionDays: p.retentionDays,
        };
      } else if (p.name === "plus") {
        config.plans.plus = {
          projects: p.projectLimit,
          logsPerMonth: p.includedLogs,
          retentionDays: p.retentionDays,
        };
      }
    }

    return config;
  } catch (error) {
    console.error("Error building billing config from DB:", error);
    return defaultConfig;
  }
}
