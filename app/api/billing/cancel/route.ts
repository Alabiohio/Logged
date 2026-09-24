import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSubscription, cancelSubscription as dbCancelSubscription } from "@/lib/billing/subscription";
import { getPaymentProvider } from "@/lib/billing/providers";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const subWithPlan = await getUserSubscription(userId);

    if (!subWithPlan || subWithPlan.plan.name !== "plus") {
      return NextResponse.json(
        { error: "No active Plus subscription to cancel" },
        { status: 400 }
      );
    }

    const provider = await getPaymentProvider();
    const paystackSubCode = subWithPlan.subscription.paystackSubscriptionCode;
    if (paystackSubCode) {
      try {
        await provider.cancelSubscription(paystackSubCode, "");
      } catch (err) {
        console.error(`Failed to cancel subscription on ${provider.name}:`, err);
      }
    }

    const updated = await dbCancelSubscription(userId);

    return NextResponse.json({
      success: true,
      message: "Subscription set to cancel at end of current billing period.",
      cancelAtPeriodEnd: updated?.cancelAtPeriodEnd ?? true,
      currentPeriodEnd: updated?.currentPeriodEnd ?? null,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

