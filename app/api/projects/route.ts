import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getProjectsForUser } from "@/lib/projects";

export async function GET() {
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

        return NextResponse.json({ ...newProject[0], apiKeys: [] }, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
