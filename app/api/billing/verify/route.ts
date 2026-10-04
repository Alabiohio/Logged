import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/transactions";
import { setSubscriptionPlan } from "@/lib/billing/subscription";
import { creditWalletDeposit } from "@/lib/billing/wallet";
import { getBillingPeriodEnd } from "@/lib/billing/config";
import { syncUserProjectLimits } from "@/lib/billing/entitlements";
import { db } from "@/lib/db";
import { plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return NextResponse.json({ error: "Reference parameter is required" }, { status: 400 });
  }

  try {
    const tx = await verifyTransaction(reference);

    if (tx.status === "success") {
      const metadata = tx.metadata;
      if (metadata?.userId !== session.user.id) {
        return NextResponse.json({ error: "Transaction does not belong to this account" }, { status: 403 });
      }

      if (metadata.type === "wallet_deposit") {
        const metadataAmount = Number(metadata.amount);
        const amount = Number.isInteger(metadataAmount) && metadataAmount > 0
          ? metadataAmount
          : Math.floor(tx.amount / 100);
        if (amount <= 0) {
          return NextResponse.json({ error: "Invalid wallet deposit amount" }, { status: 400 });
        }

        await creditWalletDeposit({
          userId: session.user.id,
          amount,
          providerReference: tx.reference,
          idempotencyKey: `deposit:paystack:${tx.reference}`,
        });

        return NextResponse.json({
          success: true,
          type: "wallet_deposit",
          message: "Wallet deposit received successfully",
        });
      }

      if (typeof metadata.planId !== "string") {
        return NextResponse.json({ error: "Transaction does not contain a configured plan." }, { status: 400 });
      }

      const [selectedPlan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, metadata.planId))
        .limit(1);
      if (!selectedPlan || selectedPlan.price <= 0) {
        return NextResponse.json({ error: "The purchased plan is no longer available." }, { status: 409 });
      }

      const expectedPrice = typeof metadata.planPrice === "number"
        ? metadata.planPrice
        : selectedPlan.price;
      const expectedCurrency = typeof metadata.currency === "string"
        ? metadata.currency.toUpperCase()
        : selectedPlan.currency.toUpperCase();
      if (tx.amount !== expectedPrice || tx.currency.toUpperCase() !== expectedCurrency) {
        return NextResponse.json({ error: "The verified payment does not match the selected plan." }, { status: 400 });
      }

      const interval = typeof metadata.interval === "string"
        ? metadata.interval
        : selectedPlan.interval;
      if (!interval) {
        return NextResponse.json({ error: "The purchased plan has no billing interval configured." }, { status: 409 });
      }
      const periodStart = new Date();
      await setSubscriptionPlan(session.user.id, selectedPlan.id, {
        customerCode: tx.customer?.customer_code,
        planCode: tx.plan_object?.plan_code,
        periodStart,
        periodEnd: getBillingPeriodEnd(periodStart, interval),
      });
      await syncUserProjectLimits(session.user.id, { restoreWithinPlanLimit: true });

      return NextResponse.json({
        success: true,
        type: "subscription",
        message: "Subscription upgraded successfully",
        plan: selectedPlan.displayName,
      });
    }

    return NextResponse.json({
      success: false,
      message: `Transaction status: ${tx.status}`,
    }, { status: 400 });
  } catch (error) {
    console.error("Error verifying payment transaction:", error);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
