import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { getProjectsForUser } from "@/lib/projects";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userProjects = await getProjectsForUser(session.user.id);

        return NextResponse.json(userProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, website } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const projectId = uuidv4();

        const newProject = await db.insert(projects).values({
            id: projectId,
            userId: session.user.id,
            name,
            description,
            website,
        }).returning();

        const environments = ["development", "staging", "production"];
        const keysToInsert = [];
        const rawKeys: Record<string, string> = {};

        for (const env of environments) {
            const rawKey = `lg_${env === "production" ? "live" : "test"}_${crypto.randomBytes(16).toString("hex")}`;
            const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
            
            rawKeys[env] = rawKey;
            keysToInsert.push({
                id: uuidv4(),
                projectId,
                environment: env,
                key: rawKey,
                keyHash,
            });
        }

        await db.insert(apiKeys).values(keysToInsert);

        return NextResponse.json({ ...newProject[0], apiKeys: rawKeys }, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
