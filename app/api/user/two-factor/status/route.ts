import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, accounts, twoFactors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [userRecord] = await db
            .select({ twoFactorEnabled: users.twoFactorEnabled })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const userAccounts = await db
            .select({ providerId: accounts.providerId })
            .from(accounts)
            .where(eq(accounts.userId, session.user.id));

        const hasPassword = userAccounts.some((a) => a.providerId === "credential");

        const [twoFactorRecord] = await db
            .select({ verified: twoFactors.verified })
            .from(twoFactors)
            .where(eq(twoFactors.userId, session.user.id))
            .limit(1);

        return NextResponse.json({
            enabled: Boolean(userRecord?.twoFactorEnabled),
            hasPassword,
            verified: Boolean(twoFactorRecord?.verified),
        });
    } catch (error) {
        console.error("Error fetching 2FA status:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
