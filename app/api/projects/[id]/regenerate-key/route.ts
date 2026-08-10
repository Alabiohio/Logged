import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
    authorizeProjectAccess,
    ProjectNotFoundError,
    UnauthorizedProjectAccessError,
} from "@/lib/projects";

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
            if (error instanceof Error && error.name === "UnauthorizedProjectAccessError") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (error instanceof Error && error.name === "ProjectNotFoundError") {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            throw error;
        }

        const rawKey = `lg_${environment === "production" ? "live" : "test"}_${crypto.randomBytes(16).toString("hex")}`;
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        const updatedKey = await db
            .update(apiKeys)
            .set({ key: rawKey, keyHash, updatedAt: new Date() })
            .where(and(eq(apiKeys.projectId, id), eq(apiKeys.environment, environment)))
            .returning();

        if (updatedKey.length === 0) {
            return NextResponse.json({ error: "API Key not found for this environment" }, { status: 404 });
        }

        return NextResponse.json({ apiKey: rawKey, environment });
    } catch (error) {
        console.error("Error regenerating API key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
