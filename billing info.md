## Billing workflow

The dedicated billing-details page is required before subscription checkout, wallet deposits, and enabling PAYG.

1. A user starts a payment-related action.
2. The server checks their saved profile and redirects them to the billing-details page if it is incomplete.
3. The form is prefilled with their account name and email where possible.
4. After saving, the pending checkout, deposit, or PAYG-enable action resumes.
5. The server enforces the same check on payment endpoints. Existing subscriptions remain active; scheduled PAYG settlement skips charging until billing details are complete.

Payment cards are entered only on Paystack-hosted checkout pages.

## Information collected

**Required**
- Billing contact's full name
- Billing email address
- Country
- Billing address line 1
- City

**Optional or conditional**
- State, province, or region, when applicable
- Phone number
- Address line 2
- Company or organization name
- Tax/VAT identification number, if billing as a business
- Postal code, when applicable for the selected country

Users can select individual or business billing. Company and tax fields are optional and shown for business billing.

The billing email, contact name, and optional phone number are used when creating a payment-provider customer or starting checkout. The address and optional business/tax details are stored in Neon for billing records. Payment card details are not collected or stored by the app.

## Neon storage

Profiles are stored in the user-linked `billing_profiles` table in Neon. The schema migration is in `drizzle/0006_billing_profiles.sql`; it has been validated on a temporary Neon branch and needs approval before it is applied to the production branch.
