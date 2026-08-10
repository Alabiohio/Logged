"use client";

import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for personal projects and learning.",
    highlighted: false,
    features: [
      "1 Project",
      "10,000 logs / month",
      "7-day retention",
      "Basic search",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For startups and growing teams.",
    highlighted: true,
    features: [
      "Unlimited projects",
      "1M logs / month",
      "90-day retention",
      "Advanced search",
      "Real-time alerts",
      "Analytics",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Built for large organizations.",
    highlighted: false,
    features: [
      "Unlimited everything",
      "Custom retention",
      "SSO",
      "Audit logs",
      "Dedicated support",
      "Custom integrations",
    ],
  },
];

export default function Pricing() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">

      <div className="text-center">

        <h2 className="mt-6 text-5xl font-black">
          Simple pricing.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted">
          Start for free and upgrade when your applications grow.
        </p>

      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-3">

        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass relative p-8 ${
              plan.highlighted
                ? "border-2 border-primary scale-[1.03]"
                : ""
            }`}
          >
            {plan.highlighted && (
              <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

            <h3 className="text-2xl font-bold">{plan.name}</h3>

            <p className="mt-3 text-text-muted">
              {plan.description}
            </p>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-black">
                {plan.price}
              </span>

              {plan.price !== "Custom" && (
                <span className="pb-2 text-text-muted">
                  /month
                </span>
              )}
            </div>

            <button
              className={`mt-8 w-full rounded-full py-4 font-semibold transition ${
                plan.highlighted
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "bg-glass-hover hover:bg-white"
              }`}
            >
              Get Started
            </button>

            <div className="mt-10 space-y-4">

              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3"
                >
                  <Check
                    size={18}
                    className="text-primary"
                  />

                  <span className="text-text-secondary">
                    {feature}
                  </span>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}