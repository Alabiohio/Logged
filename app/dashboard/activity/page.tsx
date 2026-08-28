"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    FileText,
    AlertTriangle,
    AlertCircle,
    Search,
    Filter,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { LogLevelBadge } from "@/components/dashboard/log-level-badge";
import { LogFilters } from "@/components/dashboard/log-filters";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LogRowSkeleton, StatCardSkeleton } from "@/components/dashboard/skeleton";

type ActivityLog = {
    id: string;
    projectId: string;
    level: string;
    message: string;
    metadata: unknown;
    environment: string | null;
    createdAt: string;
    projectName: string;
};

type ActivityData = {
    logs: ActivityLog[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        total: number;
    };
    stats: {
        total: number;
        errors: number;
        warnings: number;
    };
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

export default function ActivityPage() {
    const [data, setData] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const buildUrl = useCallback((cursor?: string | null) => {
        const params = new URLSearchParams(window.location.search);
        if (cursor) {
            params.set("cursor", cursor);
        } else {
            params.delete("cursor");
        }
        return `/api/activity?${params.toString()}`;
    }, []);

    const fetchActivity = useCallback(async (cursor?: string | null) => {
        try {
            const res = await fetch(buildUrl(cursor));
            if (res.ok) {
                const json = await res.json();
                setData((prev) => {
                    if (cursor && prev) {
                        return {
                            ...json,
                            logs: [...prev.logs, ...json.logs],
                        };
                    }
                    return json;
                });
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [buildUrl]);

    useEffect(() => {
        setLoading(true);
        setError(false);
        setData(null);
        fetchActivity();
    }, [window.location.search]);

    const handleLoadMore = () => {
        if (data?.pagination.hasMore && !loadingMore) {
            setLoadingMore(true);
            fetchActivity(data.pagination.nextCursor);
        }
    };

    const handleRetry = () => {
        setError(false);
        setLoading(true);
        fetchActivity();
    };

    if (error) {
        return (
            <div className="space-y-8 px-3 py-6 sm:px-3 lg:px-8">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text">Something went wrong</h2>
                    <p className="mt-2 text-text-secondary">
                        We couldn&apos;t load your activity feed.
                    </p>
                    <button
                        onClick={handleRetry}
                        className="mt-6 inline-flex items-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 px-1 py-6 sm:px-1 lg:px-8">
            {/* Header */}
            <section className="flex flex-col gap-4 py-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-text">
                        Activity
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                        A complete feed of logs across all your projects.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {loading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : data ? (
                        <>
                            <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/10">
                                    <FileText className="h-5 w-5 text-info" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-text">
                                        {data.stats.total.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">Total Logs</p>
                                </div>
                            </div>
                            <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-error/10">
                                    <AlertTriangle className="h-5 w-5 text-error" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-text">
                                        {data.stats.errors.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">Errors Today</p>
                                </div>
                            </div>
                            <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/10">
                                    <AlertCircle className="h-5 w-5 text-warning" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-text">
                                        {data.stats.warnings.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">Warnings Today</p>
                                </div>
                            </div>
                            <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                    <Filter className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-text">
                                        {data.pagination.total.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">Matching Logs</p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </section>

            {/* Filters */}
            {!loading && data && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            defaultValue={new URLSearchParams(window.location.search).get("search") || ""}
                            onChange={(e) => {
                                const params = new URLSearchParams(window.location.search);
                                if (e.target.value) {
                                    params.set("search", e.target.value);
                                } else {
                                    params.delete("search");
                                }
                                params.delete("cursor");
                                window.location.href = `/dashboard/activity?${params.toString()}`;
                            }}
                            className="w-full rounded-2xl border border-border bg-glass pl-12 pr-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <LogFilters />
                </div>
            )}

            {/* Logs */}
            {loading ? (
                <div className="glass rounded-[var(--radius-lg)] py-6 px-3 shadow-sm min-w-0">
                    <div className="space-y-0">
                        {[...Array(8)].map((_, i) => (
                            <LogRowSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ) : data && data.logs.length > 0 ? (
                <div className="glass rounded-[var(--radius-lg)] py-6 px-3 shadow-sm min-w-0">
                    <div className="overflow-x-auto">
                        {/* Mobile card layout */}
                        <div className="sm:hidden divide-y divide-border/30">
                            {data.logs.map((log) => (
                                <Link
                                    key={log.id}
                                    href={`/dashboard/projects/${log.projectId}/logs`}
                                    className="block py-3 cursor-pointer hover:bg-white/5 transition-colors rounded-lg px-1"
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
                                </Link>
                            ))}
                        </div>

                        {/* Desktop table layout */}
                        <table className="hidden sm:table min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-text-secondary">
                                    <th className="pb-4 pr-3 font-semibold">Time</th>
                                    <th className="pb-4 pr-3 font-semibold">Level</th>
                                    <th className="pb-4 pr-3 font-semibold">Message</th>
                                    <th className="pb-4 pr-3 font-semibold">Project</th>
                                    <th className="pb-4 font-semibold">Environment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {data.logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-white/10 transition-colors cursor-pointer"
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
                                        <td className="py-4 pr-3 text-text-secondary whitespace-nowrap">
                                            {log.projectName}
                                        </td>
                                        <td className="py-4 text-text-secondary whitespace-nowrap capitalize">
                                            {log.environment || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More */}
                    {data.pagination.hasMore && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-glass px-6 py-3 text-sm font-semibold text-text-secondary transition hover:bg-glass-hover hover:text-text disabled:opacity-50"
                            >
                                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loadingMore ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon={FileText}
                    title="No activity yet"
                    description="Logs will appear here once your projects start sending data."
                />
            )}
        </div>
    );
}
