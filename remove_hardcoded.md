# Billing Configuration Tasks

Implement in dependency order. Keep payment-provider credentials in deployment secrets; do not expose or store them through the admin API. Test schema changes on a temporary Neon branch and get approval before applying them to production.

## 1. Add dynamic plan configuration schema

- [x] Inspect current Neon/Drizzle `plans` and `settings` schemas.
- [x] Add missing plan lifecycle, ordering, and PAYG eligibility fields. Existing Paystack plan-code configuration already exists.
- [x] Generate and test the migration on a temporary Neon branch; apply it to production after approval.

**Done when:** the schema supports configurable plans and provider settings without requiring secrets in Neon.

## 2. Centralize and validate billing configuration

**Depends on:** Task 1.

- [x] Replace runtime hard-coded plan and PAYG fallback values with a validated Neon-backed configuration resolver.
- [x] Handle missing or invalid required billing configuration by raising an explicit configuration error; do not silently charge using source-code defaults.
- [x] Keep secret credentials in deployment environment variables.

**Done when:** runtime billing configuration comes from validated database values or returns an explicit unavailable/error state.

## 3. Build admin plan and payment controls

**Depends on:** Tasks 1 and 2.

- [x] Add plan administration at `/oheologgedadmin`: create, edit, activate/deactivate, and order plans.
- [x] Configure plan name, description, price, currency, interval, included logs, project limit, retention, and PAYG eligibility.
- [x] Configure the billing switch, implemented provider, provider plan codes, PAYG unit size/rate, minimum deposit, and eligible plans.
- [x] Expose neither deployment secrets nor unimplemented providers as selectable options.
- [x] Validate settings before allowing billing to be enabled.

**Done when:** admins can safely maintain supported billing configuration, and the API rejects invalid or unsupported settings. The existing Plus Paystack code remains readable from its legacy setting until its plan row is edited, so the admin controls do not misreport or block the current configuration.

## 4. Render customer billing offers from Neon

**Depends on:** Tasks 2 and 3.

- [x] Render active plans, prices, limits, currency, intervals, and PAYG rates from database configuration.
- [x] Remove hard-coded plan pricing and limits from customer billing views.
- [x] Show an explicit unavailable state when configuration is missing or invalid.

**Done when:** customer-facing billing information reflects the current Neon configuration without fabricated fallback values.

## 5. Generalize checkout and subscription webhooks

**Depends on:** Tasks 2 and 3.

- [x] Allow checkout for eligible active plan IDs and validate plan price/provider plan code on the server.
- [x] Use plan IDs in payment metadata.
- [x] Update Paystack webhook and verification handling to resolve configured plans instead of assuming Plus.
- [x] Calculate billing periods from the configured/provider interval rather than a fixed 30-day period.
- [x] Preserve existing subscriptions and provider-managed renewals during the transition.

**Done when:** checkout, verification, and webhooks support configured plans and maintain existing subscription behavior.

## 6. Remove hard-coded payment thresholds

**Depends on:** Tasks 2 and 3.

- [x] Replace hard-coded minimum wallet deposit, PAYG charge threshold, PAYG unit size/rate, plan limits, and billing interval assumptions with validated configuration.
- [x] Ensure only implemented and ready payment providers can be selected.
- [x] Do not silently fall back to Paystack when the selected provider is unsupported.

**Done when:** payment calculations and eligibility use validated configuration, and unsupported providers fail explicitly.

## 7. Seed and verify rollout

**Depends on:** Tasks 4, 5, and 6.

- [x] Confirm Free and Plus exist as initial Neon plan configuration without treating seed values as permanent runtime behavior.
- [ ] Test admin editing, customer plan display, checkout, webhook handling, renewal periods, and missing-configuration behavior.
- [ ] Verify existing subscriptions and provider-managed renewals remain compatible.
- [x] Test migrations on a temporary Neon branch; request explicit approval before applying any production migration.

**Done when:** the configured billing workflow passes verification end-to-end and production schema changes have only been applied with approval.
