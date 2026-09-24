import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserLimits } from "@/lib/billing/entitlements";
import { getPaygAccrual } from "@/lib/billing/usage";
import { getBillingConfig } from "@/lib/billing/config";
import { ensureFreeSub } from "@/lib/billing/subscription";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await ensureFreeSub(userId);

    const [limits, accrual, config] = await Promise.all([
      getUserLimits(userId),
      getPaygAccrual(userId),
      getBillingConfig(),
    ]);

    return NextResponse.json({
      enabled: limits.paygEnabled,
      spendingLimit: limits.paygSpendingLimit,
      extraLogs: accrual.extraLogs,
      billableUnits: accrual.billableUnits,
      estimatedAmount: accrual.estimatedAmount,
      currency: accrual.currency,
      rate: {
        logsPerUnit: config.payg.logsPerUnit,
        pricePerUnit: config.payg.pricePerUnit,
      },
    });
  } catch (error) {
    console.error("Error fetching PAYG billing info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const body = await request.json();
    const sub = await ensureFreeSub(userId);

    const updateData: Partial<typeof subscriptions.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.paygEnabled === "boolean") {
      updateData.paygEnabled = body.paygEnabled;
    }

    if ("paygSpendingLimit" in body) {
      const limit = body.paygSpendingLimit;
      if (limit === null) {
        updateData.paygSpendingLimit = null;
      } else if (typeof limit === "number" && Number.isInteger(limit) && limit >= 0) {
        updateData.paygSpendingLimit = limit;
      } else {
        return NextResponse.json(
          { error: "Spending limit must be a non-negative integer or null" },
          { status: 400 }
        );
      }
    }

    const updated = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, sub.id))
      .returning();

    const [limits, accrual, config] = await Promise.all([
      getUserLimits(userId),
      getPaygAccrual(userId),
      getBillingConfig(),
    ]);

    return NextResponse.json({
      success: true,
      enabled: limits.paygEnabled,
      spendingLimit: limits.paygSpendingLimit,
      extraLogs: accrual.extraLogs,
      billableUnits: accrual.billableUnits,
      estimatedAmount: accrual.estimatedAmount,
      currency: accrual.currency,
      rate: {
        logsPerUnit: config.payg.logsPerUnit,
        pricePerUnit: config.payg.pricePerUnit,
      },
    });
  } catch (error) {
    console.error("Error updating PAYG settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
