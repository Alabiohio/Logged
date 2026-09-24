# M1 — Config, DB Schema & Seed

**Goal:** Define plan limits in one place, add all billing tables to the schema, and seed initial data.
No billing logic runs yet — just infrastructure.

---

## 10.1 — Billing config file

- [x] Create `lib/billing/config.ts`
  - [x] Export `BILLING_DEFAULTS` constant with hardcoded fallbacks
    ```ts
    free:  { projects: 2,  logsPerMonth: 10_000,  retentionDays: 7  }
    plus:  { projects: 10, logsPerMonth: 100_000, retentionDays: 30 }
    payg:  { logsPerUnit: 10_000, pricePerUnit: 500 }
    ```
  - [x] Export `getBillingEnabled(): Promise<boolean>` — reads `settings` table key `billing_enabled`
  - [x] Export `getBillingConfig()` — merges DB values over hardcoded defaults (so DB values win)

---

## 10.2 — Master billing switch (DB-backed)

- [x] Add `settings` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id          text PK
  key         text UNIQUE NOT NULL
  value       text NOT NULL
  updatedAt   timestamp NOT NULL
  ```
- [x] Planned keys:
  - `billing_enabled`      → `"false"`
  - `signups_enabled`      → `"true"`
  - `maintenance_mode`     → `"false"`
  - `payg_logs_per_unit`   → `"10000"`
  - `payg_price_per_unit`  → `"500"`

---

## 10.3 — `plans` table

- [x] Add `plans` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id                text PK
  name              text UNIQUE NOT NULL     -- "free" | "plus"
  displayName       text NOT NULL            -- "Free" | "Plus"
  description       text
  price             integer NOT NULL         -- in kobo / lowest unit (0 for Free)
  currency          text NOT NULL DEFAULT 'NGN'
  interval          text                     -- "monthly" | null
  includedLogs      integer NOT NULL
  projectLimit      integer NOT NULL
  retentionDays     integer NOT NULL
  paystackPlanCode  text                     -- null until Paystack plan is created
  createdAt         timestamp NOT NULL
  updatedAt         timestamp NOT NULL
  ```

---

## 10.4 — `subscriptions` table

- [x] Add `subscriptions` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id                        text PK
  userId                    text NOT NULL FK → users.id
  planId                    text NOT NULL FK → plans.id
  status                    text NOT NULL    -- active | past_due | cancelled | expired
  paystackCustomerCode      text
  paystackSubscriptionCode  text
  paystackPlanCode          text
  currentPeriodStart        timestamp
  currentPeriodEnd          timestamp
  cancelAtPeriodEnd         boolean NOT NULL DEFAULT false
  paygEnabled               boolean NOT NULL DEFAULT true
  paygSpendingLimit         integer          -- monthly cap in ₦, null = unlimited
  createdAt                 timestamp NOT NULL
  updatedAt                 timestamp NOT NULL
  ```
- [x] Add unique index on `userId` (one active subscription per user)

---

## 10.5 — `usage` table

- [x] Add `usage` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id           text PK
  userId       text NOT NULL FK → users.id
  periodStart  timestamp NOT NULL
  periodEnd    timestamp NOT NULL
  logsCount    integer NOT NULL DEFAULT 0
  createdAt    timestamp NOT NULL
  updatedAt    timestamp NOT NULL
  ```
- [x] Add unique index on `(userId, periodStart)`

---

## 10.6 — `payg_usage` table

- [x] Add `payg_usage` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id               text PK
  userId           text NOT NULL FK → users.id
  subscriptionId   text NOT NULL FK → subscriptions.id
  periodStart      timestamp NOT NULL
  periodEnd        timestamp NOT NULL
  includedLogs     integer NOT NULL
  actualLogs       integer NOT NULL
  billableLogs     integer NOT NULL
  billableUnits    numeric(10,4) NOT NULL   -- fractional units e.g. 3.742
  amount           integer NOT NULL          -- calculated ₦ amount
  currency         text NOT NULL DEFAULT 'NGN'
  status           text NOT NULL             -- pending | charged | waived
  paystackRef      text                      -- reference after charge
  createdAt        timestamp NOT NULL
  updatedAt        timestamp NOT NULL
  ```

---

## 10.7 — `billing_events` table

- [x] Add `billing_events` table to [`db/schema.ts`](../db/schema.ts)
  ```
  id               text PK
  userId           text FK → users.id
  eventType        text NOT NULL    -- e.g. "charge.success"
  provider         text NOT NULL    -- "paystack"
  providerEventId  text NOT NULL UNIQUE   -- idempotency key
  payload          text             -- raw JSON
  processedAt      timestamp
  createdAt        timestamp NOT NULL
  ```
- [x] Add index on `providerEventId` for fast duplicate checks

---

## 10.8 — Generate migration & seed

- [x] Run `npx drizzle-kit generate` — review generated SQL
- [x] Run `npx drizzle-kit migrate` — apply to DB
- [x] Create `db/seed-billing.ts`
  - [x] Insert Free plan: `price=0`, `includedLogs=10000`, `projectLimit=2`, `retentionDays=7`, `paystackPlanCode=null`
  - [x] Insert Plus plan: `price=500000` (₦5,000 in kobo), `includedLogs=100000`, `projectLimit=10`, `retentionDays=30`, `paystackPlanCode=null`
  - [x] Insert settings: `billing_enabled=false`, `payg_logs_per_unit=10000`, `payg_price_per_unit=500`
- [x] Run seed: `npx tsx db/seed-billing.ts`
- [x] Verify rows exist in DB

---

## Acceptance criteria

- [x] `drizzle-kit generate` produces clean SQL (no unintended drops)
- [x] `drizzle-kit migrate` runs without error
- [x] DB contains `plans` rows: `free` and `plus`
- [x] DB contains `settings` row: `billing_enabled = false`
- [x] `getBillingEnabled()` returns `false`
- [x] `getBillingConfig()` returns correct Free/Plus limits

