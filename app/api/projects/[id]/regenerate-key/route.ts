import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
    authorizeProjectAccess,
    ProjectNotFoundError,
    ProjectForbiddenError,
    UnauthorizedProjectAccessError,
} from "@/lib/projects";
import { generateApiKey, hashApiKey } from "@/lib/auth/api-key";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { environment } = body;

        if (!environment) {
            return NextResponse.json({ error: "Environment is required" }, { status: 400 });
        }

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

        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        const existingKey = await db.query.apiKeys.findFirst({
            where: and(eq(apiKeys.projectId, id), eq(apiKeys.environment, environment)),
        });

        if (existingKey) {
            const updatedKey = await db
                .update(apiKeys)
                .set({ key: rawKey, keyHash, updatedAt: new Date() })
                .where(and(eq(apiKeys.projectId, id), eq(apiKeys.environment, environment)))
                .returning();

            if (updatedKey.length === 0) {
                return NextResponse.json({ error: "API Key not found for this environment" }, { status: 404 });
            }

            return NextResponse.json({ apiKey: rawKey, environment });
        }

        const newKey = await db.insert(apiKeys).values({
            id: uuidv4(),
            projectId: id,
            environment,
            key: rawKey,
            keyHash,
        }).returning();

        if (newKey.length === 0) {
            return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
        }

        return NextResponse.json({ apiKey: rawKey, environment });
    } catch (error) {
        console.error("Error regenerating API key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
