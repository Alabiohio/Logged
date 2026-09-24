# M6 — PAYG Metering & Settlement

**Goal:** Track usage beyond included allowance, calculate billable amounts,
give users a spending limit, and charge at period end via saved Paystack authorization.

> **PAYG is independent of Plus.** It's a separate billing mode. A user on a plan with
> included logs can overflow into PAYG. The PAYG rate and behavior are configurable in the DB.

Depends on: **M3** (usage metering) + **M5** (Paystack transactions)

---

## 10.19 — PAYG calculation service

Extend [`lib/billing/usage.ts`](../lib/billing/usage.ts):

- [x] `getPaygAccrual(userId: string)`
  - Gets current `usage.logsCount`
  - Gets user's `includedLogs` limit from their plan
  - Gets PAYG rate from DB settings (`payg_logs_per_unit`, `payg_price_per_unit`)
  - Calculates:
    ```ts
    const extraLogs = Math.max(0, logsCount - includedLogs);
    const billableUnits = extraLogs / logsPerUnit;          // fractional e.g. 3.742
    const estimatedAmount = Math.ceil(billableUnits) * pricePerUnit;
    ```
  - Returns `{ extraLogs, billableUnits, estimatedAmount, currency: "NGN" }`

- [x] `isOverPaygSpendingLimit(userId: string): Promise<boolean>`
  - Gets `subscription.paygSpendingLimit`
  - Gets `getPaygAccrual(userId).estimatedAmount`
  - Returns `true` if `estimatedAmount >= paygSpendingLimit`

---

## 10.20 — PAYG control API

- [x] Create `app/api/billing/payg/route.ts`
  - [x] `GET` — returns current PAYG accrual + settings
    ```json
    {
      "enabled": true,
      "spendingLimit": 5000,
      "extraLogs": 37420,
      "billableUnits": 3.742,
      "estimatedAmount": 2000,
      "currency": "NGN",
      "rate": { "logsPerUnit": 10000, "pricePerUnit": 500 }
    }
    ```
  - [x] `PATCH` — update PAYG settings
    - Body: `{ paygEnabled?: boolean, paygSpendingLimit?: number | null }`
    - Validates: spending limit must be positive integer or null
    - Updates `subscriptions` row

---

## 10.21 — PAYG settlement (end-of-period charge)

- [x] Create `lib/billing/payg-settlement.ts`
  - [x] `settlePaygForUser(userId: string)`
    - Gets current period PAYG accrual
    - If `extraLogs = 0` → skip
    - Calculates final `amount`
    - Creates `payg_usage` row with `status = pending`
    - Calls `chargeAuthorization({ authorizationCode, email, amount })` from Paystack
    - On success: updates `payg_usage.status = charged`, stores `paystackRef`
    - On failure: updates `payg_usage.status = failed`, logs error

  - [x] `settleAllPaygUsers()`
    - Gets all Plus users where `currentPeriodEnd <= now()` and `logsCount > includedLogs`
    - Calls `settlePaygForUser` for each

- [x] Create or update cron route for PAYG settlement
  - [x] Add `app/api/cron/payg-settle/route.ts`
  - [x] Trigger monthly (at period end) — protected by cron secret
  - [x] Calls `settleAllPaygUsers()`

> **Note:** Verify Paystack's current API for charging saved authorizations before implementing
> the settlement charge call. Do not assume the API shape from training data.

---

## Acceptance criteria

- [x] `getPaygAccrual(userId)` returns correct `extraLogs` and `estimatedAmount`
- [x] `GET /api/billing/payg` returns correct accrual for current period
- [x] `PATCH /api/billing/payg` updates `paygEnabled` in DB
- [x] `PATCH /api/billing/payg` updates `paygSpendingLimit` in DB
- [x] Spending limit of ₦5,000 blocks logs once `estimatedAmount >= 5000`
- [x] `payg_usage` row created on settlement with correct `includedLogs`, `actualLogs`, `billableLogs`, `amount`
- [x] Failed settlement → `payg_usage.status = failed`, not `charged`
- [x] `settleAllPaygUsers` is idempotent — running twice doesn't double-charge

