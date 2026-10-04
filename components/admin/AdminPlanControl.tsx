"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Pencil, Plus, Save, X } from "lucide-react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface BillingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  paygEnabled: boolean;
  price: number;
  currency: string;
  interval: string | null;
  includedLogs: number;
  projectLimit: number;
  retentionDays: number;
  paystackPlanCode: string | null;
}

interface PlanDraft {
  displayName: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  includedLogs: string;
  projectLimit: string;
  retentionDays: string;
  paystackPlanCode: string;
  isActive: boolean;
  sortOrder: string;
  paygEnabled: boolean;
}

const emptyDraft: PlanDraft = {
  displayName: "",
  description: "",
  price: "",
  currency: "",
  interval: "",
  includedLogs: "",
  projectLimit: "",
  retentionDays: "",
  paystackPlanCode: "",
  isActive: false,
  sortOrder: "0",
  paygEnabled: false,
};

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary";

function toDraft(plan: BillingPlan): PlanDraft {
  return {
    displayName: plan.displayName,
    description: plan.description ?? "",
    price: plan.price.toString(),
    currency: plan.currency,
    interval: plan.interval ?? "",
    includedLogs: plan.includedLogs.toString(),
    projectLimit: plan.projectLimit.toString(),
    retentionDays: plan.retentionDays.toString(),
    paystackPlanCode: plan.paystackPlanCode ?? "",
    isActive: plan.isActive,
    sortOrder: plan.sortOrder.toString(),
    paygEnabled: plan.paygEnabled,
  };
}

export default function AdminPlanControl() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/billing/plans");
      const data = await response.json() as { plans?: BillingPlan[]; error?: string };
      if (!response.ok) {
        setError(data.error || "Unable to load billing plans.");
        return;
      }
      setPlans(data.plans ?? []);
    } catch {
      setError("Network error loading billing plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchPlans);
  }, [fetchPlans]);

  const startCreate = () => {
    setError(null);
    setSuccess(null);
    setEditingId(null);
    setIsCreating(true);
    setDraft({ ...emptyDraft });
  };

  const startEdit = (plan: BillingPlan) => {
    setError(null);
    setSuccess(null);
    setIsCreating(false);
    setEditingId(plan.id);
    setDraft(toDraft(plan));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setDraft({ ...emptyDraft });
  };

  const updateDraft = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const savePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const numericFields = [
      draft.price,
      draft.includedLogs,
      draft.projectLimit,
      draft.retentionDays,
      draft.sortOrder,
    ];
    if (numericFields.some((value) => value.trim() === "" || !Number.isSafeInteger(Number(value)) || Number(value) < 0)) {
      setError("Price, limits, and order must be non-negative whole numbers.");
      setSaving(false);
      return;
    }
    if (!/^[A-Za-z]{3}$/.test(draft.currency.trim())) {
      setError("Enter a three-letter currency code.");
      setSaving(false);
      return;
    }
    if (Number(draft.price) > 0 && !draft.interval) {
      setError("Paid plans need a recurring billing interval.");
      setSaving(false);
      return;
    }

    const payload = {
      ...draft,
      ...(editingId ? { id: editingId } : {}),
      displayName: draft.displayName.trim(),
      description: draft.description.trim() || null,
      price: Number(draft.price),
      currency: draft.currency.trim().toUpperCase(),
      interval: draft.interval || null,
      includedLogs: Number(draft.includedLogs),
      projectLimit: Number(draft.projectLimit),
      retentionDays: Number(draft.retentionDays),
      paystackPlanCode: draft.paystackPlanCode.trim() || null,
      sortOrder: Number(draft.sortOrder),
    };

    try {
      const response = await fetch("/api/admin/billing/plans", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setError(data.error || "Unable to save this plan.");
        return;
      }
      setSuccess(editingId ? "Plan updated." : "Plan created.");
      cancelEdit();
      await fetchPlans();
    } catch {
      setError("Failed to communicate with the billing plans API.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-border" />
        <div className="h-20 w-full animate-pulse rounded-xl bg-border/50" />
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight text-text">Plan configuration</h2>
          <p className="text-xs text-text-secondary">
            Configure plan offers and their availability. Prices use the currency&apos;s smallest unit.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add plan
        </button>
      </div>

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

      {plans.length === 0 && (
        <p className="rounded-xl border border-border p-4 text-sm text-text-secondary">
          No plans are configured yet.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-xl border border-border/70 bg-background/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-text">{plan.displayName}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${plan.isActive ? "bg-success/10 text-success" : "bg-border text-text-muted"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                  {plan.paygEnabled && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">PAYG</span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-text-muted">{plan.name}</p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(plan)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text hover:border-primary"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {plan.price} {plan.currency}{plan.interval ? ` / ${plan.interval}` : " · no recurring interval"}
              {" · "}{plan.includedLogs.toLocaleString()} logs
              {" · "}{plan.projectLimit} projects
              {" · "}{plan.retentionDays} days retention
            </p>
            {plan.description && <p className="mt-2 text-xs text-text-muted">{plan.description}</p>}
            <p className="mt-2 text-[11px] text-text-muted">
              Order {plan.sortOrder} · Paystack code {plan.paystackPlanCode ? "configured" : "not configured"}
            </p>
          </article>
        ))}
      </div>

      {isCreating || editingId ? (
        <form onSubmit={savePlan} className="space-y-5 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-text">{editingId ? "Edit plan" : "New plan"}</h3>
            <button type="button" onClick={cancelEdit} aria-label="Cancel plan editing" className="rounded-lg p-2 text-text-muted hover:bg-border/50">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Plan name
              <input required maxLength={80} value={draft.displayName} onChange={(event) => updateDraft("displayName", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Price (minor currency units)
              <input required type="number" min="0" step="1" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Currency
              <input required minLength={3} maxLength={3} value={draft.currency} onChange={(event) => updateDraft("currency", event.target.value.toUpperCase())} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Billing interval
              <select value={draft.interval} onChange={(event) => updateDraft("interval", event.target.value)} className={inputClassName}>
                <option value="">No interval (free plans only)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannually">Biannually</option>
                <option value="annually">Annually</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Included logs
              <input required type="number" min="0" step="1" value={draft.includedLogs} onChange={(event) => updateDraft("includedLogs", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Project limit
              <input required type="number" min="0" step="1" value={draft.projectLimit} onChange={(event) => updateDraft("projectLimit", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Retention (days)
              <input required type="number" min="0" step="1" value={draft.retentionDays} onChange={(event) => updateDraft("retentionDays", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary">
              Display order
              <input required type="number" min="0" step="1" value={draft.sortOrder} onChange={(event) => updateDraft("sortOrder", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary sm:col-span-2 lg:col-span-3">
              Description
              <textarea maxLength={1000} rows={2} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} className={inputClassName} />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-text-secondary sm:col-span-2 lg:col-span-3">
              Paystack plan code
              <input maxLength={128} value={draft.paystackPlanCode} onChange={(event) => updateDraft("paystackPlanCode", event.target.value)} placeholder="Configure the plan in Paystack first" className={inputClassName} />
            </label>
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-text">
              <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft("isActive", event.target.checked)} />
              Active plan
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-text">
              <input type="checkbox" checked={draft.paygEnabled} onChange={(event) => updateDraft("paygEnabled", event.target.checked)} />
              PAYG eligible
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? <Cardio size="18" color="white" speed="1.5" stroke="3" bgOpacity="0.1" /> : <Save className="h-3.5 w-3.5" />}
            {editingId ? "Save plan" : "Create plan"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
