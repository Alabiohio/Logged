import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logs, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    authorizeProjectAccess,
    ProjectNotFoundError,
    ProjectForbiddenError,
    UnauthorizedProjectAccessError,
} from "@/lib/projects";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string; logId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, logId } = await params;

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

    // Fetch the log
    const log = await db.query.logs.findFirst({
        where: and(eq(logs.id, logId), eq(logs.projectId, id)),
    });

    if (!log) {
        return NextResponse.json(
            { error: "Log not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
    });
}
