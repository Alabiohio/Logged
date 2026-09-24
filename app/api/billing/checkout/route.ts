import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getBillingEnabled } from "@/lib/billing/config";
import { getUserSubscription, ensureFreeSub } from "@/lib/billing/subscription";
import { getPaymentProvider } from "@/lib/billing/providers";
import { db } from "@/lib/db";
import { subscriptions, plans, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const billingEnabled = await getBillingEnabled();
    if (!billingEnabled) {
      return NextResponse.json({
        available: false,
        message: "Billing is not currently available.",
      });
    }

    const userId = session.user.id;
    let subWithPlan = await getUserSubscription(userId);
    if (!subWithPlan) {
      await ensureFreeSub(userId);
      subWithPlan = await getUserSubscription(userId);
    }

    if (subWithPlan?.plan.name === "plus" && subWithPlan.subscription.status === "active") {
      return NextResponse.json({
        available: true,
        message: "Already on Plus plan.",
      });
    }

    const provider = await getPaymentProvider();

    // Get Plus plan details
    const plusPlanRows = await db.select().from(plans).where(eq(plans.id, "plus")).limit(1);
    if (plusPlanRows.length === 0) {
      return NextResponse.json({ error: "Plus plan configuration not found" }, { status: 500 });
    }
    const plusPlan = plusPlanRows[0];

    // Ensure customer code exists
    let customerCode = subWithPlan?.subscription.paystackCustomerCode;
    if (!customerCode) {
      try {
        const custRes = await provider.createCustomer({
          email: session.user.email,
          name: session.user.name,
        });
        customerCode = custRes.customerCode;

        await db
          .update(subscriptions)
          .set({ paystackCustomerCode: customerCode, updatedAt: new Date() })
          .where(eq(subscriptions.id, subWithPlan!.subscription.id));
      } catch (err) {
        console.error("Failed to create customer on payment provider:", err);
      }
    }

    // Read plan code from admin-configured DB setting first, fall back to plans table row.
    // Only pass it if it's a real non-empty value — sending an invalid code causes a Paystack 404.
    const planCodeSettingRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "paystack_plus_plan_code"))
      .limit(1);

    const dbSettingCode = planCodeSettingRow[0]?.value?.trim() ?? "";
    const planTableCode = (plusPlan.paystackPlanCode ?? "").trim();
    const resolvedPlanCode = (dbSettingCode || planTableCode) || undefined;

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const transaction = await provider.initializeCheckout({
      email: session.user.email,
      amount: plusPlan.price,
      planCode: resolvedPlanCode,        // undefined = one-time charge, fine — webhook upgrades the account
      callbackUrl: `${baseUrl}/dashboard/settings/billing?checkout=success`,
      metadata: {
        userId,
        planId: "plus",
        subscriptionId: subWithPlan?.subscription.id,
      },
    });

    return NextResponse.json({
      available: true,
      authorizationUrl: transaction.authorizationUrl,
      checkoutUrl: transaction.authorizationUrl,
      reference: transaction.reference,
      planCodeUsed: resolvedPlanCode ?? null,   // helpful for debugging
    });
  } catch (error) {
    console.error("Error creating checkout transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

