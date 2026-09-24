# M3 — Usage Metering & Log Enforcement

**Goal:** Track log counts per user per month. Enforce plan limits in the log ingest API
(gated by `billing_enabled` — soft while off, hard when on).

Depends on: **M1** (schema) + **M2** (entitlements)

---

## 10.11 — Usage metering service

Create [`lib/billing/usage.ts`](../lib/billing/usage.ts)

- [x] `getCurrentPeriod(): { periodStart: Date; periodEnd: Date }`
  - Returns the 1st and last day of the current calendar month
  - Used to scope all usage queries

- [x] `getCurrentUsage(userId: string)`
  - Finds or creates the `usage` row for `(userId, periodStart)`
  - Returns `{ logsCount, periodStart, periodEnd }`

- [x] `incrementUsage(userId: string, count: number = 1)`
  - Atomic upsert: `logsCount += count`
  - Use `INSERT ... ON CONFLICT (userId, periodStart) DO UPDATE SET logsCount = logsCount + count`
  - Must be non-blocking — if it fails, log the error but don't fail the log ingest

- [x] `getPaygAccrual(userId: string)`
  - Gets current usage + plan limits
  - Calculates: `extraLogs = max(0, logsCount - includedLogs)`
  - Calculates: `billableUnits = extraLogs / logsPerUnit`
  - Calculates: `amount = ceil(billableUnits) * pricePerUnit` (or fractional — TBD)
  - Returns `{ extraLogs, billableUnits, estimatedAmount, currency }`

---

## 10.12 — Integrate usage into log ingest

- [x] Modify [`lib/logs/ingest.ts`](../lib/logs/ingest.ts)
  - [x] After successful `db.insert(logs)`, call `incrementUsage(userId, 1)`
  - [x] For batch: call `incrementUsage(userId, acceptedCount)` once
  - [x] Wrap in `void` — usage failure must not break log ingest

- [x] Modify [`app/api/v1/logs/route.ts`](../app/api/v1/logs/route.ts)
  - [x] After API key auth resolves `project`, get `project.userId`
  - [x] Call `canAcceptLog(userId)` from entitlements service
  - [x] If `!allowed`:
    - `reason = PLAN_LIMIT_REACHED` → 429 with message "Free plan limit reached. Upgrade your plan."
    - `reason = PAYG_DISABLED` → 429 with message "Log limit reached. Enable PAYG to continue."
    - `reason = PAYG_LIMIT_REACHED` → 429 with message "Monthly PAYG spending limit reached."
  - [x] If `allowed` + `overageMode = "payg"` → proceed (PAYG meter auto-increments via `incrementUsage`)
  - [x] All enforcement skipped when `billing_enabled = false`

---

## Acceptance criteria

- [x] `POST /api/v1/logs` with valid key → `usage.logsCount` increments by 1
- [x] Batch of 10 logs → `usage.logsCount` increments by 10
- [x] `getCurrentUsage()` creates usage row if none exists for current month
- [x] `incrementUsage` is idempotent on concurrent calls (no race condition)
- [x] When `billing_enabled = false`: log accepted even when `logsCount > maxLogsPerMonth`
- [x] When `billing_enabled = true` and Free user at 10,001 logs: 429 returned
- [x] When `billing_enabled = true` and Plus user at 100,001 logs with PAYG on: accepted
- [x] When `billing_enabled = true` and Plus user hits PAYG spending limit: 429 returned

