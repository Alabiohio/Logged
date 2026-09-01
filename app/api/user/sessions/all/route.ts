import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/user/sessions/all — revoke all other sessions (keeps current)
export async function DELETE() {
    try {
        await auth.api.revokeOtherSessions({
            headers: await headers(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error revoking all sessions:", error);
        return NextResponse.json(
            { error: "Failed to revoke sessions" },
            { status: 500 }
        );
    }
}
