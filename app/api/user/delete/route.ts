import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

// DELETE /api/user/delete — permanently delete the current user's account
export async function DELETE() {
    try {
        const reqHeaders = await headers();
        const session = await auth.api.getSession({
            headers: reqHeaders,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete all projects owned by the user (cascades to api_keys and logs)
        await db.delete(projects).where(eq(projects.userId, session.user.id));

        // Delete user via Better Auth
        await auth.api.deleteUser({
            body: {},
            headers: reqHeaders,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
