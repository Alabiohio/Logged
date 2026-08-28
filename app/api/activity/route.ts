import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logs, projects } from "@/db/schema";
import { eq, and, desc, sql, or, ilike, gte, lte, lt, type SQL } from "drizzle-orm";
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

    try {
        const userProjects = await getProjectsForUser(session.user.id);
        const projectIds = userProjects.map((p) => p.id);

        if (projectIds.length === 0) {
            return NextResponse.json({
                logs: [],
                pagination: { nextCursor: null, hasMore: false, total: 0 },
                stats: { total: 0, errors: 0, warnings: 0 },
            });
        }

        const url = new URL((await headers()).get("x-url") || "http://localhost:3000");
        const level = url.searchParams.get("level");
        const environment = url.searchParams.get("environment");
        const search = url.searchParams.get("search");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");

        const cursor = url.searchParams.get("cursor");
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));

        const filterConditions: SQL[] = [
            sql`${logs.projectId} IN (${sql.join(
                projectIds.map((id) => sql`${id}`),
                sql`, `
            )})`
        ];

        if (level && level !== "all") {
            filterConditions.push(eq(logs.level, level));
        }

        if (environment && environment !== "all") {
            filterConditions.push(eq(logs.environment, environment));
        }

        if (search) {
            const searchCondition = or(
                ilike(logs.message, `%${search}%`),
                ilike(logs.url, `%${search}%`)
            );
            if (searchCondition) filterConditions.push(searchCondition);
        }

        if (from) {
            filterConditions.push(gte(logs.createdAt, new Date(from)));
        }

        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            filterConditions.push(lte(logs.createdAt, toDate));
        }

        const dataConditions = [...filterConditions];

        if (cursor) {
            try {
                const decodedCursor = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
                if (decodedCursor.createdAt && decodedCursor.id) {
                    const cursorDate = new Date(decodedCursor.createdAt);
                    const cursorCondition = or(
                        lt(logs.createdAt, cursorDate),
                        and(
                            eq(logs.createdAt, cursorDate),
                            lt(logs.id, decodedCursor.id)
                        )
                    );
                    if (cursorCondition) dataConditions.push(cursorCondition);
                }
            } catch (e) {
                console.error("Invalid cursor format", e);
            }
        }

        const [rows, countRows, projectMapRows] = await Promise.all([
            db
                .select()
                .from(logs)
                .where(and(...dataConditions))
                .orderBy(desc(logs.createdAt), desc(logs.id))
                .limit(limit + 1),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(logs)
                .where(and(...filterConditions)),
            db
                .select({ id: projects.id, name: projects.name })
                .from(projects)
                .where(sql`${projects.id} IN (${sql.join(
                    projectIds.map((id) => sql`${id}`),
                    sql`, `
                )})`),
        ]);

        const projectMap = new Map(projectMapRows.map((p) => [p.id, p.name]));

        const hasMore = rows.length > limit;
        const paginatedRows = hasMore ? rows.slice(0, limit) : rows;

        let nextCursor = null;
        if (hasMore) {
            const lastRow = paginatedRows[paginatedRows.length - 1];
            nextCursor = Buffer.from(
                JSON.stringify({
                    createdAt: lastRow.createdAt.toISOString(),
                    id: lastRow.id
                })
            ).toString("base64");
        }

        const total = countRows[0]?.count ?? 0;

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const [todayStats] = await Promise.all([
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
        ]);

        let errorsToday = 0;
        let warningsToday = 0;
        for (const row of todayStats) {
            const count = Number(row.count);
            if (row.level === "error") errorsToday = count;
            if (row.level === "warn") warningsToday = count;
        }

        return NextResponse.json({
            logs: paginatedRows.map((r) => ({
                ...r,
                metadata: r.metadata ? JSON.parse(r.metadata) : null,
                projectName: projectMap.get(r.projectId) ?? "Unknown",
            })),
            pagination: {
                nextCursor,
                hasMore,
                total
            },
            stats: {
                total,
                errors: errorsToday,
                warnings: warningsToday,
            },
        });
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
