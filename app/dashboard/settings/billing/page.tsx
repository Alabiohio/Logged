"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  Check
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
  retentionDays: number;
}

interface PaygAccrual {
  extraLogs: number;
  billableUnits: number;
  estimatedAmount: number;
  currency: string;
}

interface PaygInfo {
  enabled: boolean;
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

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [paygDetails, setPaygDetails] = useState<PaygInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paygUpdating, setPaygUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // PAYG limit edit state
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState<string>("");

  // Cancel sub modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchBilling = useCallback(async () => {
    try {
      setError(null);
      const [resBilling, resPayg] = await Promise.all([
        fetch("/api/billing"),
        fetch("/api/billing/payg"),
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
    } catch {
      setError("Network error loading billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBilling();
  }, [fetchBilling]);

  // Auto-verify payment when Paystack redirects back with ?reference= or ?trxref=
  const searchParams = useSearchParams();
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const checkout = searchParams.get("checkout");
    if (!reference && checkout !== "success") return;

    const verifyPayment = async () => {
      if (reference) {
        try {
          const res = await fetch(`/api/billing/verify?reference=${reference}`);
          const json = await res.json();
          if (res.ok && json.success) {
            setSuccess("🎉 Payment successful! Your account has been upgraded to Plus.");
          } else {
            // Webhook may have already handled it — just refresh silently
          }
        } catch {
          // Best-effort: webhook handles the actual upgrade
        }
      } else {
        setSuccess("🎉 Payment received! Your plan will be updated shortly.");
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
    window.history.replaceState({}, "", url.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "plus" }),
      });
      const json = await res.json();
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

  const handleTogglePayg = async (enabled: boolean) => {
    setPaygUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/payg", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paygEnabled: enabled }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Failed to update PAYG settings");
      } else {
        setPaygDetails((prev) => (prev ? { ...prev, enabled: json.enabled } : prev));
        setSuccess(`PAYG ${enabled ? "enabled" : "disabled"} successfully.`);
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
  const logsPercentage = Math.min(Math.round((logsCount / maxLogs) * 100), 100);
  const isLogsWarning = logsPercentage >= 80 && logsPercentage < 100;
  const isLogsMaxed = logsCount >= maxLogs;

  const projectCount = 0; // projects can be counted dynamically or pulled
  const maxProjects = limits?.maxProjects ?? 2;

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
                  <FolderKanban className="h-3.5 w-3.5 text-primary" /> Max Projects
                </span>
                <span className="font-mono font-bold text-text">
                  {maxProjects} Projects
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border/60 overflow-hidden">
                <div className="h-full bg-primary/70 transition-all duration-500" style={{ width: isPlus ? "50%" : "100%" }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>Active Cap</span>
                <span>{isPlus ? "Up to 10" : "Up to 2"}</span>
              </div>
            </div>

            {/* Retention Policy */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-background/30 border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Data Retention
                </span>
                <span className="font-mono font-bold text-text">
                  {limits?.retentionDays ?? 7} Days
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border/60 overflow-hidden">
                <div className="h-full bg-primary/50 transition-all duration-500" style={{ width: isPlus ? "100%" : "23%" }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>Automatic Purge</span>
                <span>{isPlus ? "30 Days" : "7 Days"}</span>
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
                onClick={handleCheckout}
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
                {payg?.enabled ? "PAYG Active" : "PAYG Disabled"}
              </span>
              <button
                onClick={() => handleTogglePayg(!payg?.enabled)}
                disabled={paygUpdating}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
          <div className="grid gap-4 sm:grid-cols-3">
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
