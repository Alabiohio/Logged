import { db } from "@/lib/db";
import { userBillingPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserBillingPreferences(userId: string) {
  const rows = await db
    .select()
    .from(userBillingPreferences)
    .where(eq(userBillingPreferences.userId, userId))
    .limit(1);

  return rows[0] ?? {
    userId,
    paygEnabled: true,
    paygSpendingLimit: null,
  };
}

export async function ensureUserBillingPreferences(userId: string) {
  const existing = await getUserBillingPreferences(userId);
  if ("createdAt" in existing) return existing;

  try {
    const inserted = await db
      .insert(userBillingPreferences)
      .values({ userId })
      .returning();
    if (inserted[0]) return inserted[0];
  } catch (error) {
    const racedInsert = await db
      .select()
      .from(userBillingPreferences)
      .where(eq(userBillingPreferences.userId, userId))
      .limit(1);
    if (racedInsert[0]) return racedInsert[0];
    throw error;
  }

  throw new Error("Unable to create user billing preferences");
}
