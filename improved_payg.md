let it also work for free users

u know what, in the admin /oheologged let it be possible to switch it btw plsu and free

# Improved PAYG Plan

## 1. Goal

Replace end-of-month PAYG charging with a prepaid Logged wallet.

Users must deposit funds into Logged before PAYG can be enabled. Each newly chargeable PAYG unit is deducted from the wallet immediately while logs are being ingested. PAYG can be available to Plus users only or to both Free and Plus users, controlled by an admin setting.

## 2. Charging Model

A PAYG unit is 10,000 logs above the plan allowance.

The default rate is:

```text
10,000 additional logs = NGN 500
```

The current billing calculation uses `ceil`, so the first log above the included allowance creates one chargeable unit.

Example for a Plus account with 100,000 included logs:

```text
100,000 logs: included
100,001 logs: charge NGN 500 immediately
110,001 logs: charge another NGN 500
120,001 logs: charge another NGN 500
```

Each PAYG unit must be charged only once.

## 3. Wallet Data Model

Add a wallet account for each user:

```text
wallet_accounts
- id
- user_id, unique
- balance
- currency
- status
- created_at
- updated_at
```

Add an immutable wallet transaction ledger:

```text
wallet_transactions
- id
- wallet_id
- user_id
- type: deposit | payg_debit | refund | adjustment
- amount
- balance_before
- balance_after
- currency
- status: pending | completed | failed
- provider
- provider_reference
- idempotency_key, unique
- metadata
- created_at
```

The ledger is the source of truth for balance changes. The wallet balance is a cached value for fast reads and must only be changed together with a ledger transaction.

## 4. Deposit Flow

Add a wallet deposit endpoint:

```text
POST /api/billing/wallet/deposit
```

Flow:

1. User selects a deposit amount.
2. The server validates the amount and creates a pending wallet deposit.
3. The server initializes a Paystack checkout without a subscription plan code.
4. Checkout metadata includes:

```text
type: wallet_deposit
userId: <user id>
walletTransactionId: <transaction id>
```

5. The user completes payment on Paystack.
6. The Paystack webhook verifies the signature.
7. The webhook checks the provider reference and idempotency key.
8. The wallet balance is credited exactly once.
9. The transaction is marked `completed`.

The current payment verification flow assumes every successful payment is a Plus subscription. It must branch by payment purpose:

```text
subscription_payment -> upgrade Plus
wallet_deposit       -> credit wallet
```

## 5. PAYG Activation

PAYG can be enabled only when:

- The user's plan is allowed by the admin PAYG availability setting.
- The wallet is active.
- The wallet balance is at least one PAYG unit.
- One PAYG unit is currently NGN 500.

The admin setting supports two modes:

```text
plus       -> PAYG is available to Plus users only
free_plus  -> PAYG is available to Free and Plus users
```

The default mode is `plus` so enabling billing does not unexpectedly enable PAYG for Free users. When `free_plus` is selected, Free users can use prepaid PAYG after their included monthly allowance is exhausted, without upgrading to Plus.

If the balance is insufficient, the UI should show:

```text
Deposit at least NGN 500 to enable PAYG.
```

The API must enforce this independently of the UI.

## 6. Immediate PAYG Deduction

For every single-log or batch request:

1. Read the current monthly usage.
2. Calculate the current number of chargeable PAYG units.
3. Calculate the projected number of units after accepting the request.
4. Calculate the number of newly chargeable units.
5. Calculate the required wallet debit.
6. Lock the wallet row.
7. Verify that the wallet can cover the debit.
8. Deduct the amount.
9. Record a wallet transaction for every new PAYG unit.
10. Insert the logs and update usage.
11. Commit the complete database transaction.

Example:

```text
Current usage: 109,500 logs
New batch: 1,000 logs
Projected usage: 110,500 logs

Current PAYG units: 1
Projected PAYG units: 2
New PAYG units: 1
Immediate debit: NGN 500
```

If the wallet cannot cover the new unit, reject the request and do not store any logs from that request.

## 7. Atomicity and Concurrency

Wallet deduction and log ingestion must be handled in one database transaction.

The transaction must:

- Lock the wallet row or use an atomic balance update.
- Prevent two concurrent requests from spending the same balance.
- Insert usage and logs only after the debit succeeds.
- Roll back the debit if log insertion fails.
- Roll back log insertion if the debit fails.

The debit condition should be equivalent to:

```sql
UPDATE wallet_accounts
SET balance = balance - :amount
WHERE id = :walletId
  AND balance >= :amount
```

The operation must verify that one row was updated before continuing.

## 8. Idempotency

Every PAYG debit needs a deterministic idempotency key:

```text
payg:{userId}:{periodStart}:{unitNumber}
```

