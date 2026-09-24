# M7 — Billing Settings Page

**Goal:** Build `/dashboard/settings/billing` with correct states for
billing OFF (coming soon) and billing ON (full pricing + usage meters + PAYG controls).

Depends on: **M2** (entitlements) + **M3** (usage) + **M5** (`GET /api/billing`) + **M6** (`GET /api/billing/payg`)

---

## 10.14 — Billing page route

- [x] Create `app/dashboard/settings/billing/page.tsx`
- [x] Page fetches `GET /api/billing` and `GET /api/billing/payg` on load
- [x] Shows loading skeleton while fetching

---

## Billing OFF state (`billing_enabled = false`)

- [x] Free plan card (current plan badge)
  - Current plan indicator
  - Limits: 2 projects, 10,000 logs/month, 7-day retention
  - Friendly message: "You're currently using Logged for free."

- [x] Plus card (coming soon)
  - Price: ₦5,000/month
  - Feature list: 100k logs, 10 projects, 30-day retention, advanced features, priority support
  - "Coming Soon" badge — no checkout button

- [x] No PAYG section visible while billing is off

---

## Billing ON state — Free user

- [x] Free plan card (active)
  - Usage meters:
    - Logs: `8,421 / 10,000` with progress bar (warning color at ≥80%)
    - Projects: `2 / 2` with progress bar
    - Retention: `7 days`
  - Upgrade prompt when logs ≥ 80% of limit:
    > "You're using 8,421 / 10,000 logs. Upgrade to Plus for more."
  - Full usage: `10,000 / 10,000` → alert banner:
    > "You've reached your Free plan limit. New logs are being rejected."

- [x] Plus card (upgrade CTA)
  - Price: ₦5,000/month
  - Feature list
  - `[Upgrade to Plus]` button → calls `POST /api/billing/checkout` → redirects to Paystack

---

## Billing ON state — Plus user (within included logs)

- [x] Plus plan card (active)
  - Usage meters:
    - Logs: `42,821 / 100,000` with progress bar
    - Projects: `5 / 10`
    - Retention: `30 days`
  - At ≥80k logs → info banner:
    > "You're approaching your included log volume. Additional logs will enter PAYG billing."

- [x] PAYG section
  - Enabled toggle
  - Spending limit input (₦, optional)
  - Current rate: ₦500 / 10,000 additional logs
  - Estimated bill this period: ₦0 (within included allowance)

- [x] Subscription actions
  - `[Manage subscription]` link (future: Paystack portal)
  - `[Cancel subscription]` button → confirm dialog → calls `POST /api/billing/cancel`

---

## Billing ON state — Plus user (in PAYG overflow)

- [x] Usage meter shows overflow:
  - Logs: `137,420 / 100,000` — bar at 100% + overage count
- [x] PAYG accrual card:
  ```
  PAYG Usage This Month
  ─────────────────────
  Extra logs:   37,420
  Billable:     3.742 units
  Est. charge:  ₦2,000

  Spending limit: ₦5,000
  [Change limit]
  ```
- [x] Warning at 80% of spending limit
- [x] Alert when spending limit reached:
  > "PAYG spending limit reached. Additional logs are currently blocked."
  > `[Raise limit]`

---

## Settings page tab link

- [x] Modify [`app/dashboard/settings/page.tsx`](../app/dashboard/settings/page.tsx)
  - [x] Add **Billing** tab to sidebar/tab list
  - [x] Tab links to `/dashboard/settings/billing`
  - [x] Add billing icon (e.g. `CreditCard` from lucide-react)

---

## Acceptance criteria

- [x] `/dashboard/settings/billing` loads without error
- [x] With `billing_enabled = false`: shows Free card + Plus "Coming Soon" card, no PAYG section
- [x] With `billing_enabled = true` and Free user: shows usage meters + [Upgrade to Plus] button
- [x] With `billing_enabled = true` and Plus user: shows usage meters + PAYG section + cancel button
- [x] Progress bars turn warning color at 80% usage
- [x] PAYG accrual updates reflect correct `extraLogs` and `estimatedAmount`
- [x] Changing PAYG spending limit via UI calls `PATCH /api/billing/payg` and reflects new value
- [x] Cancel button shows confirm dialog before calling cancel API
