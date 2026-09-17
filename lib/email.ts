import { Resend } from "resend";

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
