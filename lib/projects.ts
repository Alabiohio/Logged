import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { and, eq, type SQL } from "drizzle-orm";

export class UnauthorizedProjectAccessError extends Error {
    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedProjectAccessError";
    }
}

export class ProjectNotFoundError extends Error {
    constructor() {
        super("Project not found");
        this.name = "ProjectNotFoundError";
    }
}

export class ProjectForbiddenError extends Error {
    constructor() {
        super("You do not have permission to access this project");
        this.name = "ProjectForbiddenError";
    }
}

export function projectOwnershipCondition(projectId: string, userId: string): SQL | undefined {
    return and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
    );
}

export async function getProjectForUser(projectId: string, userId: string) {
    return db.query.projects.findFirst({
        where: projectOwnershipCondition(projectId, userId),
    });
}

export async function getProjectsForUser(userId: string) {
    return db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId));
}

export async function projectExists(projectId: string): Promise<boolean> {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        columns: { id: true },
    });
    return project !== null;
}

export async function authorizeProjectAccess(
    session: { user?: { id: string } } | null,
    projectId: string
) {
    if (!session?.user) {
        throw new UnauthorizedProjectAccessError();
    }

    const owned = await getProjectForUser(projectId, session.user.id);

    if (owned) {
        return owned;
    }

    const exists = await projectExists(projectId);

    if (exists) {
        throw new ProjectForbiddenError();
    }

    throw new ProjectNotFoundError();
}
