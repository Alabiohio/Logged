import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { plans, settings, walletAccounts } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

const EDITABLE_SETTINGS = new Set([
  "billingEnabled",
  "paymentProvider",
  "paygLogsPerUnit",
  "paygPricePerUnit",
  "walletCurrency",
  "minimumWalletDeposit",
]);

type BillingSettingInput = {
  billingEnabled?: boolean;
  paymentProvider?: "paystack";
  paygLogsPerUnit?: number;
  paygPricePerUnit?: number;
  walletCurrency?: string;
  minimumWalletDeposit?: number;
};

function validPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function validCurrency(value: unknown): value is string {
  if (typeof value !== "string" || !/^[A-Za-z]{3}$/.test(value)) return false;
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: value.toUpperCase() });
    return true;
  } catch {
    return false;
  }
}

function readBoolean(value: string | undefined, key: string): boolean | null {
  if (value === undefined) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Billing setting "${key}" must be true or false.`);
}

function readPositiveInteger(value: string | undefined, key: string): number | null {
  if (value === undefined) return null;
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`Billing setting "${key}" must be a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Billing setting "${key}" is outside the supported range.`);
  }
  return parsed;
}

function parseInput(body: unknown): BillingSettingInput | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object.";
  }

  const values = body as Record<string, unknown>;
  const unknownKey = Object.keys(values).find((key) => !EDITABLE_SETTINGS.has(key));
  if (unknownKey) return `Unsupported billing setting "${unknownKey}".`;
  if (Object.keys(values).length === 0) return "At least one billing setting is required.";

  const parsed: BillingSettingInput = {};
  if ("billingEnabled" in values) {
    if (typeof values.billingEnabled !== "boolean") {
      return "billingEnabled must be a boolean.";
    }
    parsed.billingEnabled = values.billingEnabled;
  }
  if ("paymentProvider" in values) {
    if (values.paymentProvider !== "paystack") {
      return "Only the implemented Paystack provider can be selected.";
    }
    parsed.paymentProvider = "paystack";
  }
  if ("walletCurrency" in values) {
    if (!validCurrency(values.walletCurrency)) {
      return "walletCurrency must be a supported three-letter ISO currency code.";
    }
    parsed.walletCurrency = values.walletCurrency.toUpperCase();
  }
  for (const key of ["paygLogsPerUnit", "paygPricePerUnit", "minimumWalletDeposit"] as const) {
    if (key in values) {
      if (!validPositiveInteger(values[key])) {
        return `${key} must be a positive integer.`;
      }
      parsed[key] = values[key];
    }
  }
  return parsed;
}

async function loadSettings() {
  const rows = await db.select({ key: settings.key, value: settings.value }).from(settings);
  return new Map(rows.map(({ key, value }) => [key, value]));
}

async function validateBillingReady(settingsByKey: Map<string, string>) {
  if (settingsByKey.get("payment_provider") !== "paystack") {
    return "Select the implemented Paystack provider before enabling billing.";
  }
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return "PAYSTACK_SECRET_KEY must be configured in the deployment environment.";
  }
  if (!validCurrency(settingsByKey.get("wallet_currency"))) {
    return "Configure a supported wallet currency before enabling billing.";
  }

  for (const key of ["payg_logs_per_unit", "payg_price_per_unit", "minimum_wallet_deposit"]) {
    try {
      readPositiveInteger(settingsByKey.get(key), key);
    } catch (error) {
      return error instanceof Error ? error.message : `Billing setting "${key}" is invalid.`;
    }
    if (!settingsByKey.has(key)) {
      return `Configure the "${key}" setting before enabling billing.`;
    }
  }

  const activePaidPlans = await db
    .select({
      name: plans.name,
      price: plans.price,
      interval: plans.interval,
      paystackPlanCode: plans.paystackPlanCode,
    })
    .from(plans)
    .where(eq(plans.isActive, true));
  const legacyPlusPlanCode = settingsByKey.get("paystack_plus_plan_code")?.trim();
  const configuredPaidPlans = activePaidPlans.filter(
    (plan) =>
      plan.price > 0 &&
      Boolean(plan.paystackPlanCode?.trim() || (plan.name === "plus" && legacyPlusPlanCode)) &&
      (plan.interval?.trim() ?? "").length > 0
  );
  if (configuredPaidPlans.length === 0) {
    return "At least one active paid plan needs a billing interval and Paystack plan code.";
  }
  return null;
}

async function serializeBillingSettings(values: Map<string, string>) {
  const configurationIssues: string[] = [];
  const paymentProvider = values.get("payment_provider") ?? null;
  if (paymentProvider && paymentProvider !== "paystack") {
    configurationIssues.push(`Unsupported payment provider "${paymentProvider}".`);
  }

  const readValue = <T,>(
    parser: (value: string | undefined, key: string) => T | null,
    value: string | undefined,
    key: string
  ): T | null => {
    try {
      return parser(value, key);
    } catch (error) {
      configurationIssues.push(error instanceof Error ? error.message : `Setting "${key}" is invalid.`);
      return null;
    }
  };
  const walletCurrency = values.get("wallet_currency");
  if (walletCurrency && !validCurrency(walletCurrency)) {
    configurationIssues.push('Billing setting "wallet_currency" must be a supported ISO currency code.');
  }
  const readinessIssue = await validateBillingReady(values);

  return {
    billingEnabled: readValue(readBoolean, values.get("billing_enabled"), "billing_enabled"),
    paymentProvider,
    paygLogsPerUnit: readValue(readPositiveInteger, values.get("payg_logs_per_unit"), "payg_logs_per_unit"),
    paygPricePerUnit: readValue(readPositiveInteger, values.get("payg_price_per_unit"), "payg_price_per_unit"),
    walletCurrency: walletCurrency && validCurrency(walletCurrency) ? walletCurrency.toUpperCase() : null,
    minimumWalletDeposit: readValue(
      readPositiveInteger,
      values.get("minimum_wallet_deposit"),
      "minimum_wallet_deposit"
    ),
    providerCredentialConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    configurationIssues,
    billingReady: readinessIssue === null,
    readinessIssue,
  };
}

export async function GET() {
  const { authorized } = await verifyAdmin("API GET /api/admin/billing");
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    return NextResponse.json(await serializeBillingSettings(await loadSettings()));
  } catch (error) {
    console.error("Error fetching admin billing settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read billing settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { authorized } = await verifyAdmin("API PATCH /api/admin/billing");
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const parsed = parseInput(body);
    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const currentSettings = await loadSettings();
    const nextSettings = new Map(currentSettings);
    const updates: Record<string, string> = {};
    if (parsed.walletCurrency !== undefined) {
      const [walletWithDifferentCurrency] = await db
        .select({ id: walletAccounts.id })
        .from(walletAccounts)
        .where(ne(walletAccounts.currency, parsed.walletCurrency))
        .limit(1);
      if (walletWithDifferentCurrency) {
        return NextResponse.json(
          { error: "Wallet currency cannot be changed while wallets with another currency exist." },
          { status: 409 }
        );
      }
    }
    if (parsed.billingEnabled !== undefined) {
      updates.billing_enabled = String(parsed.billingEnabled);
      nextSettings.set("billing_enabled", updates.billing_enabled);
    }
    if (parsed.paymentProvider !== undefined) {
      updates.payment_provider = parsed.paymentProvider;
      nextSettings.set("payment_provider", parsed.paymentProvider);
    }
    if (parsed.paygLogsPerUnit !== undefined) {
      updates.payg_logs_per_unit = String(parsed.paygLogsPerUnit);
      nextSettings.set("payg_logs_per_unit", updates.payg_logs_per_unit);
    }
    if (parsed.paygPricePerUnit !== undefined) {
      updates.payg_price_per_unit = String(parsed.paygPricePerUnit);
      nextSettings.set("payg_price_per_unit", updates.payg_price_per_unit);
    }
    if (parsed.walletCurrency !== undefined) {
      updates.wallet_currency = parsed.walletCurrency;
      nextSettings.set("wallet_currency", parsed.walletCurrency);
    }
    if (parsed.minimumWalletDeposit !== undefined) {
      updates.minimum_wallet_deposit = String(parsed.minimumWalletDeposit);
      nextSettings.set("minimum_wallet_deposit", updates.minimumWalletDeposit);
    }

    const enablingBilling =
      parsed.billingEnabled === true && currentSettings.get("billing_enabled") !== "true";
    if (enablingBilling) {
      const readinessError = await validateBillingReady(nextSettings);
      if (readinessError) {
        return NextResponse.json({ error: readinessError }, { status: 400 });
      }
    }

    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(updates)) {
        await tx
          .insert(settings)
          .values({ id: `setting_${crypto.randomUUID()}`, key, value, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value, updatedAt: new Date() },
          });
      }
    });

    const values = await loadSettings();
    return NextResponse.json({
      success: true,
      ...await serializeBillingSettings(values),
    });
  } catch (error) {
    console.error("Error updating admin billing settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update billing settings." },
      { status: 500 }
    );
  }
}
