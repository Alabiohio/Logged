"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Globe,
  Power,
  Key,
  Hash,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface AdminBillingSettings {
  billingEnabled: boolean;
  paymentProvider: string;
  paystackPlusPlanCode: string;
  paystackWebhookSecret: string;
}

const PROVIDERS = [
  { id: "paystack", name: "Paystack", badge: "Default", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "stripe", name: "Stripe", badge: "Pluggable", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { id: "flutterwave", name: "Flutterwave", badge: "Pluggable", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
];

export default function AdminBillingControl() {
  const [settings, setSettings] = useState<AdminBillingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields state
  const [planCodeInput, setPlanCodeInput] = useState("");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [savingPlanConfig, setSavingPlanConfig] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/billing");
      if (res.ok) {
        const data = await res.json() as AdminBillingSettings;
        setSettings(data);
        setPlanCodeInput(data.paystackPlusPlanCode ?? "");
        setWebhookSecretInput(data.paystackWebhookSecret ?? "");
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: string }).error || "Failed to load admin billing settings");
      }
    } catch {
      setError("Network error loading admin billing settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async (updates: Partial<AdminBillingSettings>) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json() as AdminBillingSettings & { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setSettings({
          billingEnabled: data.billingEnabled,
          paymentProvider: data.paymentProvider,
          paystackPlusPlanCode: data.paystackPlusPlanCode,
          paystackWebhookSecret: data.paystackWebhookSecret,
        });
        setSuccess("Billing configuration saved.");
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch {
      setError("Failed to communicate with admin billing API");
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePlanConfig = async () => {
    setSavingPlanConfig(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paystackPlusPlanCode: planCodeInput,
          ...(webhookSecretInput.trim() !== "" && { paystackWebhookSecret: webhookSecretInput }),
        }),
      });
      const data = await res.json() as AdminBillingSettings & { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setSettings((prev) => prev ? {
          ...prev,
          paystackPlusPlanCode: data.paystackPlusPlanCode,
          paystackWebhookSecret: data.paystackWebhookSecret,
        } : prev);
        setSuccess("Paystack plan configuration saved successfully.");
      } else {
        setError(data.error || "Failed to save plan configuration");
      }
    } catch {
      setError("Failed to communicate with admin billing API");
    } finally {
      setSavingPlanConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="h-6 w-48 rounded bg-border animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-border/50 animate-pulse" />
      </div>
    );
  }

  const isEnabled = settings?.billingEnabled ?? false;
  const currentProvider = settings?.paymentProvider ?? "paystack";

  return (
    <div className="rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-text">Billing & Gateway Controls</h2>
            <p className="text-xs text-text-secondary">Global payment switch, gateway strategy & Paystack plan codes</p>
          </div>
        </div>
        {updating && (
          <Cardio size="28" color="currentColor" speed="1.5" stroke="3" bgOpacity="0.1" />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-3 text-xs text-success font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Master Billing Switch */}
      <div className="p-4 rounded-xl border border-border/60 bg-background/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Power className={`h-4 w-4 ${isEnabled ? "text-success" : "text-text-muted"}`} />
            <h3 className="text-sm font-bold text-text">Master Billing Mode</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isEnabled ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
            }`}>
              {isEnabled ? "LIVE BILLING ON" : "FREE PREVIEW MODE"}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {isEnabled
              ? "Paid subscriptions, checkout redirects, and PAYG charges are ACTIVE."
              : "Billing is DISABLED. All users operate under Free plan limits without charge."}
          </p>
        </div>

        <button
          onClick={() => handleUpdate({ billingEnabled: !isEnabled })}
          disabled={updating}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isEnabled ? "bg-success" : "bg-border"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Payment Gateway Strategy Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-text">Active Payment Provider Strategy</h3>
        </div>
        <p className="text-xs text-text-secondary">
          Select which payment gateway strategy processes checkouts and webhooks. Switching requires zero core code changes.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          {PROVIDERS.map((provider) => {
            const isActive = currentProvider === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => handleUpdate({ paymentProvider: provider.id })}
                disabled={updating}
                className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 bg-background/20 hover:border-primary/40 hover:bg-glass"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-bold text-text">{provider.name}</span>
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${provider.color}`}>
                      {provider.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-text-secondary">
                  {isActive ? "Currently Active Gateway" : `Switch to ${provider.name}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paystack Plan Configuration */}
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-text">Paystack Plan Configuration</h3>
        </div>
        <p className="text-xs text-text-secondary">
          Configure the Paystack plan code for the Plus subscription. Get this from your{" "}
          <a href="https://dashboard.paystack.com/#/plans" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
            Paystack Plans dashboard
          </a>.
        </p>

        <div className="space-y-3">
          {/* Plus Plan Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> Plus Plan Code
            </label>
            <div className="flex gap-2">
              <input
                id="paystackPlusPlanCode"
                type="text"
                value={planCodeInput}
                onChange={(e) => setPlanCodeInput(e.target.value)}
                placeholder="e.g. PLN_xxxxxxxxxxxx"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-text outline-none focus:border-primary transition"
              />
            </div>
            <p className="text-[10px] text-text-muted">
              This is passed to Paystack on checkout so users are enrolled in the correct recurring plan.
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5" /> Webhook Secret Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="paystackWebhookSecret"
                  type={showSecret ? "text" : "password"}
                  value={webhookSecretInput}
                  onChange={(e) => setWebhookSecretInput(e.target.value)}
                  placeholder="sk_live_... or sk_test_..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 pr-10 text-xs font-mono text-text outline-none focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2.5 top-2 text-text-muted hover:text-text transition"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-muted">
              Your Paystack Secret Key used to verify webhook signatures (HMAC SHA-512). Leave blank to keep the existing value.
            </p>
          </div>

          <button
            onClick={handleSavePlanConfig}
            disabled={savingPlanConfig}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition disabled:opacity-50"
          >
            {savingPlanConfig ? (
              <Cardio size="20" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Plan Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
