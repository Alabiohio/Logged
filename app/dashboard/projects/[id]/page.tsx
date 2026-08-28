"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    AlertTriangle,
    Info,
    Bug,
    CheckCircle2,
    FileText,
    Pencil,
    Trash2,
    Loader2,
    Globe,
    Calendar,
    Clock,
    ChevronRight,
    AlertCircle,
    ShieldX,
} from "lucide-react";
import { ApiKeyCard } from "@/components/ApiKeyCard";
import { LogLevelBadge } from "@/components/dashboard/log-level-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardSkeleton, LogRowSkeleton } from "@/components/dashboard/skeleton";

type LogRecord = {
    id: string;
    level: string;
    message: string;
    environment: string | null;
    createdAt: string;
};

type Project = {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    apiKeys: { id: string; environment: string; key: string }[];
    stats?: { total: number; error: number; warn: number; info: number };
    recentLogs?: LogRecord[];
    latestError?: LogRecord | null;
    createdAt: string;
    updatedAt: string;
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function ProjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [forbidden, setForbidden] = useState(false);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        website: "",
    });
    const [saving, startSave] = useTransition();

    // Delete state
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [deleting, startDelete] = useTransition();

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (res.status === 403) {
                    setForbidden(true);
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    setProject(data);
                    setEditForm({
                        name: data.name,
                        description: data.description ?? "",
                        website: data.website ?? "",
                    });
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        startSave(async () => {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                const updated = await res.json();
                setProject(updated);
                setEditing(false);
            }
        });
    };

    const handleDelete = () => {
        startDelete(async () => {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                router.push("/dashboard/projects");
            }
        });
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {/* Back link skeleton */}
                <div className="h-5 w-24 rounded bg-border-secondary animate-pulse" />

                {/* Header skeleton */}
                <div className="rounded-3xl border border-border bg-glass p-6 space-y-4">
                    <div className="h-7 w-48 rounded bg-border-secondary animate-pulse" />
                    <div className="h-5 w-64 rounded bg-border-secondary animate-pulse" />
                </div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Recent logs skeleton */}
                <div className="glass rounded-[var(--radius-lg)] p-6">
                    <div className="h-6 w-32 rounded bg-border-secondary animate-pulse mb-4" />
                    {[...Array(3)].map((_, i) => (
                        <LogRowSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (forbidden) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mb-4">
                    <ShieldX className="h-8 w-8 text-error" />
                </div>
                <h2 className="text-xl font-bold text-text">Access Denied</h2>
                <p className="mt-2 max-w-sm text-text-secondary">
                    You do not have permission to view this project. It belongs to another account.
                </p>
                <Link
                    href="/dashboard/projects"
                    className="mt-4 text-sm text-primary hover:underline"
                >
                    Back to Projects
                </Link>
            </div>
        );
    }

    if (notFound || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-xl font-bold text-text">Project not found</h2>
                <Link
                    href="/dashboard/projects"
                    className="mt-4 text-sm text-primary hover:underline"
                >
                    Back to Projects
                </Link>
            </div>
        );
    }

    const quickStats = [
        {
            label: "Total Logs",
            value: project.stats?.total?.toLocaleString() || "0",
            icon: FileText,
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
        },
        {
            label: "Errors",
            value: project.stats?.error?.toString() || "0",
            icon: AlertTriangle,
            iconColor: "text-error",
            iconBg: "bg-error/10",
        },
        {
            label: "Warnings",
            value: project.stats?.warn?.toString() || "0",
            icon: Bug,
            iconColor: "text-warning",
            iconBg: "bg-warning/10",
        },
        {
            label: "Info",
            value: project.stats?.info?.toString() || "0",
            icon: Info,
            iconColor: "text-info",
            iconBg: "bg-info/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Back link */}
            <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                All Projects
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-3xl border border-border bg-glass p-6">
                <div className="space-y-3 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-black text-text break-all">
                            {project.name}
                        </h1>
                    </div>
                    {project.description && (
                        <p className="text-text-secondary max-w-xl">
                            {project.description}
                        </p>
                    )}
                    <div className="flex items-center gap-6 flex-wrap text-sm text-text-muted">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> Created{" "}
                            {formatDate(project.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" /> Updated{" "}
                            {timeAgo(project.updatedAt)}
                        </span>
                        {project.website && (
                            <a
                                href={project.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-primary hover:underline break-all"
                            >
                                <Globe className="h-4 w-4 flex-shrink-0" /> {project.website}
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <Link
                        href={`/dashboard/projects/${project.id}/logs`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                        <FileText className="h-4 w-4" />
                        View Logs
                    </Link>
                    <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-glass-hover"
                    >
                        <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                        onClick={() => setDeleteModal(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-error/30 bg-error/5 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/10"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        iconColor={stat.iconColor}
                        iconBg={stat.iconBg}
                    />
                ))}
            </div>

            {/* Recent Logs + Latest Error */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                {/* Recent Logs */}
                <section className="glass rounded-[var(--radius-lg)] p-6 shadow-sm min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-text">Recent Logs</h2>
                        <Link
                            href={`/dashboard/projects/${project.id}/logs`}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            View all →
                        </Link>
                    </div>

                    {project.recentLogs && project.recentLogs.length > 0 ? (
                        <div className="divide-y divide-border/30">
                            {project.recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-4 py-3"
                                >
                                    <LogLevelBadge level={log.level} />
                                    <span className="flex-1 min-w-0 text-sm font-medium text-text truncate">
                                        {log.message}
                                    </span>
                                    <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                                        {timeAgo(log.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Clock className="h-10 w-10 text-text-muted/30 mb-3" />
                            <p className="text-sm text-text-muted">
                                No logs yet. Send your first log using @logged/sdk.
                            </p>
                            <Link
                                href="/docs"
                                className="mt-3 text-sm font-semibold text-primary hover:underline"
                            >
                                View Documentation
                            </Link>
                        </div>
                    )}
                </section>

                {/* Latest Error */}
                <section className="space-y-6 min-w-0">
                    {project.latestError ? (
                        <div className="rounded-3xl border border-error/20 bg-error/5 p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-error">
                                    Latest Error
                                </span>
                            </div>
                            <p className="font-semibold text-text break-words">
                                {project.latestError.message}
                            </p>
                            <p className="text-sm text-text-muted">
                                {timeAgo(project.latestError.createdAt)}
                            </p>
                            <Link
                                href={`/dashboard/projects/${project.id}/logs`}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-error hover:underline"
                            >
                                View details
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-success/20 bg-success/5 p-6 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-success">
                                    All Clear
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary">
                                No errors recorded for this project.
                            </p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="rounded-3xl border border-border bg-glass p-6 space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
                            Quick Actions
                        </p>
                        <div className="space-y-3">
                            <Link
                                href={`/dashboard/projects/${project.id}/logs`}
                                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-text transition hover:bg-glass-hover"
                            >
                                <span className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    View Logs
                                </span>
                                <ChevronRight className="h-4 w-4 text-text-muted" />
                            </Link>
                            <button
                                onClick={() => setEditing(true)}
                                className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-text transition hover:bg-glass-hover"
                            >
                                <span className="flex items-center gap-3">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Project Settings
                                </span>
                                <ChevronRight className="h-4 w-4 text-text-muted" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* API Keys */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-text">API Keys</h2>
                <div className="grid gap-4 lg:grid-cols-3">
                    {project.apiKeys?.map((apiKeyObj) => (
                        <ApiKeyCard
                            key={apiKeyObj.id}
                            apiKey={apiKeyObj.key}
                            environment={apiKeyObj.environment}
                            projectId={project.id}
                            onRegenerate={(env, newKey) => {
                                setProject((p) => {
                                    if (!p) return p;
                                    return {
                                        ...p,
                                        apiKeys: p.apiKeys.map((k) =>
                                            k.environment === env
                                                ? { ...k, key: newKey }
                                                : k
                                        ),
                                    };
                                });
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setEditing(false)}
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-background p-8 shadow-xl space-y-6">
                        <h2 className="text-xl font-black text-text">
                            Edit Project
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-border bg-glass px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-border bg-glass px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text">
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    value={editForm.website}
                                    onChange={(e) =>
                                        setEditForm((f) => ({
                                            ...f,
                                            website: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-border bg-glass px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="rounded-2xl border border-border px-5 py-2 text-sm font-semibold text-text-secondary hover:bg-glass-hover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                                >
                                    {saving && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal(false)}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-3xl border border-error/30 bg-background p-8 shadow-xl space-y-5">
                        <div className="flex items-center gap-3 text-error">
                            <Trash2 className="h-6 w-6" />
                            <h2 className="text-xl font-black">Delete Project</h2>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            This will permanently delete{" "}
                            <span className="font-semibold text-text">
                                {project.name}
                            </span>{" "}
                            and all associated logs. This action cannot be undone.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text">
                                Type{" "}
                                <span className="font-mono bg-background-tertiary px-1.5 py-0.5 rounded text-error">
                                    {project.name}
                                </span>{" "}
                                to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder={project.name}
                                className="w-full rounded-2xl border border-border bg-glass px-4 py-2.5 text-sm text-text outline-none focus:border-error focus:ring-2 focus:ring-error/20"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModal(false);
                                    setDeleteInput("");
                                }}
                                className="rounded-2xl border border-border px-5 py-2 text-sm font-semibold text-text-secondary hover:bg-glass-hover"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={
                                    deleteInput !== project.name || deleting
                                }
                                className="inline-flex items-center gap-2 rounded-2xl bg-error px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-red-600 transition"
                            >
                                {deleting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
