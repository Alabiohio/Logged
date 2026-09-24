import crypto from "crypto";
import {
  PaymentProvider,
  CustomerParams,
  CheckoutParams,
  ChargeAuthorizationParams,
  ParsedWebhookEvent,
} from "./types";
import { createCustomer as paystackCreateCustomer } from "@/lib/paystack/customers";
import {
  initializeTransaction as paystackInitializeTransaction,
  chargeAuthorization as paystackChargeAuthorization,
} from "@/lib/paystack/transactions";
import { cancelSubscription as paystackCancelSubscription } from "@/lib/paystack/subscriptions";

export class PaystackPaymentProvider implements PaymentProvider {
  public readonly name = "paystack";

  async createCustomer(params: CustomerParams): Promise<{ customerCode: string }> {
    const res = await paystackCreateCustomer(params);
    return { customerCode: res.customerCode };
  }

  async initializeCheckout(params: CheckoutParams): Promise<{
    authorizationUrl: string;
    reference: string;
  }> {
    const res = await paystackInitializeTransaction({
      email: params.email,
      amount: params.amount,
      planCode: params.planCode,
      callbackUrl: params.callbackUrl,
      metadata: params.metadata,
    });
    return {
      authorizationUrl: res.authorizationUrl,
      reference: res.reference,
    };
  }

  async chargeAuthorization(params: ChargeAuthorizationParams): Promise<{
    reference: string;
  }> {
    const res = await paystackChargeAuthorization({
      authorizationCode: params.authorizationCode,
      email: params.email,
      amount: params.amount,
      metadata: params.metadata,
    });
    return { reference: res.reference };
  }

  async cancelSubscription(subscriptionCode: string, token: string = ""): Promise<boolean> {
    return paystackCancelSubscription(subscriptionCode, token);
  }

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret || !signature) {
      return false;
    }
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    return hash === signature;
  }

  parseWebhookEvent(rawBody: string): ParsedWebhookEvent {
    const payload = JSON.parse(rawBody);
    const eventType = (payload.event as string) || "unknown";
    const data = payload.data || {};

    const providerEventId =
      data.id?.toString() ||
      data.reference ||
      `${eventType}_${data.customer?.customer_code || ""}_${data.createdAt || Date.now()}`;

    return {
      eventType,
      providerEventId,
      userId: data.metadata?.userId,
      customerCode: data.customer?.customer_code,
      subscriptionCode: data.subscription_code,
      planCode: data.plan?.plan_code || data.plan_object?.plan_code,
      metadata: data.metadata,
      raw: payload,
    };
  }
}
