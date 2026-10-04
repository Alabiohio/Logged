import { Check } from "lucide-react";

interface PricingPlan {
  id: string;
  displayName: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string | null;
  includedLogs: number;
  projectLimit: number;
  retentionDays: number;
  paygEnabled: boolean;
}

function formatPrice(amount: number, currency: string): string | null {
  try {
    const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });
    const divisor = 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2);
    return formatter.format(amount / divisor);
  } catch {
    return null;
  }
}

export default function Pricing({ plans }: { plans: PricingPlan[] }) {
  if (plans.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20 text-center text-text-muted lg:py-32">
        Pricing offers are currently unavailable.
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">

      <div className="text-center">

        <h2 className="mt-6 text-3xl font-black sm:text-4xl lg:text-5xl">
          Simple pricing.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base text-text-muted sm:text-lg">
          Start for free and upgrade when your applications grow.
        </p>

      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-20 lg:grid-cols-3">

        {plans.map((plan) => {
          const price = formatPrice(plan.price, plan.currency);
          return (
          <div
            key={plan.id}
            className="glass relative p-7 sm:p-8"
          >
            <h3 className="text-2xl font-bold">{plan.displayName}</h3>

            {plan.description && <p className="mt-3 text-text-muted">{plan.description}</p>}

            <div className="mt-8 flex items-end gap-2">
              <span className="text-4xl font-black sm:text-5xl">
                {price ?? "Price unavailable"}
              </span>

              {plan.interval && (
                <span className="pb-2 text-text-muted">
                  /{plan.interval}
                </span>
              )}
            </div>

            <a
              href="/dashboard/settings/billing"
              className="mt-8 block w-full rounded-full bg-primary py-4 text-center font-semibold text-white transition hover:bg-primary-hover"
            >
              Get Started
            </a>

            <div className="mt-10 space-y-4">
              {[
                `${plan.includedLogs.toLocaleString()} included logs / month`,
                `${plan.projectLimit.toLocaleString()} projects`,
                `${plan.retentionDays.toLocaleString()}-day retention`,
                ...(plan.paygEnabled ? ["PAYG eligible"] : []),
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3"
                >
                  <Check
                    size={18}
                    className="shrink-0 text-primary"
                  />

                  <span className="text-text-secondary">
                    {feature}
                  </span>

                </div>
              ))}
            </div>
          </div>
          );
        })}

      </div>

    </section>
  );
}