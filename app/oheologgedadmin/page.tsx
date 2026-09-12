import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, FileText, FolderKanban, Mail, MessageSquareText, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import { count, desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { feedbacks, logs, projects, users } from "@/db/schema";

function getAdminEmails(): string[] {
    const envValue = [
        process.env.ADMIN_EMAILS,
        process.env.DEVELOPER_EMAIL,
        process.env.OHEO_LOGGED_ADMIN_EMAIL,
    ]
        .filter(Boolean)
        .join(",");

    return envValue
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

async function getOverviewStats() {
    const [
        totalUsers,
        verifiedUsers,
        totalProjects,
        totalLogs,
        totalErrors,
        totalWarnings,
        totalFeedback,
        recentFeedback,
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(eq(users.emailVerified, true)),
        db.select({ count: count() }).from(projects),
        db.select({ count: count() }).from(logs),
        db.select({ count: count() }).from(logs).where(eq(logs.level, "error")),
        db.select({ count: count() }).from(logs).where(eq(logs.level, "warn")),
        db.select({ count: count() }).from(feedbacks),
        db
            .select({
                id: feedbacks.id,
                category: feedbacks.category,
                rating: feedbacks.rating,
                message: feedbacks.message,
                email: feedbacks.email,
                isAnonymous: feedbacks.isAnonymous,
                createdAt: feedbacks.createdAt,
            })
            .from(feedbacks)
            .orderBy(desc(feedbacks.createdAt))
            .limit(8),
    ]);

    return {
        users: Number(totalUsers[0]?.count ?? 0),
        verifiedUsers: Number(verifiedUsers[0]?.count ?? 0),
        projects: Number(totalProjects[0]?.count ?? 0),
        logs: Number(totalLogs[0]?.count ?? 0),
        errors: Number(totalErrors[0]?.count ?? 0),
        warnings: Number(totalWarnings[0]?.count ?? 0),
        feedback: Number(totalFeedback[0]?.count ?? 0),
        recentFeedback,
    };
}

export default async function OheoLoggedAdminPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userEmail = session?.user?.email?.trim().toLowerCase();
    const allowedEmails = new Set(getAdminEmails());

    if (!session?.user || !userEmail || !allowedEmails.has(userEmail)) {
        redirect("/error/403");
    }

    const stats = await getOverviewStats();

    const statCards = [
        {
            label: "Users",
            value: stats.users.toLocaleString(),
            detail: `${stats.verifiedUsers.toLocaleString()} verified`,
            icon: Users,
            tone: "text-primary bg-primary/10",
        },
        {
            label: "Projects",
            value: stats.projects.toLocaleString(),
            detail: "active tracked apps",
            icon: FolderKanban,
            tone: "text-info bg-info/10",
        },
        {
            label: "Logs",
            value: stats.logs.toLocaleString(),
            detail: `${stats.errors.toLocaleString()} errors / ${stats.warnings.toLocaleString()} warnings`,
            icon: FileText,
            tone: "text-warning bg-warning/10",
        },
        {
            label: "Feedback",
            value: stats.feedback.toLocaleString(),
            detail: "submitted by users",
            icon: MessageSquareText,
            tone: "text-success bg-success/10",
        },
    ];

    return (
        <main className="min-h-screen bg-background text-text">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
                            Oheo Logged Admin
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Link
                            href="/oheologgedadmin/feedback"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                        >
                            <MessageSquareText className="h-4 w-4" />
                            View feedback
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background-secondary px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-primary/40 hover:text-text"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to dashboard
                        </Link>
                    </div>
                </div>

                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(({ label, value, detail, icon: Icon, tone }) => (
                        <div key={label} className="rounded-2xl border border-border bg-glass p-4 shadow-sm backdrop-blur-sm sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm text-text-secondary">{label}</p>
                                    <p className="mt-3 text-2xl font-black tracking-tight text-text sm:text-3xl">{value}</p>
                                </div>
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone} sm:h-12 sm:w-12`}>
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-text-muted break-words">{detail}</p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-2xl border border-border bg-glass p-4 shadow-sm backdrop-blur-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <Database className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-text">System overview</h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-background-secondary p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Verified emails</p>
                                <p className="mt-2 text-2xl font-black text-text">{stats.verifiedUsers.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-background-secondary p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Errors</p>
                                <p className="mt-2 text-2xl font-black text-error">{stats.errors.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-background-secondary p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Warnings</p>
                                <p className="mt-2 text-2xl font-black text-warning">{stats.warnings.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-background-secondary p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Feedback entries</p>
                                <p className="mt-2 text-2xl font-black text-success">{stats.feedback.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-glass p-4 shadow-sm backdrop-blur-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <h2 className="text-lg font-bold text-text">Session</h2>
                        </div>

                        <div className="space-y-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary p-3">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="truncate">{session.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary p-3">
                                <Users className="h-4 w-4 text-info" />
                                <span>{stats.users.toLocaleString()} total users</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary p-3">
                                <TriangleAlert className="h-4 w-4 text-warning" />
                                <span>{stats.errors.toLocaleString()} critical errors tracked</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 rounded-2xl border border-border bg-glass p-4 shadow-sm backdrop-blur-sm sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <MessageSquareText className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-text">Recent feedback</h2>
                    </div>

                    {stats.recentFeedback.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-background-secondary p-6 text-sm text-text-secondary">
                            No feedback has been submitted yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentFeedback.map((item) => (
                                <article key={item.id} className="rounded-xl border border-border bg-background-secondary p-4">
                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                                {item.category}
                                            </span>
                                            <span className="text-text-secondary">
                                                {item.rating ? `${item.rating}/5` : "No rating"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown date"}
                                        </p>
                                    </div>

                                    <p className="mb-2 text-sm leading-6 text-text break-words">{item.message}</p>

                                    <p className="text-xs text-text-muted break-all">
                                        {item.isAnonymous ? "Anonymous" : item.email || "No email provided"}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
