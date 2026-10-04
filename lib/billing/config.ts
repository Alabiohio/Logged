import { db } from "@/lib/db";
import { settings, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export type PlanLimits = {
  projects: number;
  logsPerMonth: number;
  retentionDays: number;
  paygEnabled: boolean;
};

export type BillingConfig = {
  billingEnabled: boolean;
  signupsEnabled: boolean;
  maintenanceMode: boolean;
  plans: Record<string, PlanLimits>;
  payg: {
    logsPerUnit: number;
    pricePerUnit: number;
  };
  wallet: {
    currency: string;
    minimumDeposit: number;
  };
};

export class BillingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingConfigurationError";
  }
}

export function getBillingPeriodEnd(start: Date, interval: string): Date {
  const end = new Date(start);
  switch (interval) {
    case "daily":
      end.setUTCDate(end.getUTCDate() + 1);
      return end;
    case "weekly":
      end.setUTCDate(end.getUTCDate() + 7);
      return end;
    case "monthly":
    case "quarterly":
    case "biannually":
    case "annually": {
      const monthsToAdd = {
        monthly: 1,
        quarterly: 3,
        biannually: 6,
        annually: 12,
      }[interval];
      const dayOfMonth = end.getUTCDate();
      end.setUTCDate(1);
      end.setUTCMonth(end.getUTCMonth() + monthsToAdd);
      const lastDayOfMonth = new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)
      ).getUTCDate();
      end.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));
      return end;
    }
    default:
      throw new BillingConfigurationError(`Unsupported billing interval "${interval}".`);
  }
}

export function toCurrencyMinorUnits(amount: number, currency: string): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new BillingConfigurationError("Currency amount must be a non-negative finite number.");
  }
  const formatter = new Intl.NumberFormat("en", { style: "currency", currency });
  const multiplier = 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2);
  const minorUnits = amount * multiplier;
  if (!Number.isSafeInteger(minorUnits)) {
    throw new BillingConfigurationError("Currency amount is outside the supported range.");
  }
  return minorUnits;
}

function requiredSetting(
  settingsByKey: Map<string, string>,
  key: string
): string {
  const value = settingsByKey.get(key)?.trim();
  if (!value) {
    throw new BillingConfigurationError(`Required billing setting "${key}" is missing.`);
  }
  return value;
}

function parseBooleanSetting(value: string, key: string): boolean {
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  throw new BillingConfigurationError(`Billing setting "${key}" must be true or false.`);
}

function parsePositiveIntegerSetting(value: string, key: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new BillingConfigurationError(`Billing setting "${key}" must be a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new BillingConfigurationError(`Billing setting "${key}" is outside the supported range.`);
  }
  return parsed;
}

function parseCurrencySetting(value: string, key: string): string {
  const currency = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new BillingConfigurationError(`Billing setting "${key}" must be a three-letter ISO currency code.`);
  }
  try {
    new Intl.NumberFormat("en", { style: "currency", currency });
  } catch {
    throw new BillingConfigurationError(`Billing setting "${key}" must be a supported ISO currency code.`);
  }
  return currency;
}

function readPlanLimits(
  planName: string,
  plan: typeof plans.$inferSelect | undefined
): PlanLimits {
  if (!plan) {
    throw new BillingConfigurationError(`Required "${planName}" plan configuration is missing.`);
  }

  const limits = {
    projects: plan.projectLimit,
    logsPerMonth: plan.includedLogs,
    retentionDays: plan.retentionDays,
  };
  for (const [field, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new BillingConfigurationError(
        `The "${planName}" plan has an invalid ${field} configuration.`
      );
    }
  }
  if (typeof plan.paygEnabled !== "boolean") {
    throw new BillingConfigurationError(
      `The "${planName}" plan has an invalid PAYG eligibility configuration.`
    );
  }
  return { ...limits, paygEnabled: plan.paygEnabled };
}

export async function getBillingEnabled(): Promise<boolean> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "billing_enabled"))
    .limit(1);

  if (!rows[0]) {
    throw new BillingConfigurationError('Required billing setting "billing_enabled" is missing.');
  }
  return parseBooleanSetting(rows[0].value, "billing_enabled");
}

export async function getBillingConfig(): Promise<BillingConfig> {
  const [dbSettings, dbPlans] = await Promise.all([
    db.select({ key: settings.key, value: settings.value }).from(settings),
    db.select().from(plans),
  ]);
  const settingsByKey = new Map(dbSettings.map((setting) => [setting.key, setting.value]));
  const plansByName = new Map(dbPlans.map((plan) => [plan.name, plan]));
  if (!plansByName.has("free")) {
    throw new BillingConfigurationError('Required "free" plan configuration is missing.');
  }
  const configuredPlans = Object.fromEntries(
    dbPlans.map((plan) => [plan.name, readPlanLimits(plan.name, plan)])
  );

  return {
    billingEnabled: parseBooleanSetting(
      requiredSetting(settingsByKey, "billing_enabled"),
      "billing_enabled"
    ),
    signupsEnabled: parseBooleanSetting(
      requiredSetting(settingsByKey, "signups_enabled"),
      "signups_enabled"
    ),
    maintenanceMode: parseBooleanSetting(
      requiredSetting(settingsByKey, "maintenance_mode"),
      "maintenance_mode"
    ),
    plans: configuredPlans,
    payg: {
      logsPerUnit: parsePositiveIntegerSetting(
        requiredSetting(settingsByKey, "payg_logs_per_unit"),
        "payg_logs_per_unit"
      ),
      pricePerUnit: parsePositiveIntegerSetting(
        requiredSetting(settingsByKey, "payg_price_per_unit"),
        "payg_price_per_unit"
      ),
    },
    wallet: {
      currency: parseCurrencySetting(
        requiredSetting(settingsByKey, "wallet_currency"),
        "wallet_currency"
      ),
      minimumDeposit: parsePositiveIntegerSetting(
        requiredSetting(settingsByKey, "minimum_wallet_deposit"),
        "minimum_wallet_deposit"
      ),
    },
  };
}
