import { paystackPost, paystackGet } from "./client";

export interface PaystackCustomer {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  customer_code: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export async function createCustomer(params: {
  email: string;
  name?: string;
}): Promise<{ customerCode: string; customer: PaystackCustomer }> {
  let firstName = "";
  let lastName = "";
  if (params.name) {
    const parts = params.name.trim().split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const res = await paystackPost<PaystackCustomer>("/customer", {
    email: params.email,
    first_name: firstName,
    last_name: lastName,
  });

  return {
    customerCode: res.data.customer_code,
    customer: res.data,
  };
}

export async function getCustomer(customerCode: string): Promise<PaystackCustomer> {
  const res = await paystackGet<PaystackCustomer>(`/customer/${customerCode}`);
  return res.data;
}
