import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

function getAdminEmails(): Set<string> {
  const envValue = [
    process.env.ADMIN_EMAILS,
    process.env.DEVELOPER_EMAIL,
    process.env.OHEO_LOGGED_ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .join(",");

  const emails = envValue
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return new Set(emails);
}

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.email) {
    return false;
  }

  const userEmail = session.user.email.trim().toLowerCase();
  const allowed = getAdminEmails();
  return allowed.has(userEmail);
}

async function upsertSetting(key: string, value: string) {
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({
      id: `setting_${crypto.randomUUID()}`,
      key,
      value,
      updatedAt: new Date(),
    });
  }
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const allSettings = await db.select().from(settings);
    let billingEnabled = false;
    let paymentProvider = "paystack";

    for (const s of allSettings) {
      if (s.key === "billing_enabled") {
        billingEnabled = s.value.toLowerCase() === "true";
      } else if (s.key === "payment_provider") {
        paymentProvider = s.value.toLowerCase();
      }
    }

    return NextResponse.json({
      billingEnabled,
      paymentProvider,
    });
  } catch (error) {
    console.error("Error fetching admin billing settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (typeof body.billingEnabled === "boolean") {
      await upsertSetting("billing_enabled", body.billingEnabled ? "true" : "false");
    }

    if (typeof body.paymentProvider === "string" && body.paymentProvider.trim() !== "") {
      await upsertSetting("payment_provider", body.paymentProvider.trim().toLowerCase());
    }

    const allSettings = await db.select().from(settings);
    let billingEnabled = false;
    let paymentProvider = "paystack";

    for (const s of allSettings) {
      if (s.key === "billing_enabled") {
        billingEnabled = s.value.toLowerCase() === "true";
      } else if (s.key === "payment_provider") {
        paymentProvider = s.value.toLowerCase();
      }
    }

    return NextResponse.json({
      success: true,
      billingEnabled,
      paymentProvider,
    });
  } catch (error) {
    console.error("Error updating admin billing settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
