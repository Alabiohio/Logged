import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { billingEvents, subscriptions, walletTransactions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

const HISTORY_PAGE_SIZE = 50;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSubscriptionPayment(
  event: typeof billingEvents.$inferSelect,
  subscriptionCustomerCode: string | null,
) {
  if (!event.payload) return null;

  try {
    const payload: unknown = JSON.parse(event.payload);
    if (!isRecord(payload) || !isRecord(payload.data)) return null;

    const transaction = payload.data;
    const metadata = isRecord(transaction.metadata) ? transaction.metadata : null;
    const customer = isRecord(transaction.customer) ? transaction.customer : null;
    const isCurrentSubscriptionCustomer = Boolean(
      subscriptionCustomerCode
      && customer?.customer_code === subscriptionCustomerCode,
    );
    if (
      (metadata?.planId !== "plus" && !isCurrentSubscriptionCustomer)
      || metadata?.type === "wallet_deposit"
    ) return null;
    if (transaction.status !== undefined && transaction.status !== "success") return null;
    if (typeof transaction.amount !== "number" || !Number.isFinite(transaction.amount)) return null;

    const paidAt = typeof transaction.paid_at === "string" ? transaction.paid_at : null;
    const providerCreatedAt = typeof transaction.createdAt === "string" ? transaction.createdAt : null;
    const date = paidAt ?? providerCreatedAt ?? event.createdAt.toISOString();

    return {
      id: event.id,
      kind: "subscription" as const,
      type: "subscription",
      amount: Math.floor(transaction.amount / 100),
      currency: typeof transaction.currency === "string" ? transaction.currency : "NGN",
      status: "success",
      providerReference: typeof transaction.reference === "string" ? transaction.reference : null,
      createdAt: date,
    };
  } catch (error) {
    console.error(`Unable to parse billing event ${event.id}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedOffset = Number(new URL(request.url).searchParams.get("offset") ?? "0");
  if (!Number.isSafeInteger(requestedOffset) || requestedOffset < 0 || requestedOffset > 100_000) {
    return NextResponse.json({ error: "Invalid billing history offset" }, { status: 400 });
  }

  try {
    const queryLimit = requestedOffset + HISTORY_PAGE_SIZE + 1;
    const [walletRows, billingRows, subscriptionRows] = await Promise.all([
      db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, session.user.id))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(queryLimit),
      db
        .select()
        .from(billingEvents)
        .where(and(
          eq(billingEvents.userId, session.user.id),
          eq(billingEvents.provider, "paystack"),
          eq(billingEvents.eventType, "charge.success"),
        ))
        .orderBy(desc(billingEvents.createdAt))
        .limit(queryLimit),
      db
        .select({ paystackCustomerCode: subscriptions.paystackCustomerCode })
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.user.id))
        .limit(1),
    ]);
    const subscriptionCustomerCode = subscriptionRows[0]?.paystackCustomerCode ?? null;

    const allTransactions = [
      ...walletRows.map((transaction) => ({
        id: transaction.id,
        kind: "wallet" as const,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        providerReference: transaction.providerReference,
        createdAt: transaction.createdAt.toISOString(),
      })),
      ...billingRows
        .map((event) => getSubscriptionPayment(event, subscriptionCustomerCode))
        .filter((transaction) => transaction !== null),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const transactions = allTransactions
      .slice(requestedOffset, requestedOffset + HISTORY_PAGE_SIZE);
    const hasMore = allTransactions.length > requestedOffset + HISTORY_PAGE_SIZE;

    return NextResponse.json({
      transactions,
      nextOffset: hasMore ? requestedOffset + HISTORY_PAGE_SIZE : null,
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return NextResponse.json({ error: "Failed to load billing history" }, { status: 500 });
  }
}
