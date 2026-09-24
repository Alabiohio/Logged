# M5 — Paystack Integration & Billing APIs

**Goal:** Build the full Paystack client layer and all billing API routes.
Everything exists but checkout returns "not available" while `billing_enabled = false`.

Depends on: **M2** (subscriptions) + **M3** (usage)

---

## 10.15 — Paystack client

- [x] Add env vars to `.env.local`:
  ```
  PAYSTACK_SECRET_KEY=sk_test_...
  PAYSTACK_PUBLIC_KEY=pk_test_...
  PAYSTACK_WEBHOOK_SECRET=...
  ```

- [x] Create `lib/paystack/client.ts`
  - [x] Base fetch wrapper with `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`
  - [x] Helper: `paystackGet(path)`, `paystackPost(path, body)`
  - [x] Handle Paystack error response shape `{ status: false, message: "..." }`

- [x] Create `lib/paystack/customers.ts`
  - [x] `createCustomer({ email, name })` → returns `customerCode`
  - [x] `getCustomer(customerCode)`

- [x] Create `lib/paystack/subscriptions.ts`
  - [x] `createSubscription({ customerCode, planCode, startDate? })`
  - [x] `cancelSubscription(subscriptionCode, token)`
  - [x] `getSubscription(subscriptionCode)`

- [x] Create `lib/paystack/transactions.ts`
  - [x] `initializeTransaction({ email, amount, planCode?, metadata? })` → returns `authorizationUrl`
  - [x] `chargeAuthorization({ authorizationCode, email, amount, metadata? })` → for PAYG settlement
  - [x] `verifyTransaction(reference)`

---

## 10.16 — Billing info API

- [x] Create `app/api/billing/route.ts`
  - [x] `GET` — requires auth session
  - [x] Returns:
    ```json
    {
      "plan": "free",
      "subscription": { "status": "active", "currentPeriodEnd": "..." },
      "usage": { "logsCount": 421, "maxLogs": 10000, "periodStart": "...", "periodEnd": "..." },
      "limits": { "maxProjects": 2, "retentionDays": 7 },
      "payg": { "enabled": false, "spendingLimit": null, "accrual": null }
    }
    ```

---

## 10.16 — Plus checkout API

- [x] Create `app/api/billing/checkout/route.ts`
  - [x] `POST` — requires auth session
  - [x] If `billing_enabled = false` → return `{ available: false, message: "Billing is not currently available." }`
  - [x] If already Plus → return `{ message: "Already on Plus plan." }`
  - [x] Create Paystack customer if not exists, store `paystackCustomerCode`
  - [x] Initialize Paystack transaction with Plus plan code
  - [x] Return `{ authorizationUrl }` — frontend redirects to Paystack hosted page

---

## 10.16 — Subscription status API

- [x] Create `app/api/billing/subscription/route.ts`
  - [x] `GET` — returns `{ plan, status, currentPeriodEnd, cancelAtPeriodEnd }`

---

## 10.16 — Cancel subscription API

- [x] Create `app/api/billing/cancel/route.ts`
  - [x] `POST` — requires auth + active Plus subscription
  - [x] Calls Paystack `cancelSubscription`
  - [x] Sets `cancelAtPeriodEnd = true` in DB
  - [x] Returns confirmation — user keeps Plus until period ends

---

## 10.17 — Paystack webhook

- [x] Create `app/api/webhooks/paystack/route.ts`
  - [x] `POST` — no auth session required (called by Paystack)
  - [x] Verify HMAC-SHA512 signature:
    ```ts
    const hash = crypto.createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody).digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) return 401;
    ```
  - [x] Check `billing_events` for duplicate `providerEventId` → if exists, return 200 immediately
  - [x] Insert `billing_events` row (mark as processing)
  - [x] Handle events:

    | Event | Action |
    |-------|--------|
    | `charge.success` | Verify transaction → activate Plus → update subscription |
    | `subscription.create` | Store `paystackSubscriptionCode`, update period dates |
    | `subscription.not_renewed` | Flag `past_due` |
    | `subscription.disable` | Call `expireSubscription(userId)` → downgrade to Free |
    | `invoice.payment_failed` | Set status `past_due`, notify user (email) |

  - [x] Mark `billing_events.processedAt = now()` on success
  - [x] Always return 200 to Paystack (even on our internal errors — re-process manually)

---

## Acceptance criteria

- [x] `GET /api/billing` returns correct plan + usage for authenticated user
- [x] `POST /api/billing/checkout` with `billing_enabled = false` → `{ available: false }`
- [x] `POST /api/billing/checkout` with `billing_enabled = true` → Paystack URL returned
- [x] Webhook with valid signature → processed
- [x] Webhook with invalid signature → 401
- [x] Webhook duplicate `providerEventId` → 200, not re-processed
- [x] `charge.success` webhook → user subscription updated to Plus
- [x] `subscription.disable` webhook → user downgraded to Free

