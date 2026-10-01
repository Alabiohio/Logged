import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import { getOrCreateWallet } from "@/lib/billing/wallet";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await getOrCreateWallet(session.user.id);
  return NextResponse.json({
    id: wallet.id,
    balance: wallet.balance,
    currency: wallet.currency,
    status: wallet.status,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const amount = body.amount;
    if (!Number.isInteger(amount) || amount < 500) {
      return NextResponse.json({ error: "Deposit amount must be at least NGN 500." }, { status: 400 });
    }

    const wallet = await getOrCreateWallet(session.user.id);
    const provider = await getPaymentProvider();
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const transaction = await provider.initializeCheckout({
      email: session.user.email,
      amount: amount * 100,
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