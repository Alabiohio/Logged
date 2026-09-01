import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/user/delete — permanently delete the current user's account
export async function DELETE() {
    try {
        await auth.api.deleteUser({
            body: {},
            headers: await headers(),
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
