"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CreditCard, WalletCards } from "lucide-react";

interface BillingHistoryTransaction {
  id: string;
  kind: "wallet" | "subscription";
  type: string;
  amount: number;
  currency: string;
  status: string;
  providerReference: string | null;
  createdAt: string;
}

function getTransactionLabel(transaction: BillingHistoryTransaction) {
  if (transaction.kind === "subscription") return "Plus subscription";
  if (transaction.type === "deposit") return "Wallet deposit";
  if (transaction.type === "payg_debit") return "PAYG usage";
  return transaction.type.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function BillingHistoryPage() {
  const [transactions, setTransactions] = useState<BillingHistoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/billing/history");
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Failed to load billing history.");
          return;
        }
        setTransactions(result.transactions ?? []);
        setNextOffset(result.nextOffset ?? null);
      } catch {
        setError("Network error loading billing history.");
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, []);

  const loadMore = async () => {
    if (nextOffset === null || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      const response = await fetch(`/api/billing/history?offset=${nextOffset}`);
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to load more billing history.");
        return;
      }
      setTransactions((current) => [...current, ...(result.transactions ?? [])]);
      setNextOffset(result.nextOffset ?? null);
    } catch {
      setError("Network error loading more billing history.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8 px-0.5 py-6 sm:px-0.5 lg:px-8">
      <section className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl">Billing history</h1>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              Wallet activity and Plus subscription payments.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/settings/billing"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text-secondary transition hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to billing
        </Link>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="glass overflow-hidden rounded-[var(--radius-lg)] shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading billing history">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-border/40" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-border/50">
            {transactions.map((transaction) => (
              <div key={`${transaction.kind}-${transaction.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {transaction.kind === "subscription"
                      ? <CreditCard className="h-4 w-4" />
                      : <WalletCards className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold capitalize text-text">{getTransactionLabel(transaction)}</p>
                    <p className="text-xs text-text-secondary">{formatDate(transaction.createdAt)}</p>
                    {transaction.providerReference && (
                      <p className="mt-1 truncate font-mono text-[10px] text-text-muted">
                        Ref: {transaction.providerReference}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                  <p className={`font-mono text-sm font-bold ${transaction.amount >= 0 ? "text-success" : "text-text"}`}>
                    {transaction.amount >= 0 ? "+" : ""}
                    {transaction.currency} {Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold capitalize text-text-secondary">
                    {transaction.status.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : error ? null : (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-text-muted" />
            <h2 className="mt-3 text-sm font-bold text-text">No billing transactions yet</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Wallet deposits, PAYG usage, and subscription charges will appear here.
            </p>
          </div>
        )}
      </section>
      {!loading && nextOffset !== null && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-bold text-text-secondary transition hover:text-text disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load older transactions"}
          </button>
        </div>
      )}
    </div>
  );
}
