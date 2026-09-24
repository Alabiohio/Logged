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
 * Get configured payment provider by name or from settings/env fallback (defaults to 'paystack').
 */
export async function getPaymentProvider(name?: string): Promise<PaymentProvider> {
  let providerName = name?.toLowerCase();

  if (!providerName) {
    try {
      const dbRow = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "payment_provider"))
        .limit(1);

      if (dbRow.length > 0 && dbRow[0].value) {
        providerName = dbRow[0].value.toLowerCase();
      }
    } catch {
      // Fallback silently if DB query fails
    }
  }

  if (!providerName) {
    providerName = (process.env.PAYMENT_PROVIDER || "paystack").toLowerCase();
  }

  const provider = providersRegistry.get(providerName);
  if (!provider) {
    console.warn(`Payment provider '${providerName}' not found in registry. Falling back to Paystack.`);
    return defaultPaystack;
  }

  return provider;
}

export * from "./types";
export * from "./paystack";
