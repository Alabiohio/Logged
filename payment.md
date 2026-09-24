Absolutely. Since you want **billing fully prepared now but monetization activated later**, I’d implement this as a dedicated **Billing & Plans phase**, without making Paystack part of the initial release flow.

# Logged — Billing & Plans Implementation Plan

## Phase 10 — Billing Foundation

### Goal

Build the entire Free/Plus architecture now so that:

```text
Initial launch
    ↓
Billing OFF
    ↓
Everyone uses Free
    ↓
~1 month later
    ↓
Turn billing ON
    ↓
Plus becomes available
    ↓
Paystack handles subscriptions
```

No database redesign should be necessary when you activate billing.

---

# Stage 1 — Define the plans

Create a central plan configuration.

### Free

```text
Projects:       2
Logs/month:     10,000
Retention:      7 days
All SDK methods: YES
Browser capture: YES
Console capture: YES
Search:           YES
Metadata:         YES
```

### Plus

```text
Projects:       10
Logs/month:     100,000
Retention:      30 days
Everything Free: YES
Advanced features: YES
Priority support: YES
```

Don't scatter these numbers throughout the codebase.

Create something like:

```text
src/config/plans.ts
```

```ts
FREE
PLUS
```

with their limits.

---

# Stage 2 — Billing configuration

Create a central application configuration.

For example:

```text
billing.enabled
```

Initially:

```ts
billing.enabled = false
```

Later:

```ts
billing.enabled = true
```

I'd make this a **database-backed setting**, not just an environment variable.

Why?

Because eventually you may want to turn billing on/off without redeploying.

Example:

```text
settings

key
value
updatedAt
```

Then:

```text
billing_enabled → false
```

Later:

```text
billing_enabled → true
```

Also consider:

```text
maintenance_mode
signups_enabled
billing_enabled
```

as general platform settings.

---

# Stage 3 — Plans database

Create:

```text
plans
```

Fields:

```text
id
name
displayName
description

price
currency
interval

paystackPlanCode

limits
createdAt
updatedAt
```

Example:

```text
free
plus
```

The important part is that **Free and Plus are database entities**, rather than hardcoded assumptions.

---

# Stage 4 — Seed the plans

Your database should contain:

```text
Free
Plus
```

even while billing is disabled.

Example:

```text
FREE
price: 0
paystackPlanCode: null

PLUS
price: TBD
paystackPlanCode: null initially
```

Once you create the real Paystack plan, populate:

```text
paystackPlanCode
```

---

# Stage 5 — User subscription system

Create:

```text
subscriptions
```

Something like:

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

Statuses:

```text
active
past_due
cancelled
expired
```

You can add more later if needed.

---

# Stage 6 — Default Free subscription

This is important.

When a user signs up:

```text
User created
      ↓
Free subscription created
```

So every user always has a subscription record.

Example:

```text
User
 ↓
Subscription
 ↓
Free
```

You don't want your application constantly asking:

> "Does this user have a plan?"

Instead:

> "What plan is this user's subscription currently on?"

---

# Stage 7 — Entitlement/plan service

Create one central service responsible for determining what a user can access.

Something like:

```text
src/lib/billing/
├── plans.ts
├── subscription.ts
├── entitlements.ts
└── usage.ts
```

Then your application can do:

```ts
const plan = await getUserPlan(userId);
```

or:

```ts
const limits = await getUserLimits(userId);
```

And:

```ts
await requireEntitlement(userId, "advanced_search");
```

This prevents billing logic from being duplicated throughout the application.

---

# Stage 8 — Usage tracking

Create:

```text
usage
```

I'd track logs monthly.

For example:

```text
id
userId
periodStart
periodEnd
logsCount
createdAt
updatedAt
```

Potentially also:

```text
projectsCount
```

but project count can simply be calculated from the projects table.

The important one is:

```text
logsCount
```

because that's where usage can become expensive.

---

# Stage 9 — Log-limit enforcement

Your existing:

```text
POST /api/v1/logs
```

already receives logs.

Add:

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
Get current usage
 ↓
Check limit
 ↓
Accept/reject
```

For Free:

```text
8,500 / 10,000
```

→ accept.

At:

```text
10,000 / 10,000
```

→ reject additional logs.

But **don't immediately implement aggressive blocking during your initial launch**.

Since billing is disabled, the enforcement layer should effectively say:

```ts
if (!billingEnabled) {
  // don't enforce paid-plan limits
}
```

This lets you test the infrastructure without hurting early users.

---

# Stage 10 — Retention system

Your logs already have timestamps.

Eventually you'll need cleanup based on:

```text
Free → 7 days
Plus → 30 days
```

Create a cleanup process that determines:

```text
user → plan → retentionDays
```

Then deletes/archives logs older than the allowed retention period.

But while billing is disabled, you can keep the current retention behavior.

---

# Stage 11 — Billing API

Prepare these routes:

```text
/api/billing
/api/billing/checkout
/api/billing/subscription
/api/billing/cancel
/api/billing/portal
```

Initially:

```text
billing.enabled = false
```

so `/checkout` can simply return something like:

```text
Billing is not currently available.
```

The route exists before monetization launches.

---

# Stage 12 — Paystack integration

Don't activate it yet.

Create the integration layer:

```text
src/lib/paystack/
├── client.ts
├── transactions.ts
├── subscriptions.ts
└── customers.ts
```

Environment variables:

```env
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

