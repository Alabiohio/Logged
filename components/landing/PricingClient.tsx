"use client";

import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  Database,
  Clock,
  RefreshCw,
  TrendingUp,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export interface PricingPlan {
  id: string;
  name?: string;
  displayName: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string | null;
  includedLogs: number;
  projectLimit: number;
  retentionDays: number;
  paygEnabled: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PaygRate {
  pricePerUnit: number;
  logsPerUnit: number;
  currency: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    description: "Essential log monitoring for personal projects, side apps, and development.",
    price: 0,
    currency: "NGN",
    interval: null,
    includedLogs: 10_000,
    projectLimit: 2,
    retentionDays: 7,
    paygEnabled: false,
  },
  {
    id: "plus",
    name: "plus",
    displayName: "Plus",
    description: "Expanded limits, longer retention, and pay-as-you-go flexibility for production apps.",
    price: 500_000,
    currency: "NGN",
    interval: "monthly",
    includedLogs: 100_000,
    projectLimit: 10,
    retentionDays: 30,
    paygEnabled: true,
  },
];

const DEFAULT_PAYG_RATE: PaygRate = {
  pricePerUnit: 500,
  logsPerUnit: 10_000,
  currency: "NGN",
};

function formatPrice(amount: number, currency: string = "NGN"): { display: string; isFree: boolean } {
  if (amount === 0) {
    return { display: "Free", isFree: true };
  }

  try {
    // If price is stored in minor units (e.g. kobo 500,000 = ₦5,000)
    const normalized = amount >= 100 ? amount / 100 : amount;
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(normalized);
    return { display: formatted, isFree: false };
  } catch {
    return { display: `₦${(amount / 100).toLocaleString()}`, isFree: false };
  }
}

function formatRate(amount: number, currency: string = "NGN"): string {
  try {
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted;
  } catch {
    return `₦${amount.toLocaleString()}`;
  }
}

interface PricingClientProps {
  initialPlans?: PricingPlan[];
  paygRate?: PaygRate;
}

