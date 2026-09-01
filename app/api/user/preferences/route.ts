import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const preferences = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, session.user.id),
        });

        return NextResponse.json({
            preferences: preferences || {
                emailNotifications: true,
                errorAlerts: true,
                weeklyDigest: false,
                logRetentionDays: 90,
            },
        });
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { emailNotifications, errorAlerts, weeklyDigest, logRetentionDays } = body;

        await db
            .insert(userPreferences)
            .values({
                userId: session.user.id,
                emailNotifications: emailNotifications ?? true,
                errorAlerts: errorAlerts ?? true,
                weeklyDigest: weeklyDigest ?? false,
                logRetentionDays: logRetentionDays ?? 90,
            })
            .onConflictDoUpdate({
                target: userPreferences.userId,
                set: {
                    ...(emailNotifications !== undefined && { emailNotifications }),
                    ...(errorAlerts !== undefined && { errorAlerts }),
                    ...(weeklyDigest !== undefined && { weeklyDigest }),
                    ...(logRetentionDays !== undefined && { logRetentionDays }),
                    updatedAt: new Date(),
                },
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving preferences:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
