import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendAdminUnauthorizedAlertEmail } from "@/lib/email";

export function getAdminEmails(): Set<string> {
    const envValue = [
        process.env.ADMIN_EMAILS,
        process.env.DEVELOPER_EMAIL,
        process.env.OHEO_LOGGED_ADMIN_EMAIL,
    ]
        .filter(Boolean)
        .join(",");

    const emails = envValue
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    return new Set(emails);
}

export interface AdminAuthResult {
    authorized: boolean;
    user?: {
        id: string;
        email: string;
        name: string;
        role?: string;
    };
    reason?: string;
}

export async function verifyAdmin(contextAction?: string): Promise<AdminAuthResult> {
    const reqHeaders = await headers();

    let session = null;
    try {
        session = await auth.api.getSession({
            headers: reqHeaders,
        });
    } catch (err) {
        console.warn("[SECURITY AUDIT] Failed to retrieve session in verifyAdmin:", err);
    }

    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown-ip";
    const userAgent = reqHeaders.get("user-agent") || "unknown-ua";
    const timestamp = new Date().toISOString();
    const actionPath = contextAction || "Admin Route";

    const allowedEmails = getAdminEmails();

    if (!session || !session.user || !session.user.email) {
        console.warn(
            `[SECURITY AUDIT - DENIED] Unauthorized admin access attempt. Action: ${actionPath}, IP: ${ip}, UserAgent: ${userAgent}, Reason: No active session`
        );

        return { authorized: false, reason: "No active session" };
    }

    const userEmail = session.user.email.trim().toLowerCase();
    const userRole = (session.user as { role?: string }).role;

    const isEmailAllowed = allowedEmails.has(userEmail);
    const isRoleAdmin = userRole === "admin";

    if (!isEmailAllowed && !isRoleAdmin) {
        console.warn(
            `[SECURITY AUDIT - DENIED] Forbidden admin access attempt. Action: ${actionPath}, UserID: ${session.user.id}, Email: ${userEmail}, Role: ${userRole || "none"}, IP: ${ip}, UserAgent: ${userAgent}`
        );

        // Send immediate alert to oheo.co@gmail.com and all admin emails
        const recipientList = Array.from(new Set(["oheo.co@gmail.com", ...Array.from(allowedEmails)]));
        sendAdminUnauthorizedAlertEmail({
            to: recipientList,
            attemptedPath: actionPath,
            ipAddress: ip,
            userEmail,
            userId: session.user.id,
            timestamp,
        }).catch((err) => console.error("Failed to send 403 alert email:", err));

        return {
            authorized: false,
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: userRole,
            },
            reason: "Insufficient privileges",
        };
    }

    console.info(
        `[SECURITY AUDIT - ALLOWED] Admin access granted. Action: ${actionPath}, UserID: ${session.user.id}, Email: ${userEmail}, IP: ${ip}`
    );

    return {
        authorized: true,
        user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: userRole,
        },
    };
}
