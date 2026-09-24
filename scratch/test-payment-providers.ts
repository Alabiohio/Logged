import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import type {
  PaymentProvider,
  CustomerParams,
  CheckoutParams,
  ChargeAuthorizationParams,
  ParsedWebhookEvent,
} from "../lib/billing/providers/types";

// 1. Define a Mock Provider to prove seamless extensibility
class MockStripePaymentProvider implements PaymentProvider {
  public readonly name = "stripe";

  async createCustomer(params: CustomerParams): Promise<{ customerCode: string }> {
    return { customerCode: `cus_stripe_${uuidv4().slice(0, 8)}` };
  }

  async initializeCheckout(params: CheckoutParams): Promise<{
    authorizationUrl: string;
    reference: string;
  }> {
    const ref = `cs_stripe_${uuidv4().slice(0, 8)}`;
    return {
      authorizationUrl: `https://checkout.stripe.com/pay/${ref}`,
      reference: ref,
    };
  }

  async chargeAuthorization(params: ChargeAuthorizationParams): Promise<{ reference: string }> {
    return { reference: `ch_stripe_${uuidv4().slice(0, 8)}` };
  }

  async cancelSubscription(subscriptionCode: string): Promise<boolean> {
    return true;
  }

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    return signature === "mock_stripe_signature";
  }

  parseWebhookEvent(rawBody: string): ParsedWebhookEvent {
    const payload = JSON.parse(rawBody);
    return {
      eventType: payload.type || "checkout.session.completed",
      providerEventId: payload.id || `evt_${uuidv4()}`,
      userId: payload.data?.object?.metadata?.userId,
      customerCode: payload.data?.object?.customer,
      subscriptionCode: payload.data?.object?.subscription,
      raw: payload,
    };
  }
}

async function testPaymentProviders() {
  console.log("🧪 Testing Payment Provider Strategy Pattern Abstraction...");

  const { getPaymentProvider, registerPaymentProvider } = await import("../lib/billing/providers");

  // 1. Default Provider resolution
  console.log("  1. Testing default provider resolution...");
  const defaultProvider = await getPaymentProvider();
  console.log(`     ✓ Resolved default provider: '${defaultProvider.name}'`);
  if (defaultProvider.name !== "paystack") {
    throw new Error(`Expected default provider 'paystack', got '${defaultProvider.name}'`);
  }

  // 2. Registering and switching to a new Provider (e.g. Stripe)
  console.log("  2. Registering and retrieving custom Stripe provider...");
  const stripeProvider = new MockStripePaymentProvider();
  registerPaymentProvider(stripeProvider);

  const resolvedStripe = await getPaymentProvider("stripe");
  console.log(`     ✓ Resolved registered provider by name: '${resolvedStripe.name}'`);
  if (resolvedStripe.name !== "stripe") {
    throw new Error(`Expected provider 'stripe', got '${resolvedStripe.name}'`);
  }

  // 3. Testing polymorphic checkout initialization
  console.log("  3. Testing polymorphic customer creation & checkout...");
  const customer = await resolvedStripe.createCustomer({ email: "test@example.com", name: "Test User" });
  console.log("     ✓ Stripe Customer created:", customer.customerCode);
  if (!customer.customerCode.startsWith("cus_stripe_")) {
    throw new Error(`Invalid Stripe customer code: ${customer.customerCode}`);
  }

  const checkout = await resolvedStripe.initializeCheckout({
    email: "test@example.com",
    amount: 500000,
    metadata: { userId: "user-123" },
  });
  console.log("     ✓ Stripe Checkout initialized:", checkout);
  if (!checkout.authorizationUrl.includes("checkout.stripe.com")) {
    throw new Error(`Invalid Stripe authorization URL: ${checkout.authorizationUrl}`);
  }

  // 4. Testing polymorphic webhook parsing & verification
  console.log("  4. Testing polymorphic webhook signature & parsing...");
  const mockWebhookPayload = JSON.stringify({
    id: "evt_stripe_test_123",
    type: "checkout.session.completed",
    data: { object: { customer: customer.customerCode, metadata: { userId: "user-123" } } },
  });

  const isValid = resolvedStripe.verifyWebhookSignature(mockWebhookPayload, "mock_stripe_signature");
  if (!isValid) {
    throw new Error("Stripe webhook signature verification failed!");
  }

  const parsed = resolvedStripe.parseWebhookEvent(mockWebhookPayload);
  console.log("     ✓ Webhook parsed via Stripe provider:", parsed);
  if (parsed.eventType !== "checkout.session.completed" || parsed.userId !== "user-123") {
    throw new Error(`Parsed event mismatch: ${JSON.stringify(parsed)}`);
  }

  console.log("🎉 Decoupled Payment Provider Strategy Pattern tests passed 100%!");
}

testPaymentProviders().catch((err) => {
  console.error("❌ Payment provider test failed:", err);
  process.exit(1);
});
