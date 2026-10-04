import { verifyAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { plans, settings } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const PLAN_INTERVALS = new Set(["daily", "weekly", "monthly", "quarterly", "biannually", "annually"]);

type PlanInput = {
  displayName: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string | null;
  includedLogs: number;
  projectLimit: number;
  retentionDays: number;
  paystackPlanCode: string | null;
  isActive: boolean;
  sortOrder: number;
  paygEnabled: boolean;
};

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parsePlanInput(body: unknown, allowId = false): PlanInput | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object.";
  }
  const values = body as Record<string, unknown>;
  const supportedFields = new Set([
    "displayName",
    "description",
    "price",
    "currency",
    "interval",
    "includedLogs",
    "projectLimit",
    "retentionDays",
    "paystackPlanCode",
    "isActive",
    "sortOrder",
    "paygEnabled",
  ]);
  if (allowId) supportedFields.add("id");
  const unsupportedField = Object.keys(values).find((field) => !supportedFields.has(field));
  if (unsupportedField) return `Unsupported plan field "${unsupportedField}".`;
  const requiredFields = [
    "displayName",
    "price",
    "currency",
    "includedLogs",
    "projectLimit",
    "retentionDays",
    "isActive",
    "sortOrder",
    "paygEnabled",
  ];
  const missingField = requiredFields.find((field) => !(field in values));
  if (missingField) return `The "${missingField}" field is required.`;
  if (typeof values.displayName !== "string" || !values.displayName.trim() || values.displayName.trim().length > 80) {
    return "Plan name must contain 1 to 80 characters.";
  }
  if (
    values.description !== undefined &&
    values.description !== null &&
    (typeof values.description !== "string" || values.description.length > 1000)
  ) {
    return "Plan description must be 1,000 characters or fewer.";
  }
  const price = values.price;
  const includedLogs = values.includedLogs;
  const projectLimit = values.projectLimit;
  const retentionDays = values.retentionDays;
  const sortOrder = values.sortOrder;
  if (!isNonNegativeInteger(price)) return "price must be a non-negative integer.";
  if (!isNonNegativeInteger(includedLogs)) return "includedLogs must be a non-negative integer.";
  if (!isNonNegativeInteger(projectLimit)) return "projectLimit must be a non-negative integer.";
  if (!isNonNegativeInteger(retentionDays)) return "retentionDays must be a non-negative integer.";
  if (!isNonNegativeInteger(sortOrder)) return "sortOrder must be a non-negative integer.";

  const displayName = values.displayName;
  const description = values.description;
  const currency = values.currency;
  const interval = values.interval;
  const isActive = values.isActive;
  const paygEnabled = values.paygEnabled;
  const paystackPlanCode = values.paystackPlanCode;
  if (typeof currency !== "string" || !/^[A-Za-z]{3}$/.test(currency)) {
    return "Currency must be a three-letter ISO currency code.";
  }
  try {
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency.toUpperCase(),
    });
  } catch {
    return "Currency must be a supported ISO currency code.";
  }
  if (
    interval !== undefined &&
    interval !== null &&
    (typeof interval !== "string" || !PLAN_INTERVALS.has(interval))
  ) {
    return "Interval must be daily, weekly, monthly, quarterly, biannually, annually, or blank.";
  }
  if (price > 0 && !interval) {
    return "Paid plans must have a recurring billing interval.";
  }
  if (typeof isActive !== "boolean" || typeof paygEnabled !== "boolean") {
    return "isActive and paygEnabled must be boolean values.";
  }
  if (
    paystackPlanCode !== undefined &&
    paystackPlanCode !== null &&
    (typeof paystackPlanCode !== "string" || paystackPlanCode.trim().length > 128)
  ) {
    return "Paystack plan code must be 128 characters or fewer.";
  }

  return {
    displayName: displayName.trim(),
    description: typeof description === "string" ? description.trim() || null : null,
    price,
    currency: currency.toUpperCase(),
    interval: typeof interval === "string" ? interval : null,
    includedLogs,
    projectLimit,
    retentionDays,
    paystackPlanCode:
      typeof paystackPlanCode === "string" ? paystackPlanCode.trim() || null : null,
    isActive,
    sortOrder,
    paygEnabled,
  };
}

