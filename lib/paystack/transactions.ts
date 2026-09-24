import { paystackPost, paystackGet } from "./client";

export interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string;
  createdAt: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    customer_code: string;
    email: string;
  };
  authorization?: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bin: string;
    bank: string;
    reusable: boolean;
  };
  plan_object?: {
    plan_code: string;
    name: string;
  };
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo / lowest unit
  planCode?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const body: Record<string, unknown> = {
    email: params.email,
    amount: params.amount,
  };

  if (params.planCode) {
    body.plan = params.planCode;
  }
  if (params.callbackUrl) {
    body.callback_url = params.callbackUrl;
  }
  if (params.metadata) {
    body.metadata = params.metadata;
  }

  const res = await paystackPost<InitializeTransactionResponse>("/transaction/initialize", body);
  return {
    authorizationUrl: res.data.authorization_url,
    accessCode: res.data.access_code,
    reference: res.data.reference,
  };
}

export async function chargeAuthorization(params: {
  authorizationCode: string;
  email: string;
  amount: number; // in kobo
  metadata?: Record<string, unknown>;
}): Promise<PaystackTransaction> {
  const body: Record<string, unknown> = {
    authorization_code: params.authorizationCode,
    email: params.email,
    amount: params.amount,
  };
  if (params.metadata) {
    body.metadata = params.metadata;
  }

  const res = await paystackPost<PaystackTransaction>("/transaction/charge_authorization", body);
  return res.data;
}

export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  const res = await paystackGet<PaystackTransaction>(`/transaction/verify/${reference}`);
  return res.data;
}
