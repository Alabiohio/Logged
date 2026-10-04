"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type BillingProfileForm = {
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
};

const emptyForm: BillingProfileForm = {
  billingType: "individual",
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  taxId: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
};

function safeReturnTo(value: string | null): string {
  if (!value) return "/dashboard/settings/billing";

  try {
    const url = new URL(value, window.location.origin);
    if (
      url.origin === window.location.origin &&
      url.pathname === "/dashboard/settings/billing"
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Use the billing page when the provided return path is malformed.
  }

  return "/dashboard/settings/billing";
}

function Field({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: keyof BillingProfileForm;
  value: string;
  onChange: (name: keyof BillingProfileForm, value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-text">
        {label}{required && <span className="text-error"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        autoComplete={autoComplete}
        maxLength={name === "email" ? 254 : undefined}
        className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

export default function BillingDetailsPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BillingProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/billing/profile");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load billing information.");
        }
        if (active) setForm({ ...emptyForm, ...data.profile });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load billing information.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const updateField = (name: keyof BillingProfileForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to save billing information.");
        setSaving(false);
        return;
      }

      const returnTo = safeReturnTo(searchParams.get("returnTo"));
      const resume = new URL(returnTo, window.location.origin).searchParams.get("resume");
      if (resume && ["checkout", "deposit", "payg"].includes(resume)) {
        window.sessionStorage.setItem("billing-resume", resume);
      }
      window.location.assign(returnTo);
    } catch {
      setError("Unable to save billing information. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="glass rounded-[var(--radius-lg)] p-8 text-sm text-text-secondary">
          Loading billing information...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to billing
      </Link>

      <header className="flex items-start gap-4 border-b border-border/50 pb-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl">Billing information</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Add the details needed before starting a payment or billing PAYG usage.
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass space-y-6 rounded-[var(--radius-lg)] p-5 shadow-sm sm:p-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-text">Billing as</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["individual", "business"] as const).map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                  form.billingType === type
                    ? "border-primary bg-primary/10 text-text"
                    : "border-border bg-background/30 text-text-secondary hover:bg-glass-hover"
                }`}
              >
                <input
                  type="radio"
                  name="billingType"
                  value={type}
                  checked={form.billingType === type}
                  onChange={() => updateField("billingType", type)}
                  className="accent-primary"
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        {form.billingType === "business" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company / organization name" name="companyName" value={form.companyName} onChange={updateField} />
            <Field label="Tax / VAT ID" name="taxId" value={form.taxId} onChange={updateField} />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Billing contact name" name="fullName" value={form.fullName} onChange={updateField} required autoComplete="name" />
          <Field label="Billing email" name="email" value={form.email} onChange={updateField} required type="email" autoComplete="email" />
          <Field label="Phone number" name="phone" value={form.phone} onChange={updateField} type="tel" autoComplete="tel" />
          <Field label="Country" name="country" value={form.country} onChange={updateField} required autoComplete="country-name" />
          <div className="sm:col-span-2">
            <Field label="Address line 1" name="addressLine1" value={form.addressLine1} onChange={updateField} required autoComplete="address-line1" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Address line 2 (optional)" name="addressLine2" value={form.addressLine2} onChange={updateField} autoComplete="address-line2" />
          </div>
          <Field label="City" name="city" value={form.city} onChange={updateField} required autoComplete="address-level2" />
          <Field label="State / province / region (if applicable)" name="region" value={form.region} onChange={updateField} autoComplete="address-level1" />
          <Field label="Postal code (optional)" name="postalCode" value={form.postalCode} onChange={updateField} autoComplete="postal-code" />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/50 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/settings/billing"
            className="rounded-xl border border-border bg-background/30 px-5 py-3 text-center text-sm font-semibold text-text-secondary transition hover:bg-glass-hover hover:text-text"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Saving..." : "Save billing details"}
          </button>
        </div>
      </form>
    </main>
  );
}
