import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { expireSubscription } from "@/lib/billing/subscription";
import { syncUserProjectLimits } from "@/lib/billing/entitlements";

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

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const userRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        subscriptionId: subscriptions.id,
        status: subscriptions.status,
        planId: plans.id,
        planName: plans.name,
        planDisplayName: plans.displayName,
        paystackCustomerCode: subscriptions.paystackCustomerCode,
        paystackSubscriptionCode: subscriptions.paystackSubscriptionCode,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .orderBy(desc(users.createdAt));

    const formatted = userRows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified,
      image: u.image,
      createdAt: u.createdAt,
      subscription: {
        id: u.subscriptionId,
        status: u.status || "active",
        planId: u.planId || "free",
        planName: u.planName || "free",
        planDisplayName: u.planDisplayName || "Free",
        paystackCustomerCode: u.paystackCustomerCode,
        paystackSubscriptionCode: u.paystackSubscriptionCode,
        currentPeriodStart: u.currentPeriodStart,
        currentPeriodEnd: u.currentPeriodEnd,
        cancelAtPeriodEnd: u.cancelAtPeriodEnd || false,
      },
    }));

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, userId } = body;

    if (action === "revoke_subscription" && userId) {
      await expireSubscription(userId);
      await syncUserProjectLimits(userId);
      return NextResponse.json({ success: true, message: "Subscription revoked successfully" });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error managing user subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
