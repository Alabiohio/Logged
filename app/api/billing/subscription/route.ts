import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSubscription, ensureFreeSub } from "@/lib/billing/subscription";
import { getUserPlan } from "@/lib/billing/entitlements";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    let subWithPlan = await getUserSubscription(userId);
    if (!subWithPlan) {
      await ensureFreeSub(userId);
      subWithPlan = await getUserSubscription(userId);
    }

    const plan = await getUserPlan(userId);

    return NextResponse.json({
      plan,
      status: subWithPlan?.subscription.status ?? "active",
      currentPeriodStart: subWithPlan?.subscription.currentPeriodStart ?? null,
      currentPeriodEnd: subWithPlan?.subscription.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subWithPlan?.subscription.cancelAtPeriodEnd ?? false,
      paygEnabled: subWithPlan?.subscription.paygEnabled ?? true,
      paygSpendingLimit: subWithPlan?.subscription.paygSpendingLimit ?? null,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
