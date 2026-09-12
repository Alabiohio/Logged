import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, ShieldAlert } from "lucide-react";
import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { feedbacks } from "@/db/schema";

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

export default async function OheoLoggedFeedbackPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userEmail = session?.user?.email?.trim().toLowerCase();
    const allowedEmails = new Set(getAdminEmails());

    if (!session?.user || !userEmail || !allowedEmails.has(userEmail)) {
        redirect("/error/403");
    }

    const recentFeedback = await db
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
        .limit(50);

    return (
        <main className="min-h-screen bg-background text-text">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Admin only
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
                            Feedback submissions
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/oheologgedadmin"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background-secondary px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-primary/40 hover:text-text"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to admin
                        </Link>
                    </div>
                </div>

                <section className="rounded-2xl border border-border bg-glass p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <MessageSquareText className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-text">Latest feedback</h2>
                    </div>

                    {recentFeedback.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-background-secondary p-6 text-sm text-text-secondary">
                            No feedback has been submitted yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentFeedback.map((item) => (
                                <article key={item.id} className="rounded-xl border border-border bg-background-secondary p-4">
                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 text-sm">
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

                                    <p className="mb-2 text-sm leading-6 text-text">{item.message}</p>

                                    <p className="text-xs text-text-muted">
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
