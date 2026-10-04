import { db } from "@/lib/db";
import { billingProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const BILLING_PROFILE_PATH = "/dashboard/settings/billing/details";

export type BillingProfileInput = {
  billingType: "individual" | "business";
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  taxId: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  postalCode: string | null;
  country: string;
};

export async function getBillingProfile(userId: string) {
  const rows = await db
    .select()
    .from(billingProfiles)
    .where(eq(billingProfiles.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export function isBillingProfileComplete(
  profile: {
    fullName?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    country?: string | null;
  } | null | undefined
): boolean {
  return Boolean(
    profile?.fullName?.trim() &&
      profile.email?.trim() &&
      profile.addressLine1?.trim() &&
      profile.city?.trim() &&
      profile.country?.trim()
  );
}

export function billingProfileUrl(returnTo: string): string {
  return `${BILLING_PROFILE_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}
