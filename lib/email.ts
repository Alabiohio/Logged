import { Resend } from "resend";
import { APP_URL } from "@/lib/site-config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendErrorAlertEmail({
    to,
    userName,
    projectName,
    errorMessage,
    logUrl,
}: {
    to: string;
    userName: string;
    projectName: string;
    errorMessage: string;
    logUrl: string;
}) {
    try {
        await resend.emails.send({
            from: "Logged <logged@info.oheo.site>",
            to,
            subject: `[${projectName}] New error detected`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Logged — Error Alert</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7; margin:0; padding:0;">
        <tr>
            <td align="center" style="padding:48px 20px;">

                <!-- Main container -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">

                    <!-- Brand -->
                    <tr>
                        <td style="padding:0 0 20px 4px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>

                                    <!-- Logo -->
                                    <td valign="middle" style="padding-right:9px;">
                                        <img
                                            src="https://logged.oheo.site/logo/logo.png"
                                            width="28"
                                            height="28"
                                            alt="Logged"
                                            style="display:block; width:28px; height:28px; border:0; outline:none; text-decoration:none; border-radius:7px;"
                                        >
                                    </td>

                                    <!-- Name -->
                                    <td valign="middle">
                                        <span style="font-size:20px; line-height:28px; font-weight:700; letter-spacing:-0.4px; color:#46525B;">
                                            Logged
                                        </span>
                                    </td>

                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main card -->
                    <tr>
                        <td style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">

                            <!-- Header -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 28px 36px; border-bottom:1px solid #f0f1f3;">

                                        <!-- Status -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:5px 9px;">
                                                    <span style="font-size:11px; line-height:16px; font-weight:700; color:#b91c1c; letter-spacing:0.04em; text-transform:uppercase;">
                                                        Error detected
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <h1 style="margin:18px 0 8px 0; padding:0; font-size:24px; line-height:32px; font-weight:700; letter-spacing:-0.5px; color:#111827;">
                                            A new error was detected
                                        </h1>

                                        <p style="margin:0; padding:0; font-size:14px; line-height:22px; color:#6b7280;">
                                            Logged detected an error in your project and is notifying you so you can investigate it.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 36px 36px;">

                                        <!-- Greeting -->
                                        <p style="margin:0 0 18px 0; font-size:15px; line-height:24px; color:#374151;">
                                            Hi <strong style="color:#111827;">${userName}</strong>,
                                        </p>

                                        <p style="margin:0 0 28px 0; font-size:15px; line-height:24px; color:#4b5563;">
                                            An error was detected in
                                            <strong style="color:#111827;">${projectName}</strong>.
                                            Here’s what Logged captured:
                                        </p>

                                        <!-- Error block -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px; padding:18px 20px;">

                                                    <p style="margin:0 0 10px 0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                        Error message
                                                    </p>

                                                    <p style="margin:0; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size:13px; line-height:21px; color:#1f2937; word-break:break-word;">
                                                        ${errorMessage}
                                                    </p>

                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="border-radius:7px; background-color:#111827;">
                                                    <a
                                                        href="${logUrl}"
                                                        style="display:inline-block; padding:12px 18px; font-size:14px; line-height:20px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:7px;"
                                                    >
                                                        View error details
                                                        <span style="padding-left:5px;">→</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Supporting text -->
                                        <p style="margin:20px 0 0 0; font-size:12px; line-height:19px; color:#9ca3af;">
                                            You can review the full log, stack trace, and related information from your Logged dashboard.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color:#fafafa; border-top:1px solid #f0f1f3; padding:28px 36px;">

                                        <p style="margin:0 0 10px 0; font-size:13px; line-height:20px; color:#6b7280;">
                                            Receiving too many notifications?
                                            <a
                                                href="${process.env.APP_URL || "http://localhost:3000"}/dashboard/settings"
                                                style="color:#374151; font-weight:600; text-decoration:underline;"
                                            >
                                                Manage notification settings
                                            </a>
                                        </p>

                                        <!-- Divider -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
                                            <tr>
                                                <td style="height:1px; background-color:#e5e7eb; font-size:0; line-height:0;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Footer branding -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>

                                                <td valign="middle" style="padding-right:8px;">
                                                    <img
                                                        src="https://logged.oheo.site/logo/logo.png"
                                                        width="20"
                                                        height="20"
                                                        alt="Logged"
                                                        style="display:block; width:20px; height:20px; border:0; outline:none; text-decoration:none; border-radius:5px;"
                                                    >
                                                </td>

                                                <td valign="middle">
                                                    <span style="font-size:13px; line-height:20px; font-weight:600; color:#46525B;">
                                                        Logged
                                                    </span>
                                                </td>

                                            </tr>
                                        </table>

                                        <p style="margin:8px 0 16px 0; font-size:12px; line-height:18px; color:#9ca3af;">
                                            Offered by
                                            <a
                                                href="https://oheo.site"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style="color:#6b7280; font-weight:600; text-decoration:none;"
                                            >
                                                Oheo
                                            </a>
                                        </p>

                                        <p style="margin:0; font-size:11px; line-height:17px; color:#b0b5bd;">
                                            © ${new Date().getFullYear()} Logged. All rights reserved.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Bottom spacing -->
                    <tr>
                        <td style="height:24px; font-size:0; line-height:0;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Automated email notice -->
                    <tr>
                        <td align="center">
                            <p style="margin:0; font-size:11px; line-height:17px; color:#b0b5bd;">
                                This is an automated notification from Logged.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>

            `,
        });
    } catch (error) {
        console.error("Failed to send error alert email:", error);
        throw error;
    }
}

export interface WeeklyDigestItem {
    level: string;
    count: number;
}

export interface WeeklyDigestProjectSummary {
    projectName: string;
    projectId: string;
    totalLogs: number;
    errors: number;
    warnings: number;
    env: string | null;
}

export interface WeeklyDigestRecentError {
    message: string;
    projectName: string;
    projectId: string;
    logId: string;
    createdAt: Date;
    level: string;
}

export interface WeeklyDigestSummary {
    totalLogs: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    breakdown: WeeklyDigestItem[];
    projectSummaries: WeeklyDigestProjectSummary[];
    recentErrors: WeeklyDigestRecentError[];
    periodStart: Date;
}

export async function sendWeeklyDigestEmail({
    to,
    userName,
    summary,
}: {
    to: string;
    userName: string;
    summary: WeeklyDigestSummary;
}) {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const periodStartStr = summary.periodStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const breakdownIcons: Record<string, string> = {
        error: "#EF4444",
        warn: "#F59E0B",
        info: "#3B82F6",
        debug: "#8B5CF6",
        success: "#10B981",
        log: "#6B7280",
    };

    function levelColor(level: string): string {
        return breakdownIcons[level] || "#6B7280";
    }



    const recentErrorItems = summary.recentErrors
        .map((err) => {
            const logUrl = `${appUrl}/dashboard/projects/${err.projectId}/logs`;
            return `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 12px 16px; vertical-align: top;">
                        <div style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${levelColor(err.level)}; margin-right: 8px;"></div>
                        <a href="${logUrl}" style="color: #0F172A; text-decoration: none;">${err.message}</a>
                    </td>
                    <td style="padding: 12px 16px; color: #64748B; font-size: 14px;">${err.projectName}</td>
                    <td style="padding: 12px 16px; color: #94A3B8; font-size: 13px; text-align: right;">${new Date(err.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                </tr>`;
        })
        .join("");

    const dashboardUrl = `${appUrl}/dashboard`;

    try {
        await resend.emails.send({
            from: "Logged <logged@info.oheo.site>",
            to,
            subject: `Weekly Digest — ${periodStartStr}`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Logged — Weekly Digest</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7; margin:0; padding:0;">
        <tr>
            <td align="center" style="padding:48px 20px;">

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
                    <tr>
                        <td style="padding:0 0 20px 4px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td valign="middle" style="padding-right:9px;">
                                        <img
                                            src="https://logged.oheo.site/logo/logo.png"
                                            width="28"
                                            height="28"
                                            alt="Logged"
                                            style="display:block; width:28px; height:28px; border:0; outline:none; text-decoration:none; border-radius:7px;"
                                        >
                                    </td>
                                    <td valign="middle">
                                        <span style="font-size:20px; line-height:28px; font-weight:700; letter-spacing:-0.4px; color:#111827;">
                                            Logged
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 28px 36px; border-bottom:1px solid #f0f1f3;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:5px 9px;">
                                                    <span style="font-size:11px; line-height:16px; font-weight:700; color:#047857; letter-spacing:0.04em; text-transform:uppercase;">
                                                        Weekly digest
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <h1 style="margin:18px 0 8px 0; padding:0; font-size:24px; line-height:32px; font-weight:700; letter-spacing:-0.5px; color:#111827;">
                                            Your summary for ${periodStartStr}
                                        </h1>

                                        <p style="margin:0; padding:0; font-size:14px; line-height:22px; color:#6b7280;">
                                            Here's a snapshot of your activity since <strong style="color:#111827;">${periodStartStr}</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 36px 36px;">
                                        <p style="margin:0 0 18px 0; font-size:15px; line-height:24px; color:#374151;">
                                            Hi <strong style="color:#111827;">${userName}</strong>,
                                        </p>

                                        <p style="margin:0 0 28px 0; font-size:15px; line-height:24px; color:#4b5563;">
                                            Your Logged activity overview is ready. Review the totals below and jump back into your dashboard when you are ready.
                                        </p>

                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                                            <tr>
                                                <td width="50%" style="padding:0 8px 8px 0; vertical-align:top;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px;">
                                                        <tr>
                                                            <td style="padding:18px 20px;">
                                                                <p style="margin:0 0 10px 0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                                    Total logs
                                                                </p>
                                                                <p style="margin:0; font-size:28px; line-height:32px; font-weight:700; letter-spacing:-0.4px; color:#111827;">
                                                                    ${summary.totalLogs.toLocaleString()}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td width="50%" style="padding:0 0 8px 8px; vertical-align:top;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px;">
                                                        <tr>
                                                            <td style="padding:18px 20px;">
                                                                <p style="margin:0 0 10px 0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                                    Errors
                                                                </p>
                                                                <p style="margin:0; font-size:28px; line-height:32px; font-weight:700; letter-spacing:-0.4px; color:#b91c1c;">
                                                                    ${summary.totalErrors.toLocaleString()}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="50%" style="padding:0 8px 0 0; vertical-align:top;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px;">
                                                        <tr>
                                                            <td style="padding:18px 20px;">
                                                                <p style="margin:0 0 10px 0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                                    Warnings
                                                                </p>
                                                                <p style="margin:0; font-size:28px; line-height:32px; font-weight:700; letter-spacing:-0.4px; color:#d97706;">
                                                                    ${summary.totalWarnings.toLocaleString()}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td width="50%" style="padding:0 0 0 8px; vertical-align:top;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px;">
                                                        <tr>
                                                            <td style="padding:18px 20px;">
                                                                <p style="margin:0 0 10px 0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                                    Info
                                                                </p>
                                                                <p style="margin:0; font-size:28px; line-height:32px; font-weight:700; letter-spacing:-0.4px; color:#2563eb;">
                                                                    ${summary.totalInfo.toLocaleString()}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        ${summary.recentErrors.length > 0
                                            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                                                    <tr>
                                                        <td style="background-color:#fafafa; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                                <tr>
                                                                    <td style="padding:18px 20px 10px 20px;">
                                                                        <p style="margin:0; font-size:11px; line-height:16px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.06em;">
                                                                            Recent errors
                                                                        </p>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding:0 0 6px 0;">
                                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                                            ${recentErrorItems}
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>`
                                            : ""
                                        }

                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="border-radius:7px; background-color:#111827;">
                                                    <a
                                                        href="${dashboardUrl}"
                                                        style="display:inline-block; padding:12px 18px; font-size:14px; line-height:20px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:7px;"
                                                    >
                                                        View dashboard
                                                        <span style="padding-left:5px;">→</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:20px 0 0 0; font-size:12px; line-height:19px; color:#9ca3af;">
                                            You can review the full timeline, stack traces, and environment details from your Logged dashboard.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color:#fafafa; border-top:1px solid #f0f1f3; padding:28px 36px;">
                                        <p style="margin:0 0 10px 0; font-size:13px; line-height:20px; color:#6b7280;">
                                            Want to change what you get alerted about?
                                            <a
                                                href="${appUrl}/dashboard/settings"
                                                style="color:#374151; font-weight:600; text-decoration:underline;"
                                            >
                                                Manage notification settings
                                            </a>
                                        </p>

                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
                                            <tr>
                                                <td style="height:1px; background-color:#e5e7eb; font-size:0; line-height:0;">
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        </table>

                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td valign="middle" style="padding-right:8px;">
                                                    <img
                                                        src="https://logged.oheo.site/logo/logo.png"
                                                        width="20"
                                                        height="20"
                                                        alt="Logged"
                                                        style="display:block; width:20px; height:20px; border:0; outline:none; text-decoration:none; border-radius:5px;"
                                                    >
                                                </td>
                                                <td valign="middle">
                                                    <span style="font-size:13px; line-height:20px; font-weight:600; color:#374151;">
                                                        Logged
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:8px 0 16px 0; font-size:12px; line-height:18px; color:#9ca3af;">
                                            Offered by
                                            <a
                                                href="https://oheo.site"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style="color:#6b7280; font-weight:600; text-decoration:none;"
                                            >
                                                Oheo
                                            </a>
                                        </p>

                                        <p style="margin:0; font-size:11px; line-height:17px; color:#b0b5bd;">
                                            © ${new Date().getFullYear()} Logged. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="height:24px; font-size:0; line-height:0;">
                            &nbsp;
                        </td>
                    </tr>

                    <tr>
                        <td align="center">
                            <p style="margin:0; font-size:11px; line-height:17px; color:#b0b5bd;">
                                This is an automated notification from Logged.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>
            `,
        });
    } catch (error) {
        console.error("Failed to send weekly digest email:", error);
        throw error;
    }
}

export async function sendAdminUnauthorizedAlertEmail({
    to,
    attemptedPath,
    ipAddress,
    userEmail,
    userId,
    timestamp,
}: {
    to: string[];
    attemptedPath: string;
    ipAddress: string;
    userEmail?: string;
    userId?: string;
    timestamp: string;
}) {
    const recipients = Array.from(new Set(to.map((e) => e.trim().toLowerCase()).filter(Boolean)));
    if (recipients.length === 0) return;

    try {
        await resend.emails.send({
            from: "Logged Security <logged@info.oheo.site>",
            to: recipients,
            subject: `🚨 [SECURITY ALERT] Unauthorized Admin Access Attempt (403 Forbidden)`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="margin-bottom: 24px;">
                        <h2 style="color: #dc2626; margin: 0; font-size: 20px; font-weight: 700;">🚨 Security Alert: Unauthorized Admin Access</h2>
                    </div>
                    <p style="color: #374151; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
                        An unauthorized access attempt to an administrative resource was detected and blocked with a <strong>403 Forbidden</strong> response.
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
                        <tr>
                            <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; width: 35%;">Resource / Path</td>
                            <td style="padding: 10px 12px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; font-family: monospace;">${attemptedPath}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb;">IP Address</td>
                            <td style="padding: 10px 12px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; font-family: monospace;">${ipAddress}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb;">User Email</td>
                            <td style="padding: 10px 12px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb;">${userEmail || "Unauthenticated / Anonymous"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb;">User ID</td>
                            <td style="padding: 10px 12px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; font-family: monospace;">${userId || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb;">Timestamp</td>
                            <td style="padding: 10px 12px; background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb;">${timestamp}</td>
                        </tr>
                    </table>
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        This is an automated security alert sent by Logged Admin Protection.
                    </p>
                </div>
            `,
        });
    } catch (err) {
        console.error("Failed to send admin unauthorized security alert email:", err);
    }
}

export async function sendWelcomeEmail({
    to,
    userName,
}: {
    to: string;
    userName?: string | null;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
        return { success: false, error: "RESEND_API_KEY is not configured" };
    }

    const appUrl = APP_URL || "https://logged.oheo.site";
    const displayName = userName?.trim() ? userName.trim() : "there";
    const currentYear = new Date().getFullYear();

    try {
        const result = await resend.emails.send({
            from: "Logged <logged@info.oheo.site>",
            to,
            subject: "Welcome to Logged",
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to Logged</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7; margin:0; padding:0;">
        <tr>
            <td align="center" style="padding:48px 20px;">

                <!-- Main container -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">

                    <!-- Brand Header -->
                    <tr>
                        <td style="padding:0 0 20px 4px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td valign="middle" style="padding-right:9px;">
                                        <img
                                            src="https://logged.oheo.site/logo/logo.png"
                                            width="32"
                                            height="32"
                                            alt="Logged"
                                            style="display:block; width:32px; height:32px; border:0; outline:none; text-decoration:none; border-radius:8px;"
                                        >
                                    </td>
                                    <td valign="middle">
                                        <span style="font-size:22px; line-height:28px; font-weight:800; letter-spacing:-0.5px; color:#424A55;">
                                            Logged
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main card -->
                    <tr>
                        <td style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">

                            <!-- Header banner -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:36px 36px 28px 36px; border-bottom:1px solid #f0f1f3; background: linear-gradient(180deg, #fbfcfe 0%, #ffffff 100%);">

                                        <h1 style="margin:20px 0 8px 0; padding:0; font-size:26px; line-height:34px; font-weight:800; letter-spacing:-0.6px; color:#111827;">
                                            Welcome to Logged, ${displayName}!
                                        </h1>

                                        <p style="margin:0; padding:0; font-size:15px; line-height:24px; color:#4b5563;">
                                            We're excited to have you on board. Logged gives you centralized log streaming, instant error detection, and real-time observability across all your applications.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <!-- Content body -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:32px 36px 36px 36px;">

                                        <!-- Subtitle -->
                                        <h2 style="margin:0 0 16px 0; font-size:16px; font-weight:700; color:#111827; letter-spacing:-0.2px;">
                                            Quick Start Guide: Get Up &amp; Running in 3 Steps
                                        </h2>

                                        <!-- Steps Container -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">

                                            <!-- Step 1 -->
                                            <tr>
                                                <td valign="top" style="padding-bottom:18px;">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td valign="top" style="width:32px;">
                                                                <div style="width:24px; height:24px; border-radius:50%; background-color:#f1f5f9; border:1px solid #cbd5e1; text-align:center; line-height:24px; font-size:12px; font-weight:700; color:#475569;">1</div>
                                                            </td>
                                                            <td valign="top" style="padding-left:10px;">
                                                                <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#111827;">Create your first project</p>
                                                                <p style="margin:0; font-size:13px; line-height:20px; color:#6b7280;">Go to your dashboard, create a new project, and get an ingestion API key instantly.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Step 2 -->
                                            <tr>
                                                <td valign="top" style="padding-bottom:18px;">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td valign="top" style="width:32px;">
                                                                <div style="width:24px; height:24px; border-radius:50%; background-color:#f1f5f9; border:1px solid #cbd5e1; text-align:center; line-height:24px; font-size:12px; font-weight:700; color:#475569;">2</div>
                                                            </td>
                                                            <td valign="top" style="padding-left:10px;">
                                                                <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#111827;">Install the SDK</p>
                                                                <p style="margin:0; font-size:13px; line-height:20px; color:#6b7280;">Plug our lightweight library into your Node.js, Next.js, or browser apps.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Step 3 -->
                                            <tr>
                                                <td valign="top">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td valign="top" style="width:32px;">
                                                                <div style="width:24px; height:24px; border-radius:50%; background-color:#f1f5f9; border:1px solid #cbd5e1; text-align:center; line-height:24px; font-size:12px; font-weight:700; color:#475569;">3</div>
                                                            </td>
                                                            <td valign="top" style="padding-left:10px;">
                                                                <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#111827;">Stream logs &amp; monitor in real time</p>
                                                                <p style="margin:0; font-size:13px; line-height:20px; color:#6b7280;">Inspect live log streams, filter by severity, and receive automated alerts before users notice.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                        </table>

                                        <!-- Call to Action Button -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="border-radius:8px; background-color:#111827;">
                                                                <a
                                                                    href="${appUrl}/dashboard"
                                                                    style="display:inline-block; padding:14px 28px; font-size:15px; line-height:20px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:8px; letter-spacing:-0.2px;"
                                                                >
                                                                    Go to Dashboard →
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Help note -->
                                        <p style="margin:28px 0 0 0; text-align:center; font-size:13px; line-height:20px; color:#6b7280;">
                                            Need help or have questions? Check out our
                                            <a href="${appUrl}/docs" style="color:#2563eb; text-decoration:underline;">documentation</a>
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:28px 0 0 0; text-align:center;">
                            <p style="margin:0 0 8px 0; font-size:12px; line-height:18px; color:#9ca3af;">
                                © ${currentYear} Logged. Offered by <a href="https://oheo.site" style="color:#525D6D; text-decoration:underline">Oheo</a>.
                            </p>
                            <p style="margin:0; font-size:12px; line-height:18px; color:#9ca3af;">
                                You received this email because an account was registered with <strong style="color:#6b7280;">${to}</strong>.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
            `,
        });

        if (result.error) {
            console.error("Resend error sending welcome email:", result.error);
            return { success: false, error: result.error };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        return { success: false, error };
    }
}
