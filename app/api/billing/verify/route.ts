import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/transactions";
import { setSubscriptionPlan } from "@/lib/billing/subscription";

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
      await setSubscriptionPlan(session.user.id, "plus", {
        customerCode: tx.customer?.customer_code,
        planCode: tx.plan_object?.plan_code,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return NextResponse.json({
        success: true,
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
