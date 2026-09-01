import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences, logs, projects } from "@/db/schema";
import { eq, lt, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/cron/purge-logs
 *
 * Vercel Cron route: deletes logs older than each user's logRetentionDays preference.
 * Secured by CRON_SECRET header (set in vercel.json authorization).
 *
 * Schedule this in vercel.json:
 *   { "path": "/api/cron/purge-logs", "schedule": "0 3 * * *" }
 */
export async function GET(request: Request) {
    // Verify the request is coming from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all users' retention preferences
        const allPreferences = await db
            .select({
                userId: userPreferences.userId,
                logRetentionDays: userPreferences.logRetentionDays,
            })
            .from(userPreferences);

        let totalDeleted = 0;

        for (const pref of allPreferences) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - pref.logRetentionDays);

            // Get all projects belonging to this user
            const userProjects = await db
                .select({ id: projects.id })
                .from(projects)
                .where(eq(projects.userId, pref.userId));

            for (const project of userProjects) {
                const result = await db
                    .delete(logs)
                    .where(
                        and(
                            eq(logs.projectId, project.id),
                            lt(logs.createdAt, cutoff)
                        )
                    );
                totalDeleted += (result as { rowCount?: number }).rowCount ?? 0;
            }
        }

        console.log(`Purge cron: deleted ${totalDeleted} logs`);
        return NextResponse.json({
            success: true,
            deletedCount: totalDeleted,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Purge cron error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
