import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, logs } from "@/db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getProjectsForUser } from "@/lib/projects";

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
        const userProjects = await getProjectsForUser(userId);

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
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
