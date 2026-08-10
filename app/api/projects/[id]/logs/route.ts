import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logs, projects } from "@/db/schema";
import { eq, and, desc, sql, or, ilike, gte, lte, lt, type SQL } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    authorizeProjectAccess,
    ProjectNotFoundError,
    UnauthorizedProjectAccessError,
} from "@/lib/projects";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await authorizeProjectAccess(session, id);
    } catch (error) {
        if (error instanceof Error && error.name === "UnauthorizedProjectAccessError") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof Error && error.name === "ProjectNotFoundError") {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        throw error;
    }

    // Parse query params
    const url = new URL(req.url);
    const level = url.searchParams.get("level");
    const environment = url.searchParams.get("environment");
    const search = url.searchParams.get("search");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    // Pagination
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));

    // Build filter conditions (shared between data query and count query)
    const filterConditions: SQL[] = [eq(logs.projectId, id)];

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
        // Set to end of day for the "to" date
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filterConditions.push(lte(logs.createdAt, toDate));
    }

    // Build cursor condition (only for data query, not count)
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

    // Fetch logs + total count in parallel
    // Count uses filterConditions (excludes cursor) so it reflects total matching logs
    const [rows, countRows] = await Promise.all([
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
    ]);

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

    return NextResponse.json({
        success: true,
        logs: paginatedRows.map((r) => ({
            ...r,
            metadata: r.metadata ? JSON.parse(r.metadata) : null,
        })),
        pagination: {
            nextCursor,
            hasMore,
            total
        },
    });
}
