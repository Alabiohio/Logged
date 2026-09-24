import { paystackPost, paystackGet } from "./client";

export interface PaystackSubscription {
  id: number;
  subscription_code: string;
  email_token: string;
  status: string;
  next_payment_date: string;
  customer: {
    customer_code: string;
    email: string;
  };
  plan: {
    plan_code: string;
    name: string;
  };
}

export async function createSubscription(params: {
  customerCode: string;
  planCode: string;
  startDate?: string;
}): Promise<PaystackSubscription> {
  const body: Record<string, unknown> = {
    customer: params.customerCode,
    plan: params.planCode,
  };
  if (params.startDate) {
    body.start_date = params.startDate;
  }

  const res = await paystackPost<PaystackSubscription>("/subscription", body);
  return res.data;
}

export async function cancelSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<boolean> {
  const res = await paystackPost<{ message: string }>("/subscription/disable", {
    code: subscriptionCode,
    token: emailToken,
  });
  return res.status;
}

export async function getSubscription(subscriptionCode: string): Promise<PaystackSubscription> {
  const res = await paystackGet<PaystackSubscription>(`/subscription/${subscriptionCode}`);
  return res.data;
}
