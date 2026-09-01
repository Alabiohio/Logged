import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/api/projects") ||
        pathname.startsWith("/api/dashboard") ||
        pathname.startsWith("/api/activity") ||
        pathname.startsWith("/api/user")
    ) {
        const sessionCookie = getSessionCookie(request);

        if (!sessionCookie) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/projects/:path*",
        "/api/dashboard/:path*",
        "/api/activity/:path*",
        "/api/user/:path*",
    ],
};
