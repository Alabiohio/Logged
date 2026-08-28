import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, apiKeys, logs } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    authorizeProjectAccess,
    projectOwnershipCondition,
    ProjectNotFoundError,
    ProjectForbiddenError,
    UnauthorizedProjectAccessError,
} from "@/lib/projects";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        let project;

        try {
            project = await authorizeProjectAccess(session, id);
        } catch (error) {
            if (error instanceof UnauthorizedProjectAccessError) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (error instanceof ProjectForbiddenError) {
                return NextResponse.json({ error: "You do not have permission to access this project" }, { status: 403 });
            }
            if (error instanceof ProjectNotFoundError) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            throw error;
        }

        const [projectApiKeys, statsResult, recentLogs, latestErrorRows] = await Promise.all([
            db
                .select({
                    id: apiKeys.id,
                    environment: apiKeys.environment,
                    key: apiKeys.key,
                })
                .from(apiKeys)
                .where(eq(apiKeys.projectId, id)),

            db
                .select({
                    level: logs.level,
                    count: sql<number>`cast(count(${logs.id}) as integer)`,
                })
                .from(logs)
                .where(eq(logs.projectId, id))
                .groupBy(logs.level),

            // 5 most recent logs
            db
                .select()
                .from(logs)
                .where(eq(logs.projectId, id))
                .orderBy(desc(logs.createdAt))
                .limit(5),

            // Latest error
            db
                .select()
                .from(logs)
                .where(and(eq(logs.projectId, id), eq(logs.level, "error")))
                .orderBy(desc(logs.createdAt))
                .limit(1),
        ]);

        const stats = {
            total: 0,
            error: 0,
            warn: 0,
            info: 0,
        };

        for (const row of statsResult) {
            const count = Number(row.count);
            stats.total += count;
            if (row.level === "error") stats.error += count;
            else if (row.level === "warn") stats.warn += count;
            else if (row.level === "info") stats.info += count;
        }

        const parsedRecentLogs = recentLogs.map((r) => ({
            ...r,
            metadata: r.metadata ? JSON.parse(r.metadata) : null,
        }));

        const latestError = latestErrorRows.length > 0
            ? {
                ...latestErrorRows[0],
                metadata: latestErrorRows[0].metadata
                    ? JSON.parse(latestErrorRows[0].metadata)
                    : null,
            }
            : null;

        return NextResponse.json({
            ...project,
            apiKeys: projectApiKeys,
            stats,
            recentLogs: parsedRecentLogs,
            latestError,
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { name, description, website } = body;

        try {
            await authorizeProjectAccess(session, id);
        } catch (error) {
            if (error instanceof UnauthorizedProjectAccessError) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (error instanceof ProjectForbiddenError) {
                return NextResponse.json({ error: "You do not have permission to access this project" }, { status: 403 });
            }
            if (error instanceof ProjectNotFoundError) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            throw error;
        }

        const updatedProject = await db
            .update(projects)
            .set({ name, description, website, updatedAt: new Date() })
            .where(projectOwnershipCondition(id, session.user.id))
            .returning();

        if (updatedProject.length === 0) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(updatedProject[0]);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        try {
            await authorizeProjectAccess(session, id);
        } catch (error) {
            if (error instanceof UnauthorizedProjectAccessError) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (error instanceof ProjectForbiddenError) {
                return NextResponse.json({ error: "You do not have permission to access this project" }, { status: 403 });
            }
            if (error instanceof ProjectNotFoundError) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            throw error;
        }

        const deletedProject = await db
            .delete(projects)
            .where(projectOwnershipCondition(id, session.user.id))
            .returning();

        if (deletedProject.length === 0) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