function planSlug(displayName: string) {
  return displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function validatePlanChanges(
  candidate: typeof plans.$inferSelect,
  replacingPlanId?: string
) {
  const [billingSetting, legacyPlusPlanSetting] = await Promise.all([
    db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "billing_enabled"))
      .limit(1),
    db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "paystack_plus_plan_code"))
      .limit(1),
  ]);
  if (billingSetting[0]?.value !== "true") return null;

  const currentPlans = await db.select().from(plans);
  const prospectivePlans = currentPlans
    .filter((plan) => plan.id !== replacingPlanId)
    .concat(candidate);
  const activePaidPlans = prospectivePlans.filter((plan) => plan.isActive && plan.price > 0);
  if (activePaidPlans.length === 0) {
    return "Billing is enabled, so at least one active paid plan must have an interval and Paystack plan code.";
  }
  const legacyPlusPlanCode = legacyPlusPlanSetting[0]?.value.trim();
  if (
    activePaidPlans.some((plan) => {
      const planCode =
        plan.paystackPlanCode?.trim() || (plan.name === "plus" ? legacyPlusPlanCode : undefined);
      return !plan.interval?.trim() || !planCode;
    })
  ) {
    return "Every active paid plan needs a billing interval and Paystack plan code while billing is enabled.";
  }
  return null;
}

async function syncLegacyPlusPlanCode(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  planName: string,
  code: string | null
) {
  if (planName !== "plus") return;
  await tx
    .insert(settings)
    .values({
      id: `setting_${crypto.randomUUID()}`,
      key: "paystack_plus_plan_code",
      value: code ?? "",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: code ?? "", updatedAt: new Date() },
    });
}

export async function GET() {
  const { authorized } = await verifyAdmin("API GET /api/admin/billing/plans");
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const [rows, legacyPlusPlanSetting] = await Promise.all([
      db.select().from(plans).orderBy(asc(plans.sortOrder), asc(plans.name)),
      db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, "paystack_plus_plan_code"))
        .limit(1),
    ]);
    const legacyPlusPlanCode = legacyPlusPlanSetting[0]?.value.trim() || null;
    const configuredPlans = rows.map((plan) => ({
      ...plan,
      paystackPlanCode:
        plan.paystackPlanCode?.trim() || (plan.name === "plus" ? legacyPlusPlanCode : null),
    }));
    return NextResponse.json({ plans: configuredPlans });
  } catch (error) {
    console.error("Error fetching billing plans:", error);
    return NextResponse.json({ error: "Unable to load billing plans." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { authorized } = await verifyAdmin("API POST /api/admin/billing/plans");
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
    const parsed = parsePlanInput(body);
    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }
    const name = planSlug(parsed.displayName);
    if (!name) {
      return NextResponse.json({ error: "Plan name must contain letters or numbers." }, { status: 400 });
    }
    const [existing] = await db.select({ id: plans.id }).from(plans).where(eq(plans.name, name)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "A plan with that name already exists." }, { status: 409 });
    }

    const id = `plan_${crypto.randomUUID()}`;
    const now = new Date();
    const candidate = {
      id,
      name,
      ...parsed,
      createdAt: now,
      updatedAt: now,
    };
    const readinessError = await validatePlanChanges(candidate);
    if (readinessError) {
      return NextResponse.json({ error: readinessError }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.insert(plans).values(candidate);
      await syncLegacyPlusPlanCode(tx, name, parsed.paystackPlanCode);
    });

    const [created] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return NextResponse.json({ plan: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating billing plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create billing plan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { authorized } = await verifyAdmin("API PATCH /api/admin/billing/plans");
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A plan id is required." }, { status: 400 });
    }
    const bodyRecord = body as Record<string, unknown>;
    if (typeof bodyRecord.id !== "string") {
      return NextResponse.json({ error: "A plan id is required." }, { status: 400 });
    }
    const planId = bodyRecord.id;
    const parsed = parsePlanInput(body, true);
    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }
    const [existing] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Billing plan not found." }, { status: 404 });
    }

    const candidate = { ...existing, ...parsed, updatedAt: new Date() };
    const readinessError = await validatePlanChanges(candidate, existing.id);
    if (readinessError) {
      return NextResponse.json({ error: readinessError }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(plans)
        .set({ ...parsed, updatedAt: new Date() })
        .where(eq(plans.id, existing.id));
      await syncLegacyPlusPlanCode(tx, existing.name, parsed.paystackPlanCode);
    });

    const [updated] = await db.select().from(plans).where(eq(plans.id, existing.id)).limit(1);
    return NextResponse.json({ plan: updated });
  } catch (error) {
    console.error("Error updating billing plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update billing plan." },
      { status: 500 }
    );
  }
}
