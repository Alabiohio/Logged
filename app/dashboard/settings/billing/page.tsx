"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ShieldAlert,
  Info,
  Sparkles,
  RefreshCw,
  Sliders,
  XCircle,
  ArrowRight,
  Database,
  FolderKanban,
  Clock,
  Check,
  WalletCards
} from "lucide-react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import Link from "next/link";

interface PlanInfo {
  id: string;
  name: string;
  code: string;
  priceMonthly: number;
  currency: string;
  maxLogsPerMonth: number;
  maxProjects: number;
  retentionDays: number;
  billingEnabled: boolean;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paystackCustomerCode: string | null;
}

interface UsageInfo {
  logsCount: number;
  maxLogs: number;
  periodStart: string;
  periodEnd: string;
}

interface LimitsInfo {
  maxProjects: number;
  projectCount: number;
  retentionDays: number;
  paygAvailable: boolean;
}

interface PaygAccrual {
  extraLogs: number;
  billableUnits: number;
  estimatedAmount: number;
  currency: string;
}

interface PaygInfo {
  enabled: boolean;
  billingProfileComplete?: boolean;
  spendingLimit: number | null;
  accrual: PaygAccrual;
  extraLogs?: number;
  billableUnits?: number;
  estimatedAmount?: number;
  currency?: string;
  rate?: {
    logsPerUnit: number;
    pricePerUnit: number;
  };
}

interface BillingData {
  plan: PlanInfo;
  subscription: SubscriptionInfo | null;
  usage: UsageInfo;
  limits: LimitsInfo;
  payg: PaygInfo;
}

interface WalletInfo {
  balance: number;
  currency: string;
  status: string;
}

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

