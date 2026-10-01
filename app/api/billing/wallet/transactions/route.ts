import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, session.user.id))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50);

  return NextResponse.json({ transactions });
}
