import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/user/sessions/[token] — revoke a single session by token
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    try {
        await auth.api.revokeSession({
            headers: await headers(),
            body: { token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error revoking session:", error);
        return NextResponse.json(
            { error: "Failed to revoke session" },
            { status: 500 }
        );
    }
}
