import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logs, plans, projects, subscriptions } from "@/db/schema";
import { and, desc, eq, sql, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Get all user projects
        // Load project metadata only. Counting every project's logs here makes the dashboard
        // wait on the full logs table before it can render its bounded recent-log preview.
        const [userProjects, subscriptionRows] = await Promise.all([
            db
                .select({
                    id: projects.id,
                    name: projects.name,
                    updatedAt: projects.updatedAt,
                    isArchived: projects.isArchived,
                })
                .from(projects)
                .where(eq(projects.userId, userId)),
            db
                .select({
                    id: subscriptions.id,
                    status: subscriptions.status,
                    currentPeriodEnd: subscriptions.currentPeriodEnd,
                    cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
                    planName: plans.displayName,
                    isPaid: sql<boolean>`${plans.price} > 0`,
                })
                .from(subscriptions)
                .innerJoin(plans, eq(subscriptions.planId, plans.id))
                .where(eq(subscriptions.userId, userId))
                .limit(1),
        ]);
        const subscription = subscriptionRows[0] ?? null;
        const subscriptionNotice = subscription
            ? {
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                planName: subscription.planName,
                isPaid: subscription.isPaid,
            }
            : null;

        const projectIds = userProjects.map((p) => p.id);

        if (projectIds.length === 0) {
            return NextResponse.json({
                stats: {
                    projects: 0,
                    logsToday: 0,
                    errorsToday: 0,
                    warningsToday: 0,
                },
                recentLogs: [],
                projects: [],
                subscription: subscriptionNotice,
            });
        }

        // Start of today (UTC)
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        // Run queries in parallel
        const [todayStats, recentLogs] = await Promise.all([
            // Today's stats grouped by level
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
                        gte(logs.createdAt, todayStart)
                    )
                )
                .groupBy(logs.level),

            // 10 most recent logs across all projects
            db
                .select({
                    id: logs.id,
                    projectId: logs.projectId,
                    level: logs.level,
                    message: logs.message,
                    environment: logs.environment,
                    createdAt: logs.createdAt,
                })
                .from(logs)
                .where(
                    sql`${logs.projectId} IN (${sql.join(
                        projectIds.map((id) => sql`${id}`),
                        sql`, `
                    )})`
                )
                .orderBy(desc(logs.createdAt))
                .limit(10),
        ]);

        // Aggregate today's stats
        let logsToday = 0;
        let errorsToday = 0;
        let warningsToday = 0;

        for (const row of todayStats) {
            const count = Number(row.count);
            logsToday += count;
            if (row.level === "error") errorsToday = count;
            if (row.level === "warn") warningsToday = count;
        }

        // Attach project names to recent logs
        const projectMap = new Map(userProjects.map((p) => [p.id, p.name]));
        const recentLogsWithProject = recentLogs.map((log) => ({
            ...log,
            projectName: projectMap.get(log.projectId) ?? "Unknown",
        }));

        return NextResponse.json({
            stats: {
                projects: userProjects.length,
                logsToday,
                errorsToday,
                warningsToday,
            },
            recentLogs: recentLogsWithProject,
            projects: userProjects,
            subscription: subscriptionNotice,
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
