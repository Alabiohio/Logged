import { db } from "@/lib/db";
import { walletAccounts, walletTransactions } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const PAYG_UNIT_AMOUNT = 500;

export async function getOrCreateWallet(userId: string) {
  const existing = await db
    .select()
    .from(walletAccounts)
    .where(eq(walletAccounts.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const wallet = {
    id: uuidv4(),
    userId,
    balance: 0,
    currency: "NGN",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const inserted = await db.insert(walletAccounts).values(wallet).returning();
    return inserted[0] ?? wallet;
  } catch {
    const recheck = await db
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.userId, userId))
      .limit(1);
    if (recheck[0]) return recheck[0];
    throw new Error("Unable to create wallet");
  }
}

export async function creditWalletDeposit(params: {
  userId: string;
  amount: number;
  providerReference: string;
  idempotencyKey: string;
}) {
  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error("Deposit amount must be a positive integer");
  }

  const wallet = await getOrCreateWallet(params.userId);
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.idempotencyKey, params.idempotencyKey))
      .limit(1);
    if (existing[0]) return existing[0];

    const updated = await tx
      .update(walletAccounts)
      .set({ balance: sql`${walletAccounts.balance} + ${params.amount}`, updatedAt: new Date() })
      .where(eq(walletAccounts.id, wallet.id))
      .returning();
    if (!updated[0]) throw new Error("Unable to credit wallet");

    const transaction = {
      id: uuidv4(),
      walletId: wallet.id,
      userId: params.userId,
      type: "deposit",
      amount: params.amount,
      balanceBefore: updated[0].balance - params.amount,
      balanceAfter: updated[0].balance,
      currency: wallet.currency,
      status: "completed",
      provider: "paystack",
      providerReference: params.providerReference,
      idempotencyKey: params.idempotencyKey,
      metadata: null,
      createdAt: new Date(),
    };
    const inserted = await tx.insert(walletTransactions).values(transaction).returning();
    return inserted[0] ?? transaction;
  });
}

export async function debitWalletForPaygUnit(params: {
  userId: string;
  idempotencyKey: string;
  amount?: number;
}) {
  const amount = params.amount ?? PAYG_UNIT_AMOUNT;
  const wallet = await getOrCreateWallet(params.userId);
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.idempotencyKey, params.idempotencyKey))
      .limit(1);
    if (existing[0]) return existing[0];

    const updated = await tx
      .update(walletAccounts)
      .set({ balance: sql`${walletAccounts.balance} - ${amount}`, updatedAt: new Date() })
      .where(and(eq(walletAccounts.id, wallet.id), gte(walletAccounts.balance, amount)))
      .returning();
    if (!updated[0]) throw new Error("PAYG wallet balance is insufficient");

    const transaction = {
      id: uuidv4(),
      walletId: wallet.id,
      userId: params.userId,
      type: "payg_debit",
      amount: -amount,
      balanceBefore: updated[0].balance + amount,
      balanceAfter: updated[0].balance,
      currency: wallet.currency,
      status: "completed",
      provider: null,
      providerReference: null,
      idempotencyKey: params.idempotencyKey,
      metadata: null,
      createdAt: new Date(),
    };
    const inserted = await tx.insert(walletTransactions).values(transaction).returning();
    return inserted[0] ?? transaction;
  });
}