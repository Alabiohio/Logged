import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPreferences, users, projects, logs } from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { sendWeeklyDigestEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const token =
        url.searchParams.get("secret") ??
        (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");

    const userAgent = request.headers.get("user-agent") ?? "";
    const isVercelCron = userAgent.startsWith("vercel-cron/");

    if (!CRON_SECRET || (token !== CRON_SECRET && !isVercelCron)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - 7);
    periodStart.setHours(0, 0, 0, 0);

    try {
        const optedInUsers = await db
            .select({
                userId: userPreferences.userId,
                email: users.email,
                name: users.name,
            })
            .from(userPreferences)
            .innerJoin(users, eq(userPreferences.userId, users.id))
            .where(
                and(
                    eq(userPreferences.weeklyDigest, true),
                    eq(userPreferences.emailNotifications, true)
                )
            );

        const results = {
            total: optedInUsers.length,
            sent: 0,
            failed: 0,
            skipped: 0,
        };

        for (const user of optedInUsers) {
            try {
                const userProjects = await db
                    .select({ id: projects.id, name: projects.name })
                    .from(projects)
                    .where(eq(projects.userId, user.userId));

                if (userProjects.length === 0) {
                    results.skipped++;
                    continue;
                }

                const projectIds = userProjects.map((p) => p.id);
                const projectMap = new Map(userProjects.map((p) => [p.id, p.name]));

                const [levelStats, projectStats, recentErrors] = await Promise.all([
                    db
                        .select({
                            level: logs.level,
                            count: sql<number>`cast(count(${logs.id}) as integer)`,
                        })
                        .from(logs)
                        .where(
                            and(
                                sql`${logs.projectId} IN (${sql.join(
                                    projectIds.map((id) => sql`${id}`),
                                    sql`, `
                                )})`,
                                gte(logs.createdAt, periodStart)
                            )
                        )
                        .groupBy(logs.level),

                    db
                        .select({
                            projectId: logs.projectId,
                            level: logs.level,
                            count: sql<number>`cast(count(${logs.id}) as integer)`,
                        })
                        .from(logs)
                        .where(
                            and(
                                sql`${logs.projectId} IN (${sql.join(
                                    projectIds.map((id) => sql`${id}`),
                                    sql`, `
                                )})`,
                                gte(logs.createdAt, periodStart)
                            )
                        )
                        .groupBy(logs.projectId, logs.level),

                    db
                        .select({
                            id: logs.id,
                            projectId: logs.projectId,
                            level: logs.level,
                            message: logs.message,
                            createdAt: logs.createdAt,
                        })
                        .from(logs)
                        .where(
                            and(
                                sql`${logs.projectId} IN (${sql.join(
                                    projectIds.map((id) => sql`${id}`),
                                    sql`, `
                                )})`,
                                eq(logs.level, "error"),
                                gte(logs.createdAt, periodStart)
                            )
                        )
                        .orderBy(desc(logs.createdAt), desc(logs.id))
                        .limit(5),
                ]);

                const totalLogs = levelStats.reduce((sum, row) => sum + Number(row.count), 0);
                const breakdown = levelStats.map((row) => ({
                    level: row.level,
                    count: Number(row.count),
                }));

                const totalErrors =
                    levelStats.find((row) => row.level === "error")?.count ?? 0;
                const totalWarnings =
                    levelStats.find((row) => row.level === "warn")?.count ?? 0;
                const totalInfo =
                    (levelStats.find((row) => row.level === "info")?.count ?? 0) +
                    (levelStats.find((row) => row.level === "success")?.count ?? 0) +
                    (levelStats.find((row) => row.level === "log")?.count ?? 0) +
                    (levelStats.find((row) => row.level === "debug")?.count ?? 0);

                const projectSummaries: Array<{
                    projectName: string;
                    projectId: string;
                    totalLogs: number;
                    errors: number;
                    warnings: number;
                    env: string | null;
                }> = [];

                for (const proj of userProjects) {
                    const projStats = projectStats.filter((s) => s.projectId === proj.id);
                    const projTotal = projStats.reduce((sum, row) => sum + Number(row.count), 0);
                    const projErrors = projStats.find((s) => s.level === "error")?.count ?? 0;
                    const projWarnings = projStats.find((s) => s.level === "warn")?.count ?? 0;

                    projectSummaries.push({
                        projectName: proj.name,
                        projectId: proj.id,
                        totalLogs: projTotal,
                        errors: projErrors,
                        warnings: projWarnings,
                        env: null,
                    });
                }

                const recentErrorsForEmail = recentErrors.map((err) => ({
                    message: err.message,
                    projectName: projectMap.get(err.projectId) ?? "Unknown",
                    projectId: err.projectId,
                    logId: err.id,
                    createdAt: err.createdAt,
                    level: err.level,
                }));

                await sendWeeklyDigestEmail({
                    to: user.email,
                    userName: user.name || "User",
                    summary: {
                        totalLogs,
                        totalErrors: Number(totalErrors),
                        totalWarnings: Number(totalWarnings),
                        totalInfo: Number(totalInfo),
                        breakdown,
                        projectSummaries,
                        recentErrors: recentErrorsForEmail,
                        periodStart,
                    },
                });

                console.log(`Weekly digest sent to user ${user.userId} (${user.email})`);
                results.sent++;
            } catch (error) {
                console.error(`Failed to send weekly digest to user ${user.userId}:`, error);
                results.failed++;
            }
        }

        return NextResponse.json({
            success: true,
            results,
            periodStart: periodStart.toISOString(),
            periodEnd: now.toISOString(),
        });
    } catch (error) {
        console.error("Weekly digest cron job failed:", error);
        return NextResponse.json(
            { success: false, error: "Weekly digest job failed" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    return GET(request);
}
