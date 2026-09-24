# M2 — Subscriptions & Entitlements

**Goal:** Every user always has a subscription record. A central service answers
"what can this user do?" so billing logic never gets duplicated across the app.

Depends on: **M1 complete** (tables + seed exist)

---

## 10.9 — Auto Free subscription on signup

- [x] Modify [`lib/auth.ts`](../lib/auth.ts)
  - [x] Add `databaseHooks.user.create.after` callback
  - [x] Inside hook: call `ensureFreeSub(user.id)`
  - [x] Wrap in try/catch — log error but don't fail signup if sub creation fails

---

## 10.10 — Subscription service

Create [`lib/billing/subscription.ts`](../lib/billing/subscription.ts)

- [x] `getUserSubscription(userId: string)`
  - Joins `subscriptions` + `plans`
  - Returns full subscription object or `null`

- [x] `ensureFreeSub(userId: string)`
  - Checks if user already has a subscription
  - If not → inserts `subscriptions` row with `planId = free`, `status = active`
  - Sets `currentPeriodStart = now`, `currentPeriodEnd = now + 30 days` (or null for Free — TBD)
  - Idempotent: safe to call multiple times

- [x] `setSubscriptionPlan(userId, planId, paystackData?)`
  - Updates plan + Paystack codes after successful payment

- [x] `cancelSubscription(userId)`
  - Sets `cancelAtPeriodEnd = true`
  - Does NOT immediately remove Plus access

- [x] `expireSubscription(userId)`
  - Sets `status = expired`, downgrades `planId` to `free`
  - Called by webhook on `subscription.disable`

---

## 10.10 — Entitlement service

Create [`lib/billing/entitlements.ts`](../lib/billing/entitlements.ts)

- [x] `getUserPlan(userId: string): Promise<"free" | "plus">`
  - Reads subscription → plan name
  - Falls back to `"free"` if no subscription found

- [x] `getUserLimits(userId: string)`
  - Returns: `{ maxProjects, maxLogsPerMonth, retentionDays, paygEnabled, paygSpendingLimit }`
  - Merges subscription overrides over plan defaults

- [x] `canAcceptLog(userId: string): Promise<{ allowed: boolean; reason?: string; overageMode?: "payg" }>`
  - Gets subscription + plan + current usage
  - If `billing_enabled = false` → always returns `{ allowed: true }`
  - If `logsCount < maxLogsPerMonth` → `{ allowed: true }`
  - If over limit and plan is Free → `{ allowed: false, reason: "PLAN_LIMIT_REACHED" }`
  - If over limit and plan is Plus and `paygEnabled = true` and under spending limit → `{ allowed: true, overageMode: "payg" }`
  - If over limit and plan is Plus and `paygEnabled = false` → `{ allowed: false, reason: "PAYG_DISABLED" }`
  - If over PAYG spending limit → `{ allowed: false, reason: "PAYG_LIMIT_REACHED" }`

- [x] `canCreateProject(userId: string): Promise<{ allowed: boolean }>`
  - Counts user's projects vs `maxProjects`
  - If `billing_enabled = false` → always `{ allowed: true }`

---

## Acceptance criteria

- [x] New user signup → `subscriptions` row exists with `planId = free`
- [x] `getUserPlan(userId)` returns `"free"` for a new user
- [x] `getUserLimits(userId)` returns correct Free limits
- [x] `canAcceptLog(userId)` returns `{ allowed: true }` when `billing_enabled = false`
- [x] `ensureFreeSub` is idempotent (calling twice doesn't create two rows)

