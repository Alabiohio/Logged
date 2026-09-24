# M4 — Retention Enforcement

**Goal:** Purge logs older than the user's plan retention window.
Free = 7 days. Plus = 30 days. Soft while billing is off.

Depends on: **M2** (entitlements — to get per-user retention days)

---

## 10.13 — Update purge-logs cron

- [x] Read existing [`app/api/cron/purge-logs/`](../app/api/cron/purge-logs/) route
  - [x] Understand current deletion query and retention value

- [x] Modify cron route to do per-user retention:
  - [x] For each user, call `getUserLimits(userId)` → get `retentionDays`
  - [x] Delete logs where `createdAt < now() - retentionDays` for that user's projects
  - [x] Alternatively (more efficient): group users by plan, run bulk delete per plan group

- [x] Add billing-OFF guard:
  ```ts
  const billingEnabled = await getBillingEnabled();
  // If billing is off, use a generous global retention (e.g. 90 days) 
  // so early users aren't penalized
  const defaultRetention = billingEnabled ? null : 90;
  ```

- [x] Log stats: how many logs were purged, for how many users

---

## Acceptance criteria

- [x] Cron runs without error after M1 schema changes
- [x] While `billing_enabled = false`: logs kept for 90 days (or existing behavior)
- [x] While `billing_enabled = true`: Free users' logs older than 7 days are deleted
- [x] While `billing_enabled = true`: Plus users' logs older than 30 days are deleted
- [x] Cron is idempotent — running twice doesn't double-delete
