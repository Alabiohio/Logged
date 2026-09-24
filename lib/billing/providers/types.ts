export interface CustomerParams {
  email: string;
  name?: string;
}

export interface CheckoutParams {
  email: string;
  amount: number; // in kobo / lowest currency unit
  planCode?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ChargeAuthorizationParams {
  authorizationCode: string;
  email: string;
  amount: number; // in kobo / lowest currency unit
  metadata?: Record<string, unknown>;
}

export interface ParsedWebhookEvent {
  eventType: string;
  providerEventId: string;
  userId?: string;
  customerCode?: string;
  subscriptionCode?: string;
  planCode?: string;
  metadata?: Record<string, unknown>;
  raw: unknown;
}

export interface PaymentProvider {
  name: string; // e.g. "paystack", "stripe", "flutterwave"

  createCustomer(params: CustomerParams): Promise<{ customerCode: string }>;

  initializeCheckout(params: CheckoutParams): Promise<{
    authorizationUrl: string;
    reference: string;
  }>;

  chargeAuthorization(params: ChargeAuthorizationParams): Promise<{
    reference: string;
  }>;

  cancelSubscription(subscriptionCode: string, token?: string): Promise<boolean>;

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;

  parseWebhookEvent(rawBody: string): ParsedWebhookEvent;
}
