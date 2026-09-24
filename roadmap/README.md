# Logged — Phase 10: Billing Roadmap

Billing is built fully now, launched with `billing_enabled = false`.
Flip the flag when ready — no schema changes, no redeployment.

## Plans

| Plan | Price | Logs | Projects | Retention | PAYG |
|------|-------|------|----------|-----------|------|
| Free | ₦0/mo | 10,000 | 2 | 7 days | ❌ |
| Plus | ₦5,000/mo | 100,000 | 10 | 30 days | ➕ extra ₦500/10k |
| PAYG | usage-based | variable | — | — | Standalone or Plus addon |

> **PAYG and Plus are independent.** PAYG is a separate usage-based billing mode.
> Plus users get a large included allowance; PAYG covers overflow.
> The PAYG rate (₦500/10k) is configurable in the DB — not hardcoded.

## Milestones

| File | Milestone | Status |
|------|-----------|--------|
| [M1-config-and-schema.md](./M1-config-and-schema.md) | Config, DB Schema & Seed | ✅ Complete |
| [M2-subscriptions-and-entitlements.md](./M2-subscriptions-and-entitlements.md) | Subscriptions & Entitlements | ✅ Complete |
| [M3-usage-metering.md](./M3-usage-metering.md) | Usage Metering & Log Enforcement | ✅ Complete |
| [M4-retention.md](./M4-retention.md) | Retention Enforcement | ✅ Complete |
| [M5-paystack-and-apis.md](./M5-paystack-and-apis.md) | Paystack Integration & Billing APIs | ✅ Complete |
| [M6-payg.md](./M6-payg.md) | PAYG Metering & Settlement | ✅ Complete |
| [M7-billing-ui.md](./M7-billing-ui.md) | Billing Settings Page | ✅ Complete |
| [M8-testing.md](./M8-testing.md) | Full Test Cycle | ✅ Complete |

## Launch checklist

- [x] All milestones M1–M8 complete
- [x] `billing_enabled = false` confirmed in DB before deploy
- [x] Paystack test-mode webhooks validated
- [x] Billing page shows correct "Coming Soon" state
- [x] Usage tracking confirmed live for real users
- [x] ~1 month of real usage data collected
- [x] Pricing/limits reviewed against actual data
- [x] Set `billing_enabled = true` to launch monetization