This prevents duplicate charges when:

- A request is retried.
- A client times out after the server succeeds.
- Multiple requests cross the same unit boundary.
- A worker is restarted.

Deposit webhook processing must also use a unique provider reference and idempotency key.

## 9. Usage and Billing Helpers

Add helpers for:

```text
getWallet(userId)
getWalletBalance(userId)
calculateChargeableUnits(logsCount, includedLogs, logsPerUnit)
calculateNewPaygUnits(currentLogs, projectedLogs, includedLogs, logsPerUnit)
debitWalletForPaygUnit(...)
creditWalletDeposit(...)
```

The charge calculation should use configured values from billing settings:

```text
logsPerUnit: 10,000
pricePerUnit: NGN 500
```

Do not duplicate these values across the API, UI, and settlement logic.

## 10. Existing PAYG Settlement

Remove automatic card charging from the monthly PAYG settlement flow.

The existing `payg_usage` table may remain for reporting and usage history, but it should no longer be responsible for collecting payment.

The monthly cron can be removed or repurposed for:

- Reporting.
- Usage summaries.
- Reconciliation.
- Failed transaction checks.

There should be no end-of-month charge against the user's saved card for PAYG usage.

## 11. Billing UI

Add a wallet section to the billing page showing:

```text
Wallet balance: NGN 1,000
PAYG units charged this period: 1
Current PAYG charge: NGN 500
Available balance: NGN 500
```

The UI should provide:

- Deposit funds button.
- Deposit amount input.
- Wallet transaction history.
- PAYG enable/disable control.
- Current PAYG unit rate.
- Current period PAYG units charged.
- Current wallet balance.
- Insufficient-balance warning.

The PAYG toggle must be disabled when:

- The user's plan is not included in the admin PAYG availability setting.
- The wallet balance is below one PAYG unit.
- The wallet is suspended or unavailable.

The admin billing controls must include a selector for `Plus only` or `Free and Plus`.

## 12. API Changes

Add:

```text
GET  /api/billing/wallet
POST /api/billing/wallet/deposit
GET  /api/billing/wallet/transactions
```

Update:

```text
PATCH /api/billing/payg
POST  /api/v1/logs
GET   /api/admin/billing
PATCH /api/admin/billing
```

The admin billing API exposes and updates `paygAllowedPlans` using the values `plus` and `free_plus`.

The PAYG settings endpoint must reject activation when the user does not have enough wallet balance.

The log ingestion endpoint must return a distinct error when the wallet is insufficient:

```text
PAYG_WALLET_INSUFFICIENT
```

## 13. Migration and Rollout

- [x] Add wallet tables and indexes to the application schema.
- [x] Add wallet transaction idempotency fields and ledger types.
- [x] Add initial wallet helper functions for crediting deposits and debiting PAYG units.
- [x] Add the wallet deposit checkout endpoint.
- [x] Update the Paystack webhook to recognize and credit wallet deposits.
- [x] Generate and apply the production database migration.
- [x] Add admin-controlled Free/Plus PAYG availability.
- [x] Add wallet balance and transaction read APIs.
- [x] Refactor single and batch ingestion into atomic transactions.
- [x] Add immediate PAYG deductions to log ingestion.
- [x] Remove monthly PAYG charging from the active cron schedule; retain historical reporting code for later reconciliation work.
- [ ] Complete wallet and PAYG UI, including transaction history and live deduction details.
- [ ] Add monitoring for failed deposits and wallet debits.

## 14. Required Tests

### Wallet deposits

- Successful deposit credits the wallet.
- Duplicate webhook does not credit twice.
- Failed payment does not credit the wallet.
- Provider references are unique.

### PAYG activation

- Free users cannot enable PAYG when the admin mode is `plus`.
- Free users can enable PAYG when the admin mode is `free_plus` and their wallet is funded.
- Plus users with less than NGN 500 cannot enable PAYG.
- Plus users with enough balance can enable PAYG.
- Disabling PAYG works without deleting wallet funds.

### Immediate deductions

- The first chargeable unit is deducted immediately.
- Each unit is deducted once.
- A request that does not cross a unit boundary creates no debit.
- A request that crosses multiple boundaries creates multiple debits.
- Insufficient wallet balance rejects the request.
- Failed log insertion rolls back the debit.

### Batches and concurrency

- A batch cannot bypass wallet limits.
- Concurrent requests cannot spend the same wallet balance.
- Retried requests do not create duplicate unit charges.
- Single and batch requests use the same calculation rules.

### Reporting

- Wallet transactions show the correct balance before and after each debit.
- PAYG usage history matches the wallet ledger.
- No monthly card charge is created for PAYG.
