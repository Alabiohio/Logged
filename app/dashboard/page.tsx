"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FolderKanban,
    FileText,
    AlertTriangle,
    AlertCircle,
    ChevronRight,
    Clock,
    Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { LogLevelBadge } from "@/components/dashboard/log-level-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCardSkeleton, LogRowSkeleton, ProjectCardSkeleton } from "@/components/dashboard/skeleton";
import { motion } from "framer-motion";

type DashboardData = {
    stats: {
        projects: number;
        logsToday: number;
        errorsToday: number;
        warningsToday: number;
    };
    recentLogs: {
        id: string;
        projectId: string;
        level: string;
        message: string;
        environment: string | null;
        createdAt: string;
        projectName: string;
    }[];
    projects: {
        id: string;
        name: string;
        description: string | null;
        updatedAt: string;
    }[];
};

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/dashboard/stats");
                if (res.ok) {
                    setData(await res.json());
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 px-3 py-6 sm:px-3 lg:px-8"
            >
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text">Something went wrong</h2>
                    <p className="mt-2 text-text-secondary">
                        We couldn&apos;t load your dashboard.
                    </p>
                    <button
                        onClick={() => {
                            setError(false);
                            setLoading(true);
                            fetch("/api/dashboard/stats")
                                .then((r) => r.json())
                                .then((d) => setData(d))
                                .catch(() => setError(true))
                                .finally(() => setLoading(false));
                        }}
                        className="mt-6 inline-flex items-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                        Try again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 px-1 py-6 sm:px-1 lg:px-8"
        >
            {/* Header */}
            <section className="flex flex-col gap-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-text">
                            Welcome back
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                            Monitor project health, inspect live logs, and respond to issues
                            from one central view.
                        </p>
                    </div>
                </motion.div>

                {/* Stats grid */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: {
                            transition: { staggerChildren: 0.08 },
                        },
                    }}
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {loading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                                <StatCard
                                    label="Projects"
                                    value={data?.stats.projects ?? 0}
                                    icon={FolderKanban}
                                    iconColor="text-primary"
                                    iconBg="bg-primary/10"
                                />
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                                <StatCard
                                    label="Logs Today"
                                    value={data?.stats.logsToday?.toLocaleString() ?? "0"}
                                    icon={FileText}
                                    iconColor="text-info"
                                    iconBg="bg-info/10"
                                />
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                                <StatCard
                                    label="Errors Today"
                                    value={data?.stats.errorsToday ?? 0}
                                    icon={AlertTriangle}
                                    iconColor="text-error"
                                    iconBg="bg-error/10"
                                />
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                                <StatCard
                                    label="Warnings"
                                    value={data?.stats.warningsToday ?? 0}
                                    icon={AlertCircle}
                                    iconColor="text-warning"
                                    iconBg="bg-warning/10"
                                />
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </section>

            {/* No projects empty state */}
            {!loading && data && data.stats.projects === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title="No projects yet"
                    description="Create your first project and start monitoring your application."
                    actionLabel="Create Project"
                    actionHref="/dashboard/projects/new"
                />
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
                    {/* Recent Activity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass rounded-[var(--radius-lg)] py-6 px-3 shadow-sm min-w-0"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="mt-2 text-2xl font-black text-text">
                                    Recent logs
                                </h2>
                            </div>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            {loading ? (
                                <div>
                                    {[...Array(5)].map((_, i) => (
                                        <LogRowSkeleton key={i} />
                                    ))}
                                </div>
                            ) : data && data.recentLogs.length > 0 ? (
                                <>
                                    {/* Mobile card layout */}
                                    <div className="sm:hidden divide-y divide-border/30">
                                        {data.recentLogs.map((log) => (
                                            <motion.div
                                                key={log.id}
                                                whileHover={{ x: 4 }}
                                                className="py-3 cursor-pointer hover:bg-white/5 transition-colors rounded-lg px-1"
                                                onClick={() =>
                                                    (window.location.href = `/dashboard/projects/${log.projectId}/logs`)
                                                }
                                            >
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <LogLevelBadge level={log.level} />
                                                    <span className="text-xs text-text-muted font-mono ml-auto">
                                                        {timeAgo(log.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text font-medium truncate">
                                                    {log.message}
                                                </p>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {log.projectName}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Desktop table layout */}
                                    <table className="hidden sm:table min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 text-text-secondary">
                                                <th className="pb-4 pr-3 font-semibold">Time</th>
                                                <th className="pb-4 pr-3 font-semibold">Level</th>
                                                <th className="pb-4 pr-3 font-semibold">Message</th>
                                                <th className="pb-4 font-semibold">Project</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {data.recentLogs.map((log) => (
                                                <motion.tr
                                                    key={log.id}
                                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                                    className="transition-colors cursor-pointer"
                                                    onClick={() =>
                                                        (window.location.href = `/dashboard/projects/${log.projectId}/logs`)
                                                    }
                                                >
                                                    <td className="py-4 pr-3 text-text-muted font-mono whitespace-nowrap text-xs">
                                                        {timeAgo(log.createdAt)}
                                                    </td>
                                                    <td className="py-4 pr-3">
                                                        <LogLevelBadge level={log.level} />
                                                    </td>
                                                    <td className="py-4 pr-3 text-text font-medium max-w-xs truncate">
                                                        {log.message}
                                                    </td>
                                                    <td className="py-4 text-text-secondary whitespace-nowrap">
                                                        {log.projectName}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Clock className="h-10 w-10 text-text-muted/30 mb-3" />
                                    <p className="text-sm text-text-muted">
                                        No logs yet. Logs will appear here once your projects start sending data.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Recent Projects */}
                    <motion.aside
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-6 min-w-0"
                    >
                        <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-3 mb-6">
                                <div>
                                    <h3 className="mt-2 text-xl font-black text-text">
                                        Projects
                                    </h3>
                                </div>
                                <FolderKanban className="h-5 w-5 text-primary" />
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    <ProjectCardSkeleton />
                                    <ProjectCardSkeleton />
                                </div>
                            ) : data && data.projects.length > 0 ? (
                                <div className="space-y-3">
                                    {data.projects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            whileHover={{ x: 4, scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Link
                                                href={`/dashboard/projects/${project.id}`}
                                                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 transition hover:bg-glass-hover group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-text truncate group-hover:text-primary transition-colors">
                                                        {project.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-text-muted flex items-center gap-1.5">
                                                        <Activity className="h-3 w-3" />
                                                        {timeAgo(project.updatedAt)}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        </motion.div>
                                    ))}

                                    <Link
                                        href="/dashboard/projects"
                                        className="block text-center text-sm font-semibold text-primary hover:underline pt-2"
                                    >
                                        View all projects →
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    </motion.aside>
                </div>
            )}
        </motion.div>
    );
}

