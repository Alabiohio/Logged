import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { parseUserAgent, formatIpAddress } from "@/lib/device";

export async function GET() {
    try {
        const response = await auth.api.listSessions({
            headers: await headers(),
        });

        const enrichedSessions = (response ?? []).map((session) => {
            const parsedDevice = parseUserAgent(session.userAgent);
            return {
                ...session,
                formattedIp: formatIpAddress(session.ipAddress),
                deviceInfo: parsedDevice,
            };
        });

        return NextResponse.json({ sessions: enrichedSessions });
    } catch (error) {
        console.error("Error listing sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
