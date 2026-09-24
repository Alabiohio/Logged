Yep. I'd structure Logged's monetization as **Free + Plus + PAYG**, but keep **billing completely disabled for the initial launch**.

The key is that PAYG should be an extension of Plus, not a replacement for it.

# Logged Billing Implementation Plan

## 1. Final pricing model

### Free — ₦0/month

For individuals and small projects.

| Feature              |         Free |
| -------------------- | -----------: |
| Projects             |            2 |
| Logs                 | 10,000/month |
| Retention            |       7 days |
| Full SDK             |            ✅ |
| `logger.log()`       |            ✅ |
| `logger.info()`      |            ✅ |
| `logger.success()`   |            ✅ |
| `logger.warn()`      |            ✅ |
| `logger.error()`     |            ✅ |
| `logger.debug()`     |            ✅ |
| `logger.capture()`   |            ✅ |
| Browser auto capture |            ✅ |
| Console interception |            ✅ |
| Search & filtering   |            ✅ |
| Metadata             |            ✅ |
| Dashboard            |            ✅ |

---

## 2. Plus — ₦5,000/month

For developers and small teams using Logged regularly.

| Feature              |          Plus |
| -------------------- | ------------: |
| Projects             |            10 |
| Included logs        | 100,000/month |
| Retention            |       30 days |
| Full SDK             |             ✅ |
| Browser auto capture |             ✅ |
| Console interception |             ✅ |
| Search & filtering   |             ✅ |
| Metadata             |             ✅ |
| Advanced features    |             ✅ |
| Priority support     |             ✅ |

The important part is:

> **₦5,000 includes 100,000 logs every month.**

---

# 3. PAYG — additional usage

Here's where I'd be careful.

Don't make PAYG available to Free users initially.

Instead:

```text
Free
 ↓
10k included
 ↓
Limit reached
 ↓
Upgrade to Plus


Plus
 ↓
100k included
 ↓
100k reached
 ↓
PAYG additional usage
```

So a Plus customer doesn't suddenly have their logging system stop working because they had a busy month.

---

# 4. Proposed PAYG pricing

I'd initially design the system around:

### ₦500 per additional 10,000 logs

That's:

```text
10k logs = ₦500
```

So:

| Usage | Monthly cost |
| ----: | -----------: |
|  100k |       ₦5,000 |
|  110k |       ₦5,500 |
|  150k |       ₦7,500 |
|  200k |      ₦10,000 |
|  500k |      ₦25,000 |
|    1M |      ₦50,000 |

However, **I would not automatically charge the customer's Paystack card every time they cross another 10k**.

That's messy and can create lots of tiny transactions.

Instead, track the PAYG balance and charge/settle it according to a billing cycle.

---

# 5. Better PAYG architecture

Think of the monthly subscription as:

```text
PLUS
₦5,000/month
        │
        └── 100,000 logs included
```

Then:

```text
100,000
     ↓
Additional usage
     ↓
PAYG meter
```

Example:

```text
September

Included:
100,000 logs

Actual:
137,420 logs

Extra:
37,420
```

You calculate the additional usage at the end of the billing period.

---

# 6. But there's a problem with small PAYG charges

Suppose someone only exceeds their allowance by:

```text
2,000 logs
```

Charging them another ₦500 isn't ideal.

So internally I'd use **usage units**, rather than directly storing "₦500".

For example:

```text
1 usage unit = 10,000 logs
```

Then:

```text
37,420 extra logs
≈ 3.742 usage units
```

Your billing engine calculates the actual amount.

This gives you flexibility to change pricing later.

---

# 7. Database architecture

I'd use these tables.

### `plans`

```text
id
name
displayName
price
currency
interval
includedLogs
projectLimit
retentionDays
paystackPlanCode
createdAt
updatedAt
```

Plans:

```text
free
plus
```

---

### `subscriptions`

```text
id
userId
planId
status

paystackCustomerCode
paystackSubscriptionCode
paystackPlanCode

currentPeriodStart
currentPeriodEnd

cancelAtPeriodEnd

createdAt
updatedAt
```

---

### `usage`

```text
id
userId

periodStart
periodEnd

logsCount
createdAt
updatedAt
```

This tracks:

```text
September 1 → September 30
logsCount = 137420
```

---

### `usage_events`

I'd add this if you want detailed accounting:

