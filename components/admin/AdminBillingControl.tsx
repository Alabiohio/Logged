"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Power, Save } from "lucide-react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface AdminBillingSettings {
  billingEnabled: boolean | null;
  paymentProvider: string | null;
  paygLogsPerUnit: number | null;
  paygPricePerUnit: number | null;
  walletCurrency: string | null;
  minimumWalletDeposit: number | null;
  providerCredentialConfigured: boolean;
  configurationIssues: string[];
  billingReady: boolean;
  readinessIssue: string | null;
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary";

export default function AdminBillingControl() {
  const [settings, setSettings] = useState<AdminBillingSettings | null>(null);
  const [form, setForm] = useState({
    paygLogsPerUnit: "",
    paygPricePerUnit: "",
    walletCurrency: "",
    minimumWalletDeposit: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applySettings = (data: AdminBillingSettings) => {
    setSettings(data);
    setForm({
      paygLogsPerUnit: data.paygLogsPerUnit?.toString() ?? "",
      paygPricePerUnit: data.paygPricePerUnit?.toString() ?? "",
      walletCurrency: data.walletCurrency ?? "",
      minimumWalletDeposit: data.minimumWalletDeposit?.toString() ?? "",
    });
  };

  const fetchSettings = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/billing");
      const data = await response.json() as AdminBillingSettings & { error?: string };
      if (!response.ok) {
        setError(data.error || "Failed to load billing settings.");
        return;
      }
      applySettings(data);
    } catch {
      setError("Network error loading billing settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchSettings);
  }, [fetchSettings]);

  const updateSettings = async (updates: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json() as AdminBillingSettings & { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        setError(data.error || "Failed to update billing settings.");
        return;
      }
      applySettings(data);
      setSuccess("Billing configuration saved.");
    } catch {
      setError("Failed to communicate with the billing settings API.");
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = () => {
    const values = {
      paygLogsPerUnit: Number(form.paygLogsPerUnit),
      paygPricePerUnit: Number(form.paygPricePerUnit),
      minimumWalletDeposit: Number(form.minimumWalletDeposit),
    };
    if (!/^[A-Za-z]{3}$/.test(form.walletCurrency.trim())) {
      setError("Enter a supported three-letter wallet currency code.");
      return;
    }
    if (Object.values(values).some((value) => !Number.isSafeInteger(value) || value <= 0)) {
      setError("Enter a positive whole-number value for each payment setting.");
      return;
    }
    void updateSettings({ ...values, walletCurrency: form.walletCurrency.trim().toUpperCase() });
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-border" />
        <div className="h-20 w-full animate-pulse rounded-xl bg-border/50" />
      </div>
    );
  }

  const billingEnabled = settings?.billingEnabled === true;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm">
      <header className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-text">Billing & payment settings</h2>
          <p className="text-xs text-text-secondary">Manage billing availability, provider, and PAYG rates.</p>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-3 text-xs font-medium text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-3 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {settings?.configurationIssues.map((issue) => (
        <div key={issue} className="rounded-xl border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
          {issue}
        </div>
      ))}

      <section className="flex flex-col justify-between gap-4 rounded-xl border border-border/60 bg-background/30 p-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Power className={`h-4 w-4 ${billingEnabled ? "text-success" : "text-text-muted"}`} />
            <h3 className="text-sm font-bold text-text">Master billing switch</h3>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold">
              {billingEnabled ? "ON" : settings?.billingEnabled === null ? "NOT CONFIGURED" : "OFF"}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {settings?.billingReady
              ? "Billing can be enabled after active paid plans are configured."
              : settings?.readinessIssue || "Complete the billing configuration before enabling billing."}
          </p>
        </div>
        <button
          type="button"
          aria-label={billingEnabled ? "Disable billing" : "Enable billing"}
          aria-pressed={billingEnabled}
          onClick={() => void updateSettings({ billingEnabled: !billingEnabled })}
          disabled={saving || (!billingEnabled && !settings?.billingReady)}
          className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            billingEnabled ? "bg-error hover:bg-error/80" : "bg-success hover:bg-success/80"
          }`}
        >
          {saving ? <Cardio size="20" color="white" speed="1.5" stroke="3" bgOpacity="0.1" /> : billingEnabled ? "Disable billing" : "Enable billing"}
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-text">Implemented payment provider</h3>
        <p className="text-xs text-text-secondary">
          Only implemented providers are selectable. Provider secret keys stay in deployment environment variables.
        </p>
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-text">Paystack</p>
            <p className="text-xs text-text-secondary">
              {settings?.providerCredentialConfigured
                ? "Deployment credential is configured."
                : "PAYSTACK_SECRET_KEY is missing from the deployment environment."}
            </p>
          </div>
          {settings?.paymentProvider === "paystack" ? (
            <span className="text-xs font-semibold text-success">Currently selected</span>
          ) : (
            <button
              type="button"
              onClick={() => void updateSettings({ paymentProvider: "paystack" })}
              disabled={saving}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:border-primary disabled:opacity-50"
            >
              Select Paystack
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4 border-t border-border/50 pt-5">
        <div>
          <h3 className="text-sm font-bold text-text">PAYG and wallet thresholds</h3>
          <p className="mt-1 text-xs text-text-secondary">
            PAYG prices and deposit minimums use the wallet currency&apos;s major unit. Plan prices are configured separately in minor units.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
            Logs per PAYG unit
            <input
              type="number"
              min="1"
              step="1"
              value={form.paygLogsPerUnit}
              onChange={(event) => setForm((current) => ({ ...current, paygLogsPerUnit: event.target.value }))}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
            Price per PAYG unit
            <input
              type="number"
              min="1"
              step="1"
              value={form.paygPricePerUnit}
              onChange={(event) => setForm((current) => ({ ...current, paygPricePerUnit: event.target.value }))}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
            Wallet currency
            <input
              type="text"
              maxLength={3}
              value={form.walletCurrency}
              onChange={(event) => setForm((current) => ({ ...current, walletCurrency: event.target.value.toUpperCase() }))}
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
            Minimum wallet deposit ({form.walletCurrency || "currency units"})
            <input
              type="number"
              min="1"
              step="1"
              value={form.minimumWalletDeposit}
              onChange={(event) => setForm((current) => ({ ...current, minimumWalletDeposit: event.target.value }))}
              className={inputClassName}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={savePaymentSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? <Cardio size="18" color="white" speed="1.5" stroke="3" bgOpacity="0.1" /> : <Save className="h-3.5 w-3.5" />}
          Save payment settings
        </button>
      </section>
    </div>
  );
}
