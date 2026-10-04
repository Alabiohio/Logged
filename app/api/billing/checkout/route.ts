import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getBillingEnabled } from "@/lib/billing/config";
import { getUserSubscription, ensureFreeSub } from "@/lib/billing/subscription";
import { getPaymentProvider } from "@/lib/billing/providers";
import { db } from "@/lib/db";
import { subscriptions, plans, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { billingProfileUrl, getBillingProfile, isBillingProfileComplete } from "@/lib/billing/profile";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const planId = (body as Record<string, unknown>).planId;
    if (typeof planId !== "string" || !planId.trim()) {
      return NextResponse.json({ error: "A plan id is required." }, { status: 400 });
    }

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
    if (!subWithPlan) {
      throw new Error(`No subscription record is available for user ${userId}.`);
    }

    if (
      subWithPlan?.plan.id === planId &&
      subWithPlan.subscription.status === "active"
    ) {
      return NextResponse.json({
        available: true,
        message: `Already on the ${subWithPlan.plan.displayName} plan.`,
      });
    }
    if (
      subWithPlan.subscription.status !== "expired" &&
      subWithPlan.plan.price > 0
    ) {
      return NextResponse.json(
        { error: "Cancel your current subscription before changing plans." },
        { status: 409 }
      );
    }

    const [selectedPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    if (!selectedPlan || !selectedPlan.isActive || selectedPlan.price <= 0) {
      return NextResponse.json({ error: "The selected paid plan is unavailable." }, { status: 400 });
    }
    if (!selectedPlan.interval?.trim()) {
      return NextResponse.json({ error: "The selected plan has no billing interval configured." }, { status: 409 });
    }
    const [legacyPlanCodeSetting] = selectedPlan.name === "plus"
      ? await db.select({ value: settings.value }).from(settings)
          .where(eq(settings.key, "paystack_plus_plan_code")).limit(1)
      : [];
    const resolvedPlanCode =
      selectedPlan.paystackPlanCode?.trim() || legacyPlanCodeSetting?.value.trim();
    if (!resolvedPlanCode) {
      return NextResponse.json(
        { error: "The selected plan is missing its Paystack plan code." },
        { status: 409 }
      );
    }

    const billingProfile = await getBillingProfile(userId);
    if (!isBillingProfileComplete(billingProfile)) {
      return NextResponse.json(
        {
          error: "Complete your billing information before starting checkout.",
          billingDetailsUrl: billingProfileUrl("/dashboard/settings/billing?resume=checkout"),
        },
        { status: 428 }
      );
    }

    const provider = await getPaymentProvider();

    // Ensure customer code exists
    let customerCode = subWithPlan.subscription.paystackCustomerCode;
    if (!customerCode) {
      const custRes = await provider.createCustomer({
        email: billingProfile.email!,
        name: billingProfile.fullName!,
        phone: billingProfile.phone ?? undefined,
      });
      customerCode = custRes.customerCode;

      await db
        .update(subscriptions)
        .set({ paystackCustomerCode: customerCode, updatedAt: new Date() })
        .where(eq(subscriptions.id, subWithPlan.subscription.id));
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const transaction = await provider.initializeCheckout({
      email: billingProfile.email!,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      planCode: resolvedPlanCode,
      callbackUrl: `${baseUrl}/dashboard/settings/billing?checkout=success`,
      metadata: {
        userId,
        planId: selectedPlan.id,
        planPrice: selectedPlan.price,
        currency: selectedPlan.currency,
        interval: selectedPlan.interval,
        subscriptionId: subWithPlan?.subscription.id,
      },
    });

    return NextResponse.json({
      available: true,
      authorizationUrl: transaction.authorizationUrl,
      checkoutUrl: transaction.authorizationUrl,
      reference: transaction.reference,
    });
  } catch (error) {
    console.error("Error creating checkout transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
