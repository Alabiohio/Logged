import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import { getOrCreateWallet } from "@/lib/billing/wallet";
import { billingProfileUrl, getBillingProfile, isBillingProfileComplete } from "@/lib/billing/profile";
import { getBillingConfig, toCurrencyMinorUnits } from "@/lib/billing/config";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [wallet, config] = await Promise.all([
      getOrCreateWallet(session.user.id),
      getBillingConfig(),
    ]);
    return NextResponse.json({
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      minimumDeposit: config.wallet.minimumDeposit,
    });
  } catch (error) {
    console.error("Error fetching billing wallet:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load billing wallet." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const amount = body.amount;
    const config = await getBillingConfig();
    if (!Number.isSafeInteger(amount) || amount < config.wallet.minimumDeposit) {
      return NextResponse.json(
        {
          error: `Deposit amount must be at least ${config.wallet.currency} ${config.wallet.minimumDeposit.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    const billingProfile = await getBillingProfile(session.user.id);
    if (!isBillingProfileComplete(billingProfile)) {
      return NextResponse.json(
        {
          error: "Complete your billing information before starting a deposit.",
          billingDetailsUrl: billingProfileUrl(
            `/dashboard/settings/billing?resume=deposit&amount=${amount}`
          ),
        },
        { status: 428 }
      );
    }

    const wallet = await getOrCreateWallet(session.user.id);
    const provider = await getPaymentProvider();
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const transaction = await provider.initializeCheckout({
      email: billingProfile.email!,
      amount: toCurrencyMinorUnits(amount, wallet.currency),
      currency: wallet.currency,
      callbackUrl: `${baseUrl}/dashboard/settings/billing?wallet=success`,
      metadata: {
        type: "wallet_deposit",
        userId: session.user.id,
        walletId: wallet.id,
        amount,
      },
    });

    return NextResponse.json({ authorizationUrl: transaction.authorizationUrl, reference: transaction.reference });
  } catch (error) {
    console.error("Error creating wallet deposit:", error);
    return NextResponse.json({ error: "Unable to start wallet deposit." }, { status: 500 });
  }
}