interface BillingProfileInfo {
  billingType: "individual" | "business";
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

type BillingAction = "checkout" | "deposit" | "payg";

export default function BillingPage() {
  const router = useRouter();
  const [data, setData] = useState<BillingData | null>(null);
  const [paygDetails, setPaygDetails] = useState<PaygInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paygUpdating, setPaygUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [depositAmount, setDepositAmount] = useState("500");
  const [depositLoading, setDepositLoading] = useState(false);
  const [billingTransactions, setBillingTransactions] = useState<BillingHistoryTransaction[]>([]);
  const [billingHistoryError, setBillingHistoryError] = useState<string | null>(null);
  const [billingProfile, setBillingProfile] = useState<BillingProfileInfo | null>(null);
  const [pendingBillingAction, setPendingBillingAction] = useState<BillingAction | null>(null);
  const [pendingDepositAmount, setPendingDepositAmount] = useState<number | null>(null);

  // PAYG limit edit state
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState<string>("");

  // Cancel sub modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaygPlanModal, setShowPaygPlanModal] = useState(false);

  const fetchBilling = useCallback(async () => {
    try {
      setError(null);
      const [resBilling, resPayg, resProfile] = await Promise.all([
        fetch("/api/billing"),
        fetch("/api/billing/payg"),
        fetch("/api/billing/profile"),
      ]);

      if (resBilling.ok) {
        const billingJson = await resBilling.json();
        setData(billingJson);
      } else {
        const errJson = await resBilling.json().catch(() => ({}));
        setError(errJson.error || "Failed to load billing information");
      }

      if (resPayg.ok) {
        const paygJson = await resPayg.json();
        setPaygDetails(paygJson);
        setLimitInput(paygJson.spendingLimit !== null ? String(paygJson.spendingLimit) : "");
      }

      if (resProfile.ok) {
        const profileJson = await resProfile.json();
        setBillingProfile(profileJson.profile);
      } else {
        const profileError = await resProfile.json().catch(() => ({}));
        setError(profileError.error || "Failed to load saved billing details.");
      }

      const resWallet = await fetch("/api/billing/wallet");
      if (resWallet.ok) {
        setWallet(await resWallet.json());
      }
      const resBillingHistory = await fetch("/api/billing/history");
      if (resBillingHistory.ok) {
        const historyData = await resBillingHistory.json();
        setBillingTransactions(historyData.transactions ?? []);
        setBillingHistoryError(null);
      } else {
        const historyError = await resBillingHistory.json().catch(() => ({}));
        const message = historyError.error || "Failed to load billing activity.";
        setBillingHistoryError(message);
        setError(message);
      }
    } catch {
      setBillingHistoryError("Network error loading billing activity.");
      setError("Network error loading billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToBillingDetails = (url: string, resume: string) => {
    window.sessionStorage.setItem("billing-resume", resume);
    router.push(url);
  };

  const queueBillingAction = (action: BillingAction, amount?: number) => {
    if (!paygDetails?.billingProfileComplete || !billingProfile) {
      const returnTo = `/dashboard/settings/billing?resume=${action}${
        action === "deposit" && amount !== undefined ? `&amount=${amount}` : ""
      }`;
      const detailsUrl = `/dashboard/settings/billing/details?returnTo=${encodeURIComponent(returnTo)}`;
      redirectToBillingDetails(detailsUrl, action);
      return;
    }

    if (action === "deposit") {
      setPendingDepositAmount(amount ?? Number(depositAmount));
    }
    setPendingBillingAction(action);
  };

  const handleDeposit = async (amountOverride?: number, confirmed = false) => {
    const amount = amountOverride ?? Number(depositAmount);
    if (!confirmed) {
      queueBillingAction("deposit", amount);
      return;
    }
    if (!Number.isInteger(amount) || amount < 500) {
      setError("Deposit amount must be at least NGN 500.");
      return;
    }

    setDepositLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (res.status === 428 && json.billingDetailsUrl) {
        redirectToBillingDetails(json.billingDetailsUrl, "deposit");
        return;
      }
      if (json.authorizationUrl) {
        window.location.assign(json.authorizationUrl);
      } else {
        setError(json.error || "Unable to start wallet deposit.");
      }
    } catch {
      setError("Unable to start wallet deposit.");
    } finally {
      setDepositLoading(false);
    }
  };

  useEffect(() => {
    void fetchBilling();
  }, [fetchBilling]);

  // Auto-verify payment when Paystack redirects back with ?reference= or ?trxref=
  const searchParams = useSearchParams();
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const checkout = searchParams.get("checkout");
    const walletDeposit = searchParams.get("wallet") === "success";
    if (!reference && checkout !== "success" && !walletDeposit) return;

    const verifyPayment = async () => {
      if (reference) {
        try {
          const res = await fetch(`/api/billing/verify?reference=${reference}`);
          const json = await res.json();
          if (res.ok && json.success) {
            setSuccess(json.type === "wallet_deposit"
              ? "Wallet deposit received successfully. Your balance is ready for PAYG."
              : "Payment successful! Your account has been upgraded to Plus.");
          } else {
            // Webhook may have already handled it — just refresh silently
          }
        } catch {
          // Best-effort: webhook handles the actual upgrade
        }
      } else {
        setSuccess(walletDeposit
          ? "Payment received! Your wallet balance will update shortly."
          : "Payment received! Your plan will be updated shortly.");
      }
      // Always refresh billing data after returning from checkout
      await fetchBilling();
    };

    void verifyPayment();
    // Remove query params from URL without triggering a reload
    const url = new URL(window.location.href);
    url.searchParams.delete("reference");
    url.searchParams.delete("trxref");
    url.searchParams.delete("checkout");
    url.searchParams.delete("wallet");
    window.history.replaceState({}, "", url.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async (confirmed = false) => {
    if (!confirmed) {
      queueBillingAction("checkout");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "plus" }),
      });
      const json = await res.json();
      if (res.status === 428 && json.billingDetailsUrl) {
        redirectToBillingDetails(json.billingDetailsUrl, "checkout");
        return;
      }
      if (!res.ok || json.error) {
        setError(json.error || "Checkout initiation failed");
        setActionLoading(false);
        return;
      }
      const checkoutUrl = json.checkoutUrl || json.authorizationUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError(json.message || "Checkout URL not returned by payment provider");
        setActionLoading(false);
      }
    } catch {
      setError("Failed to initiate checkout");
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    setError(null);
    setShowCancelModal(false);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Failed to cancel subscription");
      } else {
        setSuccess("Your subscription will remain active until the end of the current billing cycle.");
        await fetchBilling();
      }
    } catch {
      setError("Error cancelling subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePayg = async (enabled: boolean, confirmed = false) => {
    if (enabled && !confirmed) {
      queueBillingAction("payg");
      return;
    }
    setPaygUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/payg", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paygEnabled: enabled }),
      });
      const json = await res.json();
      if (res.status === 428 && json.billingDetailsUrl) {
        redirectToBillingDetails(json.billingDetailsUrl, "payg");
        return;
      }
      if (!res.ok || json.error || typeof json.enabled !== "boolean") {
        setError(json.error || "Failed to update PAYG settings");
      } else {
        setPaygDetails((prev) => (prev ? { ...prev, enabled: json.enabled } : prev));
        setData((prev) => (
          prev ? { ...prev, payg: { ...prev.payg, enabled: json.enabled } } : prev
        ));
        setSuccess(`PAYG ${json.enabled ? "enabled" : "disabled"} successfully.`);
      }
    } catch {
      setError("Failed to update PAYG settings");
    } finally {
      setPaygUpdating(false);
    }
  };

  const handleSavePaygLimit = async () => {
    setPaygUpdating(true);
    setError(null);
    try {
      const parsed = limitInput.trim() === "" ? null : parseInt(limitInput.trim(), 10);
      if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
        setError("Spending limit must be a positive number or empty for no limit");
        setPaygUpdating(false);
        return;
      }

      const res = await fetch("/api/billing/payg", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paygSpendingLimit: parsed }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Failed to update PAYG spending limit");
      } else {
        setPaygDetails((prev) => (prev ? { ...prev, spendingLimit: json.spendingLimit } : prev));
        setEditingLimit(false);
        setSuccess("Spending limit updated.");
      }
    } catch {
      setError("Failed to update spending limit");
    } finally {
      setPaygUpdating(false);
    }
  };

  const continueBillingAction = () => {
    const action = pendingBillingAction;
    setPendingBillingAction(null);
    if (action === "checkout") void handleCheckout(true);
    else if (action === "deposit") void handleDeposit(pendingDepositAmount ?? undefined, true);
    else if (action === "payg") void handleTogglePayg(true, true);
  };

  const getPendingBillingEditUrl = () => {
    const action = pendingBillingAction;
    if (!action) return "/dashboard/settings/billing/details";

    const returnTo = `/dashboard/settings/billing?resume=${action}${
      action === "deposit" && pendingDepositAmount !== null
        ? `&amount=${pendingDepositAmount}`
        : ""
    }`;
    return `/dashboard/settings/billing/details?returnTo=${encodeURIComponent(returnTo)}`;
  };

  useEffect(() => {
    const resume = searchParams.get("resume");
    if (!resume || !["checkout", "deposit", "payg"].includes(resume)) return;
    if (window.sessionStorage.getItem("billing-resume") !== resume) return;

    const amount = Number(searchParams.get("amount"));
    const timeout = window.setTimeout(() => {
      if (window.sessionStorage.getItem("billing-resume") !== resume) return;
      if (loading) return;

      if (!paygDetails?.billingProfileComplete || !billingProfile) {
        const returnTo = `/dashboard/settings/billing?resume=${resume}${
          resume === "deposit" && Number.isInteger(amount) ? `&amount=${amount}` : ""
        }`;
        const detailsUrl = `/dashboard/settings/billing/details?returnTo=${encodeURIComponent(returnTo)}`;
        router.push(detailsUrl);
        return;
      }

      window.sessionStorage.removeItem("billing-resume");
      const url = new URL(window.location.href);
      url.searchParams.delete("resume");
      url.searchParams.delete("amount");
      window.history.replaceState({}, "", url.toString());

      if (resume === "deposit") setPendingDepositAmount(amount);
      setPendingBillingAction(resume as BillingAction);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [billingProfile, loading, paygDetails?.billingProfileComplete, router, searchParams]);

  if (loading) {
    return (
      <div className="space-y-8 px-0.5 py-6 sm:px-0.5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-xl bg-border animate-pulse" />
            <div className="h-4 w-72 rounded-xl bg-border animate-pulse" />
          </div>
        </div>

        <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm space-y-6">
          <div className="h-24 w-full rounded-2xl bg-border/50 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 rounded-2xl bg-border/40 animate-pulse" />
            <div className="h-64 rounded-2xl bg-border/40 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const plan = data?.plan;
  const isBillingEnabled = plan?.billingEnabled ?? false;
  const isPlus = plan?.code === "plus";
  const sub = data?.subscription;
  const usage = data?.usage;
  const limits = data?.limits;
  const payg = paygDetails || data?.payg;

  // Usage percentages
  const logsCount = usage?.logsCount ?? 0;
  const maxLogs = usage?.maxLogs ?? 10000;
  const logsPercentage = maxLogs > 0
    ? Math.min(Math.round((logsCount / maxLogs) * 100), 100)
    : 0;
  const isLogsWarning = logsPercentage >= 80 && logsPercentage < 100;
  const isLogsMaxed = logsCount >= maxLogs;

  const maxProjects = limits?.maxProjects ?? 2;
  const projectCount = limits?.projectCount ?? 0;
  const projectsPercentage = maxProjects > 0
    ? Math.min(Math.round((projectCount / maxProjects) * 100), 100)
    : 0;
  const retentionDays = limits?.retentionDays ?? 7;
  const maxRetentionDays = 30;
  const retentionPercentage = Math.min(Math.round((retentionDays / maxRetentionDays) * 100), 100);
  const walletBalance = wallet?.balance ?? 0;
  const canFundPayg = walletBalance >= 500;

  // PAYG Accruals
  const extraLogs = payg?.extraLogs ?? payg?.accrual?.extraLogs ?? 0;
  const billableUnits = payg?.billableUnits ?? payg?.accrual?.billableUnits ?? 0;
  const estimatedAmount = payg?.estimatedAmount ?? payg?.accrual?.estimatedAmount ?? 0;
  const spendingLimit = payg?.spendingLimit ?? null;
  const currency = payg?.currency ?? "NGN";

  const isLimitReached = spendingLimit !== null && estimatedAmount >= spendingLimit;
  const isLimitWarning = spendingLimit !== null && estimatedAmount >= spendingLimit * 0.8 && !isLimitReached;

  return (
    <div className="space-y-8 px-0.5 py-6 sm:px-0.5 lg:px-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
                Billing & Subscription
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Manage your plan, log quotas, pay-as-you-go controls, and invoices.
              </p>
            </div>
          </div>
        </div>
        <div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text transition"
          >
            ← Back to Settings
          </Link>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <section className="glass rounded-[var(--radius-lg)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">PAYG Wallet</h2>
              <p className="text-xs text-text-secondary">Deposit funds before enabling prepaid PAYG.</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-text-muted">Available balance</p>
            <p className="text-xl font-black text-text">NGN {(wallet?.balance ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="number"
            min="500"
            step="500"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono text-text outline-none focus:border-primary sm:w-40"
            aria-label="Deposit amount in NGN"
          />
          <button
            type="button"
            onClick={() => void handleDeposit()}
            disabled={depositLoading || wallet?.status !== "active"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {depositLoading ? "Opening checkout..." : "Deposit funds"}
          </button>
        </div>
        <div className="mt-5 border-t border-border/50 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent billing activity</p>
            <Link
              href="/dashboard/settings/billing/history"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
            >
              View history
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {billingTransactions.length > 0 ? (
            <div className="space-y-2">
              {billingTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">
                    {transaction.kind === "subscription"
                      ? "Plus subscription"
                      : transaction.type === "deposit"
                        ? "Wallet deposit"
                        : "PAYG usage"}
                  </span>
                  <span className={transaction.amount >= 0 ? "font-mono font-bold text-success" : "font-mono font-bold text-text"}>
                    {transaction.amount >= 0 ? "+" : ""}{transaction.currency} {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              {billingHistoryError ? "Unable to load billing activity." : "No billing activity yet."}
            </p>
          )}
        </div>
      </section>

      {/* Master Billing OFF Notice */}
      {!isBillingEnabled && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Billing System Notice</h3>
            <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
              Paid billing subscriptions are currently operating in <strong>Free Preview mode</strong>. All limits and quotas are standard for Free accounts while payment gateways are being prepared.
            </p>
          </div>
        </div>
      )}

      {/* Usage Overview Header (when billing is enabled) */}
      {isBillingEnabled && (
        <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-text">Current Usage & Allowance</h2>
            </div>
            <span className="text-xs text-text-secondary font-mono">
              Period: {usage?.periodStart ? new Date(usage.periodStart).toLocaleDateString() : "Current Month"} – {usage?.periodEnd ? new Date(usage.periodEnd).toLocaleDateString() : "End of Month"}
            </span>
          </div>

          {/* Usage Alerts */}
          {isLogsMaxed && (
            payg?.enabled ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs sm:text-sm text-primary font-medium">
                <TrendingUp className="h-5 w-5 shrink-0" />
                <span>You&apos;ve exceeded your plan&apos;s included allowance ({logsCount.toLocaleString()} / {maxLogs.toLocaleString()} logs). Additional logs are overflowing into Pay-As-You-Go billing.</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 p-3 text-xs sm:text-sm text-error font-medium">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>You&apos;ve reached your plan&apos;s included log limit ({logsCount.toLocaleString()} / {maxLogs.toLocaleString()} logs). Enable PAYG below or upgrade your plan to accept more logs.</span>
              </div>
            )
          )}

          {isLogsWarning && !isLogsMaxed && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs sm:text-sm text-warning font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>You&apos;re using {logsCount.toLocaleString()} / {maxLogs.toLocaleString()} logs ({logsPercentage}%). Additional logs beyond this limit will use PAYG billing if enabled.</span>
            </div>
          )}

          {/* Meter Bars */}
          <div className="grid gap-6 sm:grid-cols-3 pt-2">
            {/* Logs Meter */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-background/30 border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-primary" /> Logs Ingested
                </span>
                <span className="font-mono font-bold text-text">
                  {logsCount.toLocaleString()} / {maxLogs.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border/60 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isLogsMaxed ? "bg-error" : isLogsWarning ? "bg-warning" : "bg-primary"
                  }`}
                  style={{ width: `${logsPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>Monthly Quota</span>
                <span>{logsPercentage}% Used</span>
              </div>
            </div>

            {/* Projects Meter */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-background/30 border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" /> Projects Used
                </span>
                <span className="font-mono font-bold text-text">
                  {projectCount} / {maxProjects}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border/60 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${projectsPercentage >= 100 ? "bg-error" : "bg-primary/70"}`}
                  style={{ width: `${projectsPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>Active Projects</span>
                <span>{projectsPercentage}% Used</span>
              </div>
            </div>

            {/* Retention Policy */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-background/30 border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Data Retention
                </span>
                <span className="font-mono font-bold text-text">
                  {retentionDays} Days
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border/60 overflow-hidden">
                <div className="h-full bg-primary/50 transition-all duration-500" style={{ width: `${retentionPercentage}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>Automatic Purge</span>
                <span>{retentionPercentage}% of maximum</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* FREE PLAN CARD */}
        <div
          className={`glass rounded-[var(--radius-lg)] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${
            !isPlus ? "ring-2 ring-primary/40 bg-primary/[0.02]" : "opacity-90"
          }`}
        >
          {!isPlus && (
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
              <Check className="h-3.5 w-3.5" /> Current Plan
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-black text-text">Free Plan</h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Essential logging for personal projects and small teams.
            </p>
            <div className="flex items-baseline gap-1 my-4">
              <span className="text-3xl font-black text-text">₦0</span>
              <span className="text-xs text-text-secondary font-medium">/ month</span>
            </div>

            <ul className="space-y-2.5 my-6 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>10,000</strong> logs / month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>2</strong> active projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>7-day</strong> log retention history</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Standard search & filtering</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/40">
            {!isPlus ? (
              <p className="text-xs text-text-muted text-center italic">
                You are currently using Logged for free.
              </p>
            ) : (
              <p className="text-xs text-text-muted text-center">
                Base account features included.
              </p>
            )}
          </div>
        </div>

        {/* PLUS PLAN CARD */}
        <div
          className={`glass rounded-[var(--radius-lg)] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${
            isPlus ? "ring-2 ring-primary bg-primary/[0.04]" : ""
          }`}
        >
          {isPlus && (
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-3 py-1 text-xs font-bold shadow-sm">
              <Zap className="h-3.5 w-3.5 fill-current" /> Active Plan
            </div>
          )}

          {!isBillingEnabled && (
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-warning/10 border border-warning/30 px-3 py-1 text-xs font-bold text-warning">
              Coming Soon
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-black text-text">Plus Plan</h3>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Pro</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              High volume logging, extended retention, and pay-as-you-go scaling.
            </p>
            <div className="flex items-baseline gap-1 my-4">
              <span className="text-3xl font-black text-text">₦5,000</span>
              <span className="text-xs text-text-secondary font-medium">/ month</span>
            </div>

            <ul className="space-y-2.5 my-6 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>100,000</strong> included logs / month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>10</strong> active projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>30-day</strong> log retention history</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Pay-As-You-Go</strong> extra log overflow</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Priority log indexing & support</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/40">
            {!isBillingEnabled ? (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-xs font-bold text-primary/60 cursor-not-allowed"
              >
                Upgrade Coming Soon
              </button>
            ) : isPlus ? (
              <div className="space-y-2">
                {sub?.cancelAtPeriodEnd ? (
                  <div className="text-center p-2 rounded-xl bg-warning/10 text-warning text-xs font-medium">
                    Subscription cancels at period end ({sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : ""})
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-xs font-semibold text-error hover:bg-error/20 transition disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => void handleCheckout()}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover active:scale-98 transition shadow-sm disabled:opacity-50"
              >
                {actionLoading ? (
                  <Cardio size="28" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  <>
                    Upgrade to Plus <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* PAYG (PAY-AS-YOU-GO) CARD */}
        <div
          className={`glass rounded-[var(--radius-lg)] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${
            payg?.enabled ? "ring-2 ring-primary/60 bg-primary/[0.03]" : ""
          }`}
        >
          {payg?.enabled && (
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Active
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-black text-text">Pay-As-You-Go</h3>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Flexible</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              On-demand log scaling beyond your plan&apos;s monthly allowance.
            </p>
            <div className="flex items-baseline gap-1 my-4">
              <span className="text-3xl font-black text-text">₦500</span>
              <span className="text-xs text-text-secondary font-medium">/ 10,000 logs</span>
            </div>

            <ul className="space-y-2.5 my-6 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>No log drop</strong> when limit reached</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>₦500</strong> per 10k additional logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Safety cap</strong> spending limit control</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Toggle ON/OFF</strong> anytime</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/40">
            {!isBillingEnabled ? (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-xs font-bold text-primary/60 cursor-not-allowed"
              >
                PAYG Coming Soon
              </button>
            ) : !limits?.paygAvailable ? (
              <button
                onClick={() => setShowPaygPlanModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover active:scale-98 transition shadow-sm disabled:opacity-50"
              >
                Upgrade to Enable PAYG <ArrowRight className="h-4 w-4" />
              </button>
            ) : payg?.enabled ? (
              <button
                onClick={() => handleTogglePayg(false)}
                disabled={paygUpdating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text hover:bg-glass transition disabled:opacity-50"
              >
                {paygUpdating ? (
                  <Cardio size="28" color="currentColor" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  "Disable PAYG Mode"
                )}
              </button>
            ) : !canFundPayg ? (
              <button
                onClick={() => void handleDeposit()}
                disabled={depositLoading || wallet?.status !== "active"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition shadow-sm disabled:opacity-50"
              >
                {depositLoading ? (
                  <Cardio size="28" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  "Deposit to Enable PAYG"
                )}
              </button>
            ) : (
              <button
                onClick={() => handleTogglePayg(true)}
                disabled={paygUpdating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover active:scale-98 transition shadow-sm disabled:opacity-50"
              >
                {paygUpdating ? (
                  <Cardio size="28" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  <>
                    Enable PAYG Mode <TrendingUp className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PAYG (Pay-As-You-Go) Overflow Section (Independent billing mode) */}
      {isBillingEnabled && (
        <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text">Pay-As-You-Go (PAYG) Overflow</h3>
                <p className="text-xs text-text-secondary">
                  Independent overflow billing mode. Automatically accept extra logs beyond your plan&apos;s included allowance at ₦500 per 10,000 additional logs.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text-secondary">
                {payg?.enabled
                  ? "PAYG Active"
                  : !limits?.paygAvailable
                    ? "Upgrade to Enable PAYG"
                    : !canFundPayg
                      ? "Deposit to Enable PAYG"
                      : "PAYG Disabled"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!payg?.enabled && !limits?.paygAvailable) {
                    setShowPaygPlanModal(true);
                    return;
                  }
                  if (!payg?.enabled && !canFundPayg) return;
                  void handleTogglePayg(!payg?.enabled);
                }}
                disabled={
                  paygUpdating
                  || (!payg?.enabled && limits?.paygAvailable && !canFundPayg)
                }
                aria-label={
                  payg?.enabled
                    ? "Disable PAYG"
                    : !limits?.paygAvailable
                      ? "Learn why PAYG is unavailable"
                      : "Enable PAYG"
                }
                aria-pressed={payg?.enabled ?? false}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  payg?.enabled ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    payg?.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Limit Warnings */}
          {isLimitReached && (
            <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-xs sm:text-sm text-error">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">PAYG Spending Limit Reached</h4>
                <p className="mt-0.5">
                  Your accrued PAYG charges have reached your spending limit of ₦{spendingLimit?.toLocaleString()}. Additional log ingest is currently blocked. Increase your limit below to resume log ingest.
                </p>
              </div>
            </div>
          )}

          {isLimitWarning && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs sm:text-sm text-warning">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Approaching PAYG Spending Limit</h4>
                <p className="mt-0.5">
                  You have reached 80% of your ₦{spendingLimit?.toLocaleString()} spending limit.
                </p>
              </div>
            </div>
          )}

          {/* Accrual Summary Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl bg-background/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase">Extra Overflow Logs</span>
              <div className="text-xl font-black text-text font-mono">
                {extraLogs.toLocaleString()} logs
              </div>
              <p className="text-[10px] text-text-secondary">Beyond 100,000 monthly allowance</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase">Billable Units</span>
              <div className="text-xl font-black text-text font-mono">
                {billableUnits} units
              </div>
              <p className="text-[10px] text-text-secondary">1 unit = 10,000 additional logs</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase">Accrued Charge (Est.)</span>
              <div className="text-xl font-black text-primary font-mono">
                ₦{estimatedAmount.toLocaleString()}
              </div>
              <p className="text-[10px] text-text-secondary">Settled at period end</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase">Available Wallet Balance</span>
              <div className="text-xl font-black text-text font-mono">
                NGN {walletBalance.toLocaleString()}
              </div>
              <p className="text-[10px] text-text-secondary">Available for immediate PAYG deductions</p>
            </div>
          </div>

          {/* Spending Limit Setting */}
          <div className="p-4 rounded-2xl bg-background/30 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-text flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Monthly Spending Safety Cap
              </h4>
              <p className="text-xs text-text-secondary">
                Limit maximum PAYG charges per billing cycle. Set to empty for unlimited overflow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {editingLimit ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-text-muted font-bold">₦</span>
                    <input
                      type="number"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      placeholder="No limit"
                      className="w-32 rounded-xl border border-border bg-background px-3 py-1.5 pl-7 text-xs font-mono text-text outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleSavePaygLimit}
                    disabled={paygUpdating}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLimit(false)}
                    className="rounded-xl border border-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-text">
                    {spendingLimit !== null ? `₦${spendingLimit.toLocaleString()}` : "No Spending Cap"}
                  </span>
                  <button
                    onClick={() => setEditingLimit(true)}
                    className="rounded-xl border border-border bg-background/50 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text hover:bg-glass"
                  >
                    Edit Cap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingBillingAction && billingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close billing confirmation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPendingBillingAction(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-confirmation-title"
            className="relative glass w-full max-w-lg space-y-5 rounded-[var(--radius-lg)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div>
              <h2 id="billing-confirmation-title" className="text-lg font-black text-text">
                Confirm billing details
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Please confirm these details before continuing. You can edit them if anything has changed.
              </p>
            </div>

            <dl className="grid gap-x-6 gap-y-4 rounded-2xl border border-border/70 bg-background/30 p-4 text-sm sm:grid-cols-2">
              {billingProfile.billingType === "business" && billingProfile.companyName && (
                <div>
                  <dt className="text-xs font-semibold text-text-muted">Company</dt>
                  <dd className="mt-1 font-medium text-text">{billingProfile.companyName}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold text-text-muted">Billing contact</dt>
                <dd className="mt-1 font-medium text-text">{billingProfile.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-text-muted">Billing email</dt>
                <dd className="mt-1 break-all font-medium text-text">{billingProfile.email}</dd>
              </div>
              {billingProfile.phone && (
                <div>
                  <dt className="text-xs font-semibold text-text-muted">Phone</dt>
                  <dd className="mt-1 font-medium text-text">{billingProfile.phone}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-text-muted">Billing address</dt>
                <dd className="mt-1 font-medium text-text">
                  {[billingProfile.addressLine1, billingProfile.addressLine2, billingProfile.city, billingProfile.region, billingProfile.postalCode, billingProfile.country]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
              {billingProfile.billingType === "business" && billingProfile.taxId && (
                <div>
                  <dt className="text-xs font-semibold text-text-muted">Tax / VAT ID</dt>
                  <dd className="mt-1 font-medium text-text">{billingProfile.taxId}</dd>
                </div>
              )}
            </dl>

            <div className="flex items-center justify-between gap-3">
              <Link
                href={getPendingBillingEditUrl()}
                onClick={() => {
                  if (pendingBillingAction) {
                    window.sessionStorage.setItem("billing-resume", pendingBillingAction);
                  }
                }}
                className="text-sm font-semibold text-primary transition hover:text-primary-hover"
              >
                Edit billing details
              </Link>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPendingBillingAction(null)}
                  className="rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text transition hover:bg-glass-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={continueBillingAction}
                  disabled={actionLoading || depositLoading || paygUpdating}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
                >
                  Confirm and continue
                </button>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              This confirms your billing contact details only. Payment method details remain with the payment provider.
            </p>
          </div>
        </div>
      )}

      {showPaygPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close PAYG availability dialog"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPaygPlanModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payg-plan-dialog-title"
            className="relative glass w-full max-w-md space-y-5 rounded-[var(--radius-lg)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <h2 id="payg-plan-dialog-title" className="text-lg font-black text-text">
                Plus plan required
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Pay-As-You-Go is currently available to Plus users only. Upgrade your plan to enable PAYG and continue accepting logs beyond your included allowance.
            </p>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPaygPlanModal(false)}
                className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text transition hover:bg-glass-hover"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaygPlanModal(false);
                  void handleCheckout();
                }}
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
              >
                {actionLoading ? (
                  <Cardio size="20" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  <>Upgrade to Plus <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative glass rounded-[var(--radius-lg)] p-6 shadow-xl w-full max-w-md space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-error/10">
                <AlertCircle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text">Cancel Subscription</h3>
                <p className="text-xs text-text-secondary">Are you sure you want to cancel Plus?</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Your subscription will remain active until the end of your current billing period. Afterwards, your account will revert to the <strong>Free Plan</strong> (10k monthly logs, 2 projects, 7-day retention).
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text transition hover:bg-glass-hover"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-40"
              >
                {actionLoading ? (
                  <Cardio size="28" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
