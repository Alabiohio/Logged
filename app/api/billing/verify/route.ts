import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/transactions";
import { setSubscriptionPlan } from "@/lib/billing/subscription";
import { creditWalletDeposit } from "@/lib/billing/wallet";

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

      if (metadata.planId !== "plus") {
        return NextResponse.json({ error: "Transaction is not a Plus checkout" }, { status: 400 });
      }

      await setSubscriptionPlan(session.user.id, "plus", {
        customerCode: tx.customer?.customer_code,
        planCode: tx.plan_object?.plan_code,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return NextResponse.json({
        success: true,
        type: "plus_subscription",
        message: "Subscription upgraded successfully",
        plan: "plus",
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
