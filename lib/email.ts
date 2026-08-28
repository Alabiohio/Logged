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
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F9FAFB;">
                    <div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                        <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 40px 32px; text-align: center;">
                            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Logged</h1>
                            <div style="margin-top: 12px; display: inline-block; background-color: rgba(239, 68, 68, 0.15); color: #FCA5A5; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                                Error Alert
                            </div>
                        </div>
                        <div style="padding: 40px 32px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                                Hi <strong>${userName}</strong>,
                            </p>
                            <p style="color: #475569; font-size: 16px; margin: 0 0 28px 0; line-height: 1.6;">
                                Our monitors have detected a new error in your project <strong style="color: #0F172A; background-color: #F1F5F9; padding: 2px 6px; border-radius: 4px;">${projectName}</strong>. Here are the details:
                            </p>
                            
                            <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 0 8px 8px 0; padding: 20px; margin: 0 0 32px 0;">
                                <p style="color: #991B1B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0; font-weight: 700;">Error Details</p>
                                <p style="color: #7F1D1D; font-size: 14px; margin: 0; font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace; word-break: break-word; line-height: 1.6;">
                                    ${errorMessage}
                                </p>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${logUrl}" style="background-color: #0F172A; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);">
                                    View Log Details &rarr;
                                </a>
                            </div>
                        </div>
                        <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 32px; text-align: center;">
                            <p style="color: #64748B; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                                Want to change what you get alerted about?
                                <br />
                                Manage your <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard/settings" style="color: #3B82F6; font-weight: 500; text-decoration: none;">Notification Settings</a>.
                            </p>
                            <div style="height: 1px; background-color: #E2E8F0; width: 40px; margin: 24px auto;"></div>
                            <h2 style="color: #0F172A; font-weight: 700; font-size: 16px; margin: 0 0 8px 0; letter-spacing: -0.01em;">Logged</h2>
                            <p style="color: #94A3B8; font-size: 13px; margin: 0 0 20px 0;">Offered by <a href='https://oheo.site' target="_blank" rel="noopener noreferrer" style="color: #3B82F6; font-weight: 500; text-decoration: none;">Oheo</a></p>
                            <p style="color: #CBD5E1; font-size: 12px; margin: 0;">
                                &copy; ${new Date().getFullYear()} Logged. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
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

    function levelTextColor(level: string): string {
        const colorMap: Record<string, string> = {
            error: "#DC2626",
            warn: "#D97706",
            info: "#2563EB",
            debug: "#7C3AED",
            success: "#059669",
            log: "#4B5563",
        };
        return colorMap[level] || "#4B5563";
    }

    const projectRows = summary.projectSummaries
        .map((p) => {
            const projectUrl = `${appUrl}/dashboard/projects/${p.projectId}/logs`;
            return `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 12px 16px; vertical-align: top;">
                        <a href="${projectUrl}" style="color: #0F172A; font-weight: 600; text-decoration: none;">${p.projectName}</a>
                        ${p.env ? `<span style="color: #94A3B8; font-size: 12px; margin-left: 6px;">(${p.env})</span>` : ""}
                    </td>
                    <td style="padding: 12px 16px; text-align: right; color: #64748B;">${p.totalLogs}</td>
                    <td style="padding: 12px 16px; text-align: right; color: #DC2626;">${p.errors}</td>
                    <td style="padding: 12px 16px; text-align: right; color: #D97706;">${p.warnings}</td>
                </tr>`;
        })
        .join("");

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
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F9FAFB;">
                    <div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
                            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Logged</h1>
                            <div style="margin-top: 12px; display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #DCFCE7; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                                Weekly Digest
                            </div>
                        </div>
                        <div style="padding: 40px 32px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                                Hi <strong>${userName}</strong>,
                            </p>
                            <p style="color: #475569; font-size: 16px; margin: 0 0 28px 0; line-height: 1.6;">
                                Here's your weekly summary for activity since <strong>${periodStartStr}</strong>.
                            </p>

                            <!-- Overview Stats -->
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 0 0 28px 0;">
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E2E8F0;">
                                    <p style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin: 0;">Total Logs</p>
                                    <p style="color: #0F172A; font-size: 32px; font-weight: 800; margin: 4px 0 0 0;">${summary.totalLogs.toLocaleString()}</p>
                                </div>
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E2E8F0;">
                                    <p style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin: 0;">Errors</p>
                                    <p style="color: #DC2626; font-size: 32px; font-weight: 800; margin: 4px 0 0 0;">${summary.totalErrors.toLocaleString()}</p>
                                </div>
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E2E8F0;">
                                    <p style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin: 0;">Warnings</p>
                                    <p style="color: #D97706; font-size: 32px; font-weight: 800; margin: 4px 0 0 0;">${summary.totalWarnings.toLocaleString()}</p>
                                </div>
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E2E8F0;">
                                    <p style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin: 0;">Info</p>
                                    <p style="color: #2563EB; font-size: 32px; font-weight: 800; margin: 4px 0 0 0;">${summary.totalInfo.toLocaleString()}</p>
                                </div>
                            </div>

                            <!-- Per-Project Breakdown -->
                            <h2 style="color: #0F172A; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">Project Breakdown</h2>
                            ${
                                summary.projectSummaries.length > 0
                                    ? `<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
                                        <thead>
                                            <tr>
                                                <th style="text-align: left; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Project</th>
                                                <th style="text-align: right; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Logs</th>
                                                <th style="text-align: right; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Errors</th>
                                                <th style="text-align: right; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Warnings</th>
                                            </tr>
                                        </thead>
                                        <tbody>${projectRows}</tbody>
                                    </table>`
                                    : '<p style="color: #94A3B8; font-size: 14px; margin: 0 0 28px 0;">No log activity this week.</p>'
                            }

                            <!-- Recent Errors -->
                            ${
                                summary.recentErrors.length > 0
                                    ? `<h2 style="color: #0F172A; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">Recent Errors</h2>
                                       <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
                                           <thead>
                                               <tr>
                                                   <th style="text-align: left; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Error</th>
                                                   <th style="text-align: left; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Project</th>
                                                   <th style="text-align: right; padding: 12px 16px; color: #94A3B8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Time</th>
                                               </tr>
                                           </thead>
                                           <tbody>${recentErrorItems}</tbody>
                                       </table>`
                                    : ""
                            }

                            <!-- CTA -->
                            <div style="text-align: center; padding: 0 0 12px 0;">
                                <a href="${dashboardUrl}" style="background-color: #10B981; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">
                                    View Dashboard &rarr;
                                </a>
                            </div>
                        </div>
                        <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 32px; text-align: center;">
                            <p style="color: #64748B; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                                Want to change what you get alerted about?
                                <br />
                                Manage your <a href="${appUrl}/dashboard/settings" style="color: #3B82F6; font-weight: 500; text-decoration: none;">Notification Settings</a>.
                            </p>
                            <div style="height: 1px; background-color: #E2E8F0; width: 40px; margin: 24px auto;"></div>
                            <h2 style="color: #0F172A; font-weight: 700; font-size: 16px; margin: 0 0 8px 0; letter-spacing: -0.01em;">Logged</h2>
                            <p style="color: #94A3B8; font-size: 13px; margin: 0 0 20px 0;">Offered by <a href='https://oheo.site' style="color: #0F172A;">Oheo</a></p>
                            <p style="color: #CBD5E1; font-size: 12px; margin: 0;">
                                &copy; ${new Date().getFullYear()} Logged. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send weekly digest email:", error);
        throw error;
    }
}