```text
id
userId
projectId
type
quantity
metadata
createdAt
```

Example:

```text
type: "log_ingested"
quantity: 1
```

You don't necessarily need to keep millions of individual usage events forever, though. Your ingestion system can increment the monthly aggregate.

---

# 8. PAYG usage table

For Plus users who exceed their allowance:

```text
payg_usage

id
userId
subscriptionId

periodStart
periodEnd

includedLogs
actualLogs
billableLogs

amount
currency

status
createdAt
updatedAt
```

Example:

```text
includedLogs: 100000
actualLogs: 137420
billableLogs: 37420
amount: 2000
```

The exact pricing formula can remain configurable.

---

# 9. Central billing configuration

Don't hard-code:

```ts
500
```

everywhere.

Create something like:

```text
src/config/billing.ts
```

Conceptually:

```ts
export const billingConfig = {
  enabled: false,

  free: {
    projects: 2,
    logsPerMonth: 10_000,
    retentionDays: 7,
  },

  plus: {
    price: 5_000,
    logsPerMonth: 100_000,
    projects: 10,
    retentionDays: 30,
  },

  payg: {
    enabled: true,
    logsPerUnit: 10_000,
    pricePerUnit: 500,
  },
};
```

But I'd ultimately store the commercially important values in the database so you can change them without redeploying.

---

# 10. Master billing switch

This remains the most important part of your initial release.

```text
billing_enabled = false
```

### Initial launch

```text
billing_enabled = false
```

System behaves:

```text
Everyone → Free
```

But:

```text
✓ Plans exist
✓ Subscriptions exist
✓ Usage is tracked
✓ PAYG infrastructure exists
✓ Paystack integration exists
✓ Billing APIs exist
✓ Billing UI exists
```

You simply don't expose payment.

---

# 11. When you launch monetization

Change:

```text
billing_enabled
```

from:

```text
false
```

to:

```text
true
```

Now:

```text
Free users
    ↓
10k logs
    ↓
Upgrade to Plus
```

and:

```text
Plus users
    ↓
100k logs
    ↓
Additional usage
    ↓
PAYG
```

---

# 12. Log ingestion flow

Your existing endpoint:

```text
POST /api/v1/logs
```

becomes:

```text
API key
   ↓
Find project
   ↓
Find project owner
   ↓
Get subscription
   ↓
Get plan
   ↓
Record usage
   ↓
Check allowance
   ↓
┌───────────────────┐
│ Within allowance? │
└─────────┬─────────┘
          │
     YES  │  NO
      ↓   │   ↓
    Store │ PAYG?
          │
      ┌───┴────┐
      │        │
     YES       NO
      ↓        ↓
   Store      Reject
   + meter
```

For the initial launch, because:

```text
billing_enabled = false
```

you can continue accepting logs while **still measuring usage**.

That's extremely useful.

---

# 13. Don't block users immediately when they reach Free limits

During your first month:

```text
Free user
10k logs
   ↓
10,001
   ↓
Still accept
   ↓
Track usage
```

You can later inspect real usage.

Maybe you'll discover:

```text
90% of users < 2k
95% of users < 10k
```

Great.

Or you discover:

```text
Most users = 30k
```

Then you might decide the Free limit should be 25k.

**Real usage data should inform that decision.**

---

# 14. Billing page

Create:

```text
/settings/billing
```

### Billing OFF

```text
Your plan
────────────────────

FREE

2 projects
10,000 logs/month
7-day retention

Billing is coming soon.


PLUS
────────────────────

₦5,000/month

100,000 logs
10 projects
30-day retention
Advanced features

Coming soon
```

No checkout button yet.

---

### Billing ON

Free:

```text
FREE

8,421 / 10,000 logs
2 / 2 projects

[ Upgrade to Plus ]
```

Plus:

```text
PLUS

42,821 / 100,000 logs

₦5,000/month

[ Manage subscription ]
[ Cancel subscription ]
```

---

# 15. PAYG warning

Don't surprise users with PAYG.

When Plus reaches, say:

```text
80,000 / 100,000
```

show:

> You're approaching your monthly included log volume.

At:

```text
100,000
```

show:

> You've reached your included usage. Additional logs will be billed at the PAYG rate.

And show:

```text
PAYG
₦500 / 10,000 additional logs
```

---

# 16. Give users a PAYG control

