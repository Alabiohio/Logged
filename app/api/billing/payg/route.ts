import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserLimits } from "@/lib/billing/entitlements";
import { getPaygAccrual } from "@/lib/billing/usage";
import { getBillingConfig } from "@/lib/billing/config";
import { db } from "@/lib/db";
import { userBillingPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateWallet } from "@/lib/billing/wallet";
import { ensureUserBillingPreferences } from "@/lib/billing/preferences";
import { billingProfileUrl, getBillingProfile, isBillingProfileComplete } from "@/lib/billing/profile";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await ensureUserBillingPreferences(userId);

    const [limits, accrual, config, billingProfile] = await Promise.all([
      getUserLimits(userId),
      getPaygAccrual(userId),
      getBillingConfig(),
      getBillingProfile(userId),
    ]);

    return NextResponse.json({
      enabled: limits.paygEnabled,
      spendingLimit: limits.paygSpendingLimit,
      extraLogs: accrual.extraLogs,
      billableUnits: accrual.billableUnits,
      estimatedAmount: accrual.estimatedAmount,
      currency: accrual.currency,
      minimumDeposit: config.wallet.minimumDeposit,
      billingProfileComplete: isBillingProfileComplete(billingProfile),
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
    if (body.paygEnabled === true) {
      const billingProfile = await getBillingProfile(userId);
      if (!isBillingProfileComplete(billingProfile)) {
        return NextResponse.json(
          {
            error: "Complete your billing information before enabling PAYG.",
            billingDetailsUrl: billingProfileUrl("/dashboard/settings/billing?resume=payg"),
          },
          { status: 428 }
        );
      }
    }
    const preferences = await ensureUserBillingPreferences(userId);

    const updateData: Partial<typeof userBillingPreferences.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.paygEnabled === "boolean") {
      const limits = await getUserLimits(userId);
      if (body.paygEnabled && !limits.paygAvailable) {
        return NextResponse.json(
          { error: "PAYG is not available for your current plan." },
          { status: 403 }
        );
      }
      if (body.paygEnabled) {
        const wallet = await getOrCreateWallet(userId);
        const config = await getBillingConfig();
        if (wallet.status !== "active" || wallet.balance < config.wallet.minimumDeposit) {
          return NextResponse.json(
            {
              error: `Deposit at least ${config.wallet.currency} ${config.wallet.minimumDeposit.toLocaleString()} to enable PAYG.`,
            },
            { status: 403 }
          );
        }
      }
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

    await db
      .update(userBillingPreferences)
      .set(updateData)
      .where(eq(userBillingPreferences.userId, preferences.userId));

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
      minimumDeposit: config.wallet.minimumDeposit,
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
