const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export class PaystackError extends Error {
  public status: boolean;
  public rawMessage: string;

  constructor(message: string) {
    super(message);
    this.name = "PaystackError";
    this.status = false;
    this.rawMessage = message;
  }
}

export async function paystackFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new PaystackError("PAYSTACK_SECRET_KEY is not set");
  }

  const url = `${PAYSTACK_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = (await res.json()) as PaystackResponse<T>;

    if (!res.ok || json.status === false) {
      throw new PaystackError(json.message || `Paystack request failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    if (error instanceof PaystackError) {
      throw error;
    }
    throw new PaystackError(error instanceof Error ? error.message : String(error));
  }
}

export async function paystackGet<T = unknown>(path: string): Promise<PaystackResponse<T>> {
  return paystackFetch<T>(path, { method: "GET" });
}

export async function paystackPost<T = unknown>(path: string, body?: unknown): Promise<PaystackResponse<T>> {
  return paystackFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}
