import { PaymentProvider } from "./types";
import { PaystackPaymentProvider } from "./paystack";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const providersRegistry = new Map<string, PaymentProvider>();

// Register default built-in providers
const defaultPaystack = new PaystackPaymentProvider();
providersRegistry.set(defaultPaystack.name, defaultPaystack);

/**
 * Register a custom or new payment provider implementation at runtime.
 */
export function registerPaymentProvider(provider: PaymentProvider): void {
  providersRegistry.set(provider.name.toLowerCase(), provider);
}

/**
 * Get the explicitly requested provider or the provider configured in Neon.
 */
export async function getPaymentProvider(name?: string): Promise<PaymentProvider> {
  let providerName = name?.toLowerCase();

  if (!providerName) {
    const [configuredProvider] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "payment_provider"))
      .limit(1);
    providerName = configuredProvider?.value.trim().toLowerCase();
  }

  if (!providerName) {
    throw new Error("No payment provider is configured in billing settings.");
  }
  const provider = providersRegistry.get(providerName);
  if (!provider) {
    throw new Error(`Configured payment provider "${providerName}" is not implemented.`);
  }

  return provider;
}

export * from "./types";
export * from "./paystack";
