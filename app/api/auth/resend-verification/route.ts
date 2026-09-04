import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const email = body?.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: { emailVerified: true },
        });

        if (user?.emailVerified) {
            return NextResponse.json(
                { error: "This email address is already verified. Please sign in." },
                { status: 409 },
            );
        }

        const result = await auth.api.sendVerificationEmail({
            body: {
                email,
                callbackURL: "/set-username",
            },
        });
        return NextResponse.json({ success: true, result });
    } catch (error: unknown) {
        console.error("Failed to resend verification email:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to send verification email";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
