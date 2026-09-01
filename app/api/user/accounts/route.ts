import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/user/accounts — list all connected OAuth provider accounts
export async function GET() {
    try {
        const response = await auth.api.listUserAccounts({
            headers: await headers(),
        });

        return NextResponse.json({ accounts: response });
    } catch (error) {
        console.error("Error listing accounts:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
