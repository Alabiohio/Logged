import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await auth.api.listSessions({
            headers: await headers(),
        });

        return NextResponse.json({ sessions: response });
    } catch (error) {
        console.error("Error listing sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