export default function PricingClient({ initialPlans, paygRate: initialPaygRate }: PricingClientProps) {
  const plans = useMemo(() => {
    if (initialPlans && initialPlans.length > 0) {
      return initialPlans;
    }
    return DEFAULT_PLANS;
  }, [initialPlans]);

  const paygRate = initialPaygRate || DEFAULT_PAYG_RATE;
  const paygPriceDisplay = formatRate(paygRate.pricePerUnit, paygRate.currency);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Background ambient glow matching landing design */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none isolate">
        <div className="h-[450px] w-[600px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      {/* Header section */}
      <div className="mx-auto max-w-3xl text-center">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-2xl font-hero font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          Predictable plans for{" "}
          <span className="text-primary underline decoration-primary/30 underline-offset-8">
            modern teams.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg"
        >
          Start monitoring for free during development. Upgrade when you need higher ingestion, longer data retention, or on-demand scale.
        </motion.p>
      </div>

      {/* Pricing Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="mt-14 sm:mt-18 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan) => {
          const { display: priceDisplay, isFree } = formatPrice(plan.price, plan.currency);
          const isFeatured = !isFree;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 backdrop-blur-2xl transition-all duration-300 shadow-xl ${
                isFeatured
                  ? "border-primary/50 bg-glass/80 ring-2 ring-primary/40 shadow-primary/10 shadow-2xl"
                  : "border-border/80 bg-glass/50 hover:border-primary/40 hover:bg-glass/70"
              }`}
            >
              {/* Highlight ribbon for featured plan */}
              {isFeatured && (
                <>
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-md shadow-primary/25">
                    Popular
                  </div>
                </>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-hero font-extrabold text-text group-hover:text-primary transition-colors">
                    {plan.displayName}
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-text-secondary min-h-[40px]">
                  {plan.description || "Everything you need to monitor, debug, and understand your app."}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-hero text-4xl sm:text-5xl font-black text-text tracking-tight">
                    {priceDisplay}
                  </span>
                  {!isFree && (
                    <span className="text-sm font-medium text-text-muted">
                      / {plan.interval ? plan.interval.replace(/ly$/, "") : "month"}
                    </span>
                  )}
                </div>

                {/* Call to action button */}
                <Link
                  href={isFree ? "/dashboard" : "/dashboard/settings/billing"}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 px-6 font-semibold transition-all duration-200 ${
                    isFeatured
                      ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98]"
                      : "border border-border/80 bg-glass-hover/60 text-text hover:bg-glass-hover hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <span>{isFree ? "Start Free" : "Upgrade to Plus"}</span>
                  <ArrowRight size={16} />
                </Link>

                {/* Plan Key Spec Chips */}
                <div className="mt-8 grid grid-cols-2 gap-2.5 rounded-2xl border border-border/60 bg-glass-hover/30 p-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-primary shrink-0" />
                    <span><strong>{plan.includedLogs.toLocaleString()}</strong> logs/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary shrink-0" />
                    <span><strong>{plan.retentionDays} days</strong> retention</span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-8 space-y-3.5 text-sm text-text-secondary">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span><strong>{plan.projectLimit}</strong> active {plan.projectLimit === 1 ? "project" : "projects"}</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span>Real-time live error & log streaming</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span>Environment isolation (Dev, Staging, Prod)</span>
                  </li>

                  {plan.paygEnabled ? (
                    <li className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <span className="font-medium text-text">Pay-As-You-Go overage eligible</span>
                    </li>
                  ) : (
                    <li className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <span>Automated purge on retention limit</span>
                    </li>
                  )}

                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span>Full stack trace & metadata inspection</span>
                  </li>
                </ul>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-8 pt-4 border-t border-border/50 text-xs text-text-muted flex items-center justify-between">
                <span>{isFree ? "No credit card required" : "Cancel anytime"}</span>
                <span className="font-mono text-[11px]">Instant activation</span>
              </div>
            </motion.div>
          );
        })}

        {/* Dedicated Pay-As-You-Go (PAYG) Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-glass/50 p-8 backdrop-blur-2xl transition-all duration-300 shadow-xl hover:border-info/40 hover:bg-glass/70"
        >
          {/* On-Demand pill badge */}
          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-info/10 border border-info/30 px-3 py-1 text-xs font-bold text-info shadow-sm">
            <TrendingUp size={12} />
            On-Demand
          </div>

          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-hero font-extrabold text-text group-hover:text-info transition-colors">
                Pay-As-You-Go
              </h3>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-text-secondary min-h-[40px]">
              On-demand log scaling beyond your monthly plan allowance with zero log drops.
            </p>

            {/* Price display */}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-hero text-4xl sm:text-5xl font-black text-text tracking-tight">
                {paygPriceDisplay}
              </span>
              <span className="text-sm font-medium text-text-muted">
                / {paygRate.logsPerUnit.toLocaleString()} logs
              </span>
            </div>

            {/* CTA Button */}
            <Link
              href="/dashboard/settings/billing"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-glass-hover/60 py-3.5 px-6 font-semibold text-text transition-all duration-200 hover:bg-glass-hover hover:border-info/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enable PAYG</span>
              <ArrowRight size={16} />
            </Link>

            {/* Spec Chips */}
            <div className="mt-8 grid grid-cols-2 gap-2.5 rounded-2xl border border-border/60 bg-glass-hover/30 p-3 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-info shrink-0" />
                <span><strong>Flexible</strong> spend caps</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-info shrink-0" />
                <span><strong>Zero drops</strong> on spikes</span>
              </div>
            </div>

            {/* Checklist */}
            <ul className="mt-8 space-y-3.5 text-sm text-text-secondary">
              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span><strong>No log drop</strong> when plan limit is reached</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span><strong>{paygPriceDisplay}</strong> per {paygRate.logsPerUnit.toLocaleString()} additional logs</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span><strong>Safety cap</strong> custom spending limit control</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span><strong>Toggle ON/OFF</strong> anytime with zero lock-in</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span>Compatible with active paid subscriptions</span>
              </li>
            </ul>
          </div>

          {/* Bottom Card Footer */}
          <div className="mt-8 pt-4 border-t border-border/50 text-xs text-text-muted flex items-center justify-between">
            <span>Pay only for what you ingest</span>
            <span className="font-mono text-[11px]">Usage-based</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Trust & Guarantee Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-14 mx-auto max-w-3xl rounded-2xl border border-border/70 bg-glass/40 p-4 text-center text-xs text-text-muted backdrop-blur-md flex flex-wrap items-center justify-center gap-6"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <span>Encrypted data in transit & at rest</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={15} className="text-primary" />
          <span>Switch or cancel plans whenever you need</span>
        </div>
      </motion.div>
    </section>
  );
}
