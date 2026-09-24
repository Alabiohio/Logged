import { db } from "@/lib/db";
import { logs, projects } from "@/db/schema";
import { eq, lt, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getBillingEnabled } from "@/lib/billing/config";
import { getUserLimits } from "@/lib/billing/entitlements";

/**
 * GET /api/cron/purge-logs
 *
 * Vercel Cron route: deletes logs older than each user's plan retention window.
 * Free = 7 days. Plus = 30 days. Soft 90 days while billing is off.
 * Secured by CRON_SECRET header (set in vercel.json authorization).
 *
 * Schedule this in vercel.json:
 *   { "path": "/api/cron/purge-logs", "schedule": "0 3 * * *" }
 */
export async function GET(request: Request) {
    // Verify the request is coming from Vercel Cron if secret is set
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const billingEnabled = await getBillingEnabled();

        // Get all distinct project owners
        const userRows = await db
            .selectDistinct({ userId: projects.userId })
            .from(projects);

        let totalDeleted = 0;
        let processedUsers = 0;

        for (const { userId } of userRows) {
            let retentionDays = 90; // Generous soft retention while billing is disabled

            if (billingEnabled) {
                const limits = await getUserLimits(userId);
                retentionDays = limits.retentionDays; // Free = 7, Plus = 30
            }

            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - retentionDays);

            const userProjects = await db
                .select({ id: projects.id })
                .from(projects)
                .where(eq(projects.userId, userId));

            if (userProjects.length === 0) continue;

            const projectIds = userProjects.map((p) => p.id);

            const result = await db
                .delete(logs)
                .where(
                    and(
                        inArray(logs.projectId, projectIds),
                        lt(logs.createdAt, cutoff)
                    )
                );

            totalDeleted += (result as { rowCount?: number }).rowCount ?? 0;
            processedUsers++;
        }

        console.log(`Purge cron: deleted ${totalDeleted} logs across ${processedUsers} users (billingEnabled=${billingEnabled})`);

        return NextResponse.json({
            success: true,
            billingEnabled,
            processedUsers,
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

