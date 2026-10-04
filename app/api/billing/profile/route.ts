import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { billingProfiles } from "@/db/schema";
import { getBillingProfile, isBillingProfileComplete } from "@/lib/billing/profile";

const fieldLimits = {
  fullName: 120,
  email: 254,
  phone: 32,
  companyName: 160,
  taxId: 64,
  addressLine1: 200,
  addressLine2: 200,
  city: 100,
  region: 100,
  postalCode: 20,
  country: 100,
} as const;

function readText(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getBillingProfile(session.user.id);
    const values = {
      billingType: profile?.billingType === "business" ? "business" as const : "individual" as const,
      fullName: profile?.fullName ?? session.user.name ?? "",
      email: profile?.email ?? session.user.email ?? "",
      phone: profile?.phone ?? "",
      companyName: profile?.companyName ?? "",
      taxId: profile?.taxId ?? "",
      addressLine1: profile?.addressLine1 ?? "",
      addressLine2: profile?.addressLine2 ?? "",
      city: profile?.city ?? "",
      region: profile?.region ?? "",
      postalCode: profile?.postalCode ?? "",
      country: profile?.country ?? "",
    };

    return NextResponse.json({
      profile: values,
      complete: isBillingProfileComplete(values),
    });
  } catch (error) {
    console.error("Error fetching billing profile:", error);
    return NextResponse.json({ error: "Unable to load billing information." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid billing information." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const billingType = body.billingType;
  if (billingType !== "individual" && billingType !== "business") {
    return NextResponse.json({ error: "Select individual or business billing." }, { status: 400 });
  }

  const values: Record<keyof typeof fieldLimits, string | null> = {
    fullName: readText(body.fullName),
    email: readText(body.email),
    phone: readText(body.phone),
    companyName: readText(body.companyName),
    taxId: readText(body.taxId),
    addressLine1: readText(body.addressLine1),
    addressLine2: readText(body.addressLine2),
    city: readText(body.city),
    region: readText(body.region),
    postalCode: readText(body.postalCode),
    country: readText(body.country),
  };

  for (const [field, maxLength] of Object.entries(fieldLimits)) {
    const value = values[field as keyof typeof fieldLimits];
    if (value && value.length > maxLength) {
      return NextResponse.json({ error: `${field} must be ${maxLength} characters or fewer.` }, { status: 400 });
    }
  }

  const requiredFields = ["fullName", "email", "addressLine1", "city", "country"] as const;
  for (const field of requiredFields) {
    if (!values[field]) {
      return NextResponse.json({ error: "Complete all required billing fields." }, { status: 400 });
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email ?? "")) {
    return NextResponse.json({ error: "Enter a valid billing email address." }, { status: 400 });
  }

  const now = new Date();
  const profileFields = {
    billingType,
    fullName: values.fullName!,
    email: values.email!,
    phone: values.phone,
    companyName: billingType === "business" ? values.companyName : null,
    taxId: billingType === "business" ? values.taxId : null,
    addressLine1: values.addressLine1!,
    addressLine2: values.addressLine2,
    city: values.city!,
    region: values.region!,
    postalCode: values.postalCode,
    country: values.country!,
    updatedAt: now,
  };

  try {
    const [saved] = await db
      .insert(billingProfiles)
      .values({ userId: session.user.id, ...profileFields })
      .onConflictDoUpdate({
        target: billingProfiles.userId,
        set: profileFields,
      })
      .returning();

    return NextResponse.json({ success: true, profile: saved });
  } catch (error) {
    console.error("Error saving billing profile:", error);
    return NextResponse.json({ error: "Unable to save billing information." }, { status: 500 });
  }
}