In Billing Settings:

```text
Additional usage
────────────────────────

PAYG
✓ Enabled

₦500 / 10,000 logs

[ Disable PAYG ]
```

If disabled:

```text
You've reached your included usage.

Additional logs are currently blocked.
```

This gives users control over unexpected bills.

---

# 17. Set a monthly PAYG spending limit

I'd strongly recommend this.

For example:

```text
PAYG spending limit

₦5,000
```

So if someone has:

```text
Plus          ₦5,000
PAYG maximum  ₦5,000
```

their maximum monthly bill is:

```text
₦10,000
```

Once they hit the PAYG limit:

```text
Additional logs blocked
```

or you can ask them to increase the limit.

This is much safer than unlimited PAYG.

---

# 18. Paystack architecture

When billing launches:

```text
User
 ↓
Upgrade
 ↓
/api/billing/checkout
 ↓
Paystack
 ↓
Checkout
 ↓
Payment
 ↓
Paystack webhook
 ↓
/api/webhooks/paystack
 ↓
Verify signature
 ↓
Update subscription
 ↓
Plus activated
```

For recurring Plus payments, Paystack's subscription system can handle recurring charges.

---

# 19. PAYG billing

For PAYG, I'd keep it separate from the recurring Plus subscription.

Conceptually:

```text
Paystack

Subscription
└── Plus ₦5,000/month

Additional usage
└── PAYG charges
```

At the end of the billing period:

```text
100k included
+
37,420 extra
=
PAYG charge
```

Your billing service calculates the amount and charges the customer's saved authorization.

**We should verify Paystack's current rules/API for charging saved authorizations when we implement this part**, rather than designing around an assumed API.

---

# 20. Billing events

Create:

```text
billing_events
```

Fields:

```text
id
userId
eventType
provider
providerEventId
payload
processedAt
createdAt
```

This gives you an audit trail.

Example:

```text
subscription.created
charge.success
invoice.created
subscription.not_renewed
subscription.disabled
payg.charge
```

---

# 21. Final architecture

```text
                         LOGGED
                           │
                    billing_enabled
                           │
              ┌────────────┴────────────┐
              │                         │
            FALSE                      TRUE
              │                         │
        Billing hidden            Billing active
              │                         │
              ▼                         ▼
            FREE                ┌─────────────────┐
                                │     PLANS       │
                                │                 │
                                │ Free / Plus     │
                                └────────┬────────┘
                                         │
                               ┌─────────┴─────────┐
                               │                   │
                              FREE                PLUS
                               │                   │
                            10k logs            100k logs
                               │                   │
                               │              ┌────┴────┐
                               │              │         │
                               │            <100k    >100k
                               │              │         │
                               │             ✓        PAYG
                               │                        │
                               │                  Usage billing
                               │
                               ▼
                            USAGE
                               │
                               ▼
                          PostgreSQL
                               │
                               ▼
                       Billing Analytics
```

## Implementation sequence

So I'd make the actual development roadmap:

**10.1** Define Free / Plus / PAYG rules
**10.2** Create billing master switch
**10.3** Create `plans` table
**10.4** Create `subscriptions` table
**10.5** Create `usage` table
**10.6** Create `payg_usage` table
**10.7** Create `billing_events` table
**10.8** Seed Free + Plus
**10.9** Give every new user a Free subscription
**10.10** Build central entitlement service
**10.11** Build usage metering
**10.12** Integrate usage into `/api/v1/logs`
**10.13** Build retention enforcement
**10.14** Build billing settings page
**10.15** Add Paystack integration using test keys
**10.16** Build Plus checkout
**10.17** Build Paystack webhook
**10.18** Build subscription renewal/cancellation
**10.19** Build PAYG calculation
**10.20** Build PAYG spending limits
**10.21** Build additional-usage billing
**10.22** Test Free → Plus → PAYG → renewal → cancellation
**10.23** Set `billing_enabled = false`
**10.24** Launch Logged
**10.25** Collect real usage data for ~1 month
**10.26** Review limits/pricing
**10.27** Set `billing_enabled = true` when ready

**One adjustment I'd make to our earlier proposal:** keep the **PAYG rate configurable**, rather than permanently committing the code to ₦500/10k. That's a starting assumption, not something we should lock into the architecture before we know Logged's actual infrastructure cost and real-world log volumes.
