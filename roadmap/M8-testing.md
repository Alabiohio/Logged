# M8 — Testing

**Goal:** Validate the entire billing system end-to-end in both billing OFF and billing ON
(test mode) states before launch.

Depends on: **M1–M7 all complete**

---

## Billing OFF (pre-launch state)

These must all pass before going live.

- [x] New user signup → `subscriptions` row with `planId = free` exists in DB
- [x] `GET /api/billing` → returns Free plan + usage data
- [x] `POST /api/v1/logs` → accepted, `usage.logsCount` increments
- [x] `POST /api/v1/logs` (10,001st log for a user) → still accepted (no enforcement)
- [x] `POST /api/billing/checkout` → returns `{ available: false }`
- [x] `/dashboard/settings/billing` → Free card + "Plus Coming Soon" card, no PAYG
- [x] Purge-logs cron → runs without error, uses default retention
- [x] Paystack webhook with duplicate `providerEventId` → 200, not re-processed
- [x] Paystack webhook with wrong signature → 401

---

## Billing ON — Free plan (test mode)

Switch `billing_enabled = true` in dev DB only.

- [x] Free user under limit (e.g. 500 logs) → `POST /api/v1/logs` accepted
- [x] Free user at 10,000 logs → `POST /api/v1/logs` accepted (exactly at limit)
- [x] Free user at 10,001 logs → `POST /api/v1/logs` returns 429 `PLAN_LIMIT_REACHED`
- [x] `/dashboard/settings/billing` → usage meters visible, `[Upgrade to Plus]` button visible
- [x] At 80%+ logs → warning prompt visible on billing page
- [x] `POST /api/billing/checkout` (Free user) → returns Paystack `authorizationUrl`

---

## Billing ON — Plus plan (test mode)

Use Paystack test mode + test card to upgrade.

- [x] Paystack test checkout completes → `charge.success` webhook fires
- [x] Webhook handler → subscription updated to Plus in DB
- [x] `GET /api/billing` → returns Plus plan
- [x] Plus user logs 100,000 logs → all accepted, usage meter at 100%
- [x] Plus user sends 100,001st log (PAYG enabled) → accepted, PAYG meter starts
- [x] Plus user sends 100,001st log (PAYG disabled) → 429 `PAYG_DISABLED`
- [x] Plus user hits PAYG spending limit → 429 `PAYG_LIMIT_REACHED`
- [x] `GET /api/billing/payg` → shows correct `extraLogs`, `estimatedAmount`
- [x] `PATCH /api/billing/payg` → updates spending limit, reflected immediately

---

## Renewal & Cancellation (test mode)

- [x] Paystack `subscription.not_renewed` webhook → subscription `status = past_due`
- [x] Paystack `subscription.disable` webhook → subscription downgraded to Free
- [x] `POST /api/billing/cancel` → `cancelAtPeriodEnd = true` in DB
- [x] After cancellation: user still has Plus access until `currentPeriodEnd`
- [x] After period ends (webhook `subscription.disable`): user downgraded to Free

---

## PAYG Settlement (test mode)

- [x] `settlePaygForUser(userId)` with 37,420 extra logs → `payg_usage` row created
- [x] `payg_usage.billableLogs = 37420`, `billableUnits = 3.742`, `amount = 2000`
- [x] Paystack charge authorization called → `payg_usage.status = charged` (or `failed` if no auth code)
- [x] Running `settlePaygForUser` twice in same period → second run is idempotent (no double charge)
- [x] User with 0 extra logs → `settlePaygForUser` skips without error

---

## Final pre-launch checklist

- [x] `billing_enabled` reset to `false` in production DB
- [x] Paystack keys switched from test → live when ready to charge real users
- [x] Paystack webhook URL registered in Paystack dashboard
- [x] All test scenarios above passed
- [x] Collect ~1 month of real usage data with `billing_enabled = false`
- [x] Review actual usage distributions (90th percentile, power users)
- [x] Confirm Free limit (10k), Plus limit (100k), PAYG rate (₦500/10k) match real costs
- [x] Set `billing_enabled = true` — monetization is live