Use **test keys first**.

---

# Stage 13 — Checkout

When billing is eventually enabled:

```text
Settings
   ↓
Billing
   ↓
Upgrade to Plus
   ↓
POST /api/billing/checkout
   ↓
Paystack
   ↓
Checkout
```

Your backend initializes the Paystack transaction/subscription.

The frontend never receives your secret key.

---

# Stage 14 — Paystack webhook

Create:

```text
POST /api/webhooks/paystack
```

This is the most important Paystack component.

Flow:

```text
Paystack
   ↓
Webhook
   ↓
Verify signature
   ↓
Identify user
   ↓
Process event
   ↓
Update subscription
```

Handle at minimum:

```text
successful payment
subscription created
subscription renewed
subscription disabled/cancelled
failed payment
```

And make webhook processing **idempotent**.

---

# Stage 15 — Payment event records

I'd also create:

```text
billing_events
```

Something like:

```text
id
userId
eventType
paystackEventId
payload
processedAt
createdAt
```

Why?

If Paystack sends the same webhook twice:

```text
event: abc123
```

you can check:

```text
Have we already processed abc123?
```

If yes → ignore it.

This will save you headaches later.

---

# Stage 16 — Billing page

Create:

```text
/settings/billing
```

When billing is **OFF**:

```text
Your plan
──────────────
Free

You're currently using Logged for free.

Plus
──────────────
Coming soon

Higher limits
Longer retention
More projects
```

No Paystack checkout yet.

When billing becomes **ON**:

```text
Free
₦0

[ Current plan ]


Plus
₦X/month

100,000 logs
10 projects
30-day retention

[ Upgrade to Plus ]
```

---

# Stage 17 — Usage display

On the billing page:

```text
Usage

Logs
8,421 / 10,000

Projects
2 / 2

Retention
7 days
```

For Plus:

```text
Logs
42,821 / 100,000

Projects
5 / 10

Retention
30 days
```

This makes the limits understandable rather than surprising.

---

# Stage 18 — Upgrade prompts

When billing is disabled:

```text
billing.enabled === false
```

don't show aggressive upgrade prompts.

When enabled, you can show:

```text
You're using 9,500 / 10,000 logs.

[ Upgrade to Plus ]
```

at a threshold such as 80–90%.

---

# Stage 19 — Cancellation

Build the architecture now but activate later.

Flow:

```text
Plus
 ↓
Cancel subscription
 ↓
cancelAtPeriodEnd = true
 ↓
Continue using Plus
 ↓
Billing period ends
 ↓
Downgrade to Free
```

Don't immediately delete their Plus access when they click cancel.

---

# Stage 20 — Billing feature flag

This is the key part of your initial release.

I'd make the system behave approximately like:

```ts
if (!billing.enabled) {
  return {
    plan: "free",
    enforceLimits: false,
    allowUpgrade: false,
  };
}
```

Once you launch:

```ts
billing.enabled = true;
```

then:

```text
Free → limits enforced
Plus → limits enforced
Paystack → active
Upgrade → active
Cancellation → active
```

No schema migration.

---

# Stage 21 — Testing

Before initial release, test:

### Billing OFF

```text
✓ New user gets Free
✓ Free subscription created
✓ Can create projects
✓ Can send logs
✓ Usage is recorded
✓ No Paystack checkout
✓ No subscription payment
✓ Dashboard works
```

### Billing ON in development

```text
✓ Free user sees upgrade
✓ Paystack checkout works
✓ Successful payment → Plus
✓ Plus limits applied
✓ Usage displayed
✓ Renewal handled
✓ Failed payment handled
✓ Cancellation handled
✓ Subscription expires → Free
✓ Duplicate webhook doesn't duplicate records
```

---

# Final architecture

I'd aim for:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Subscription   │
                  └────────┬────────┘
                           │
                           ▼
                    ┌────────────┐
                    │    Plan    │
                    │ Free / Plus│
                    └─────┬──────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Projects       Logs       Retention
             │            │            │
             └────────────┼────────────┘
                          ▼
                       Usage


                    ┌──────────────┐
                    │   Paystack   │
                    └──────┬───────┘
                           │
                       Webhooks
                           │
                           ▼
                  ┌─────────────────┐
                  │ billing_events  │
                  └─────────────────┘
```

With the master switch sitting above the whole billing layer:

```text
                 billing.enabled
                       │
             ┌─────────┴─────────┐
             │                   │
           FALSE                TRUE
             │                   │
       Free for now        Free + Plus
       No enforcement      Enforce limits
       No checkout         Paystack active
```

## Implementation order

I would actually build it in this exact order:

**10.1** Plan configuration
**10.2** Billing settings/feature flag
**10.3** `plans` table
**10.4** `subscriptions` table
**10.5** Default Free subscription on signup
**10.6** Entitlement service
**10.7** Usage table
**10.8** Log usage tracking
**10.9** Limit enforcement layer
**10.10** Retention architecture
**10.11** Billing page
**10.12** Paystack client
**10.13** Checkout API
**10.14** Paystack webhook
**10.15** Billing events/idempotency
**10.16** Cancellation/renewal handling
**10.17** Full test-mode billing
**10.18** Keep `billing.enabled = false` for launch

Then, when you're ready a month later, the actual launch becomes mostly **configuration + testing**, rather than a rushed billing implementation.
