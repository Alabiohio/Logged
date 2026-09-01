"use client";

import { useEffect, useState, useCallback } from "react";
import {
    User, Shield, Bell, Globe, Save, Loader2, AlertCircle, CheckCircle2,
    Monitor, Smartphone, Laptop, Trash2, LogOut, Link2, Clock,
    Sun, Moon, Palette, Database, TriangleAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Session {
    id: string;
    token: string;
    createdAt: string | Date;
    expiresAt: string | Date;
    ipAddress?: string | null;
    userAgent?: string | null;
}

interface ConnectedAccount {
    id: string;
    providerId: string;
    createdAt: string | Date;
    accountId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDevice(ua: string | null | undefined): { icon: React.ReactNode; label: string } {
    if (!ua) return { icon: <Monitor className="h-4 w-4" />, label: "Unknown device" };
    const lower = ua.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
        return { icon: <Smartphone className="h-4 w-4" />, label: "Mobile" };
    }
    if (lower.includes("chrome")) return { icon: <Globe className="h-4 w-4" />, label: "Chrome" };
    if (lower.includes("firefox")) return { icon: <Monitor className="h-4 w-4" />, label: "Firefox" };
    if (lower.includes("safari")) return { icon: <Monitor className="h-4 w-4" />, label: "Safari" };
    return { icon: <Laptop className="h-4 w-4" />, label: "Desktop" };
}

function providerLabel(id: string): string {
    const map: Record<string, string> = {
        google: "Google",
        github: "GitHub",
        credential: "Email / Password",
    };
    return map[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

function providerColor(id: string): string {
    const map: Record<string, string> = {
        google: "bg-red-500/10 text-red-500 border-red-500/20",
        github: "bg-text/10 text-text border-border",
        credential: "bg-primary/10 text-primary border-primary/20",
    };
    return map[id] ?? "bg-info/10 text-info border-info/20";
}

const RETENTION_OPTIONS = [7, 14, 30, 60, 90, 180, 365];

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel, loading }: {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const [input, setInput] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative glass rounded-[var(--radius-lg)] p-6 shadow-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-error/10">
                        <TriangleAlert className="h-5 w-5 text-error" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-text">Delete Account</h3>
                        <p className="text-xs text-text-secondary">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                    All your projects, logs, and API keys will be permanently deleted.
                    Type <span className="font-mono font-bold text-error">delete</span> to confirm.
                </p>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="delete"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-error focus:ring-2 focus:ring-error/20 mb-4 font-mono"
                    autoFocus
                />
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-sm font-semibold text-text transition-all hover:bg-glass-hover disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={input !== "delete" || loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-40"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete Forever
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { data: sessionData, isPending: sessionLoading } = authClient.useSession();
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [savingPreference, setSavingPreference] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Profile form
    const [formData, setFormData] = useState({
        name: "",
        emailNotifications: true,
        errorAlerts: true,
        weeklyDigest: false,
        logRetentionDays: 90,
    });

    // Sessions
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [revokingToken, setRevokingToken] = useState<string | null>(null);
    const [revokeAllLoading, setRevokeAllLoading] = useState(false);

    // Connected accounts
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(false);

    // Danger zone
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchSessions = useCallback(async () => {
        setSessionsLoading(true);
        try {
            const res = await fetch("/api/user/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions ?? []);
            }
        } catch {
            // silently fail
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    const fetchAccounts = useCallback(async () => {
        setAccountsLoading(true);
        try {
            const res = await fetch("/api/user/accounts");
            if (res.ok) {
                const data = await res.json();
                setConnectedAccounts(data.accounts ?? []);
            }
        } catch {
            // silently fail
        } finally {
            setAccountsLoading(false);
        }
    }, []);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const res = await fetch("/api/user/preferences");
                if (res.ok) {
                    const data = await res.json();
                    setFormData((prev) => ({ ...prev, ...data.preferences }));
                }
            } catch {
                // silently fail
            }
        }

        if (sessionData?.user) {
            setFormData((prev) => ({ ...prev, name: sessionData.user.name || "" }));
            fetchPreferences();
            fetchSessions();
            fetchAccounts();
        }
    }, [sessionData, fetchSessions, fetchAccounts]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await authClient.updateUser({ name: formData.name });
            if (error) {
                setError(error.message || "Failed to update profile");
                return;
            }

            const prefRes = await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailNotifications: formData.emailNotifications,
                    errorAlerts: formData.errorAlerts,
                    weeklyDigest: formData.weeklyDigest,
                    logRetentionDays: formData.logRetentionDays,
                }),
            });

            if (!prefRes.ok) {
                setError("Failed to save preferences");
            } else {
                setSuccess("Settings saved successfully");
                setTimeout(() => setSuccess(null), 4000);
            }
        } catch {
            setError("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const savePreference = async (
        key: "emailNotifications" | "errorAlerts" | "weeklyDigest" | "logRetentionDays",
        value: boolean | number
    ) => {
        setSavingPreference(key);
        try {
            await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value }),
            });
        } catch {
            // silently fail
        } finally {
            setSavingPreference(null);
        }
    };

    const handleRevokeSession = async (token: string) => {
        setRevokingToken(token);
        try {
            const res = await fetch(`/api/user/sessions/${encodeURIComponent(token)}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSessions((prev) => prev.filter((s) => s.token !== token));
            }
        } catch {
            // silently fail
        } finally {
            setRevokingToken(null);
        }
    };

    const handleRevokeAll = async () => {
        setRevokeAllLoading(true);
        try {
            const res = await fetch("/api/user/sessions/all", { method: "DELETE" });
            if (res.ok) {
                await fetchSessions();
                setSuccess("All other sessions signed out");
                setTimeout(() => setSuccess(null), 4000);
            }
        } catch {
            // silently fail
        } finally {
            setRevokeAllLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (res.ok) {
                await authClient.signOut();
                router.push("/");
            } else {
                setError("Failed to delete account. Please try again.");
                setShowDeleteModal(false);
            }
        } catch {
            setError("Failed to delete account.");
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const user = sessionData?.user;
    const currentToken = sessionData?.session?.token;

    const settingsSections: Array<{
        id: string;
        label: string;
        icon: typeof User;
        parent?: string;
    }> = [
        { id: "profile", label: "Profile", icon: User },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "security-sessions", label: "Active Sessions", icon: Monitor, parent: "security" },
        { id: "account", label: "Account", icon: Database },
        { id: "danger", label: "Danger", icon: TriangleAlert },
    ];

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if (sessionLoading) {
        return (
            <div className="space-y-8 px-3 py-6 sm:px-3 lg:px-8">
                <div className="space-y-4">
                    <div className="h-8 w-48 rounded-xl bg-border animate-pulse" />
                    <div className="h-4 w-96 rounded-xl bg-border animate-pulse" />
                </div>
                <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-32 rounded bg-border animate-pulse" />
                            <div className="h-10 w-full rounded-xl bg-border animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {showDeleteModal && (
                <DeleteModal
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteModal(false)}
                    loading={deleteLoading}
                />
            )}

            <div className="space-y-8 px-3 py-6 sm:px-3 lg:px-8">
                {/* Header */}
                <section className="py-6">
                    <h1 className="text-3xl font-black tracking-tight text-text">Settings</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                        Manage your account, security, and preferences.
                    </p>
                </section>

                {error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        {success}
                    </div>
                )}

                <div className="glass rounded-[var(--radius-lg)] p-3 shadow-sm">
                    <nav aria-label="Settings categories" className="flex flex-wrap gap-2">
                        {settingsSections.map(({ id, label, icon: Icon, parent }) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                    parent
                                        ? "border-dashed border-border bg-background/20 text-text-secondary hover:border-primary/40 hover:text-text"
                                        : "border-border bg-background/30 text-text-secondary hover:border-primary/40 hover:bg-primary/5 hover:text-text"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* ── Profile ─────────────────────────────────────────── */}
                    <div id="profile" className="glass rounded-[var(--radius-lg)] p-6 shadow-sm scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-text">Profile</h2>
                                <p className="text-xs text-text-secondary">Your personal information</p>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full rounded-xl border border-border bg-background/30 px-4 py-2.5 text-sm text-text-secondary outline-none cursor-not-allowed"
                                />
                                <p className="text-xs text-text-muted">Email cannot be changed</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* ── Appearance ──────────────────────────────────────── */}
                    <div id="appearance" className="glass rounded-[var(--radius-lg)] p-6 shadow-sm scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-debug/10">
                                <Palette className="h-5 w-5 text-debug" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-text">Appearance</h2>
                                <p className="text-xs text-text-secondary">Choose your preferred theme</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {(["light", "system", "dark"] as const).map((t) => {
                                const icons = { light: Sun, system: Monitor, dark: Moon };
                                const labels = { light: "Light", system: "System", dark: "Dark" };
                                const Icon = icons[t];
                                const active = theme === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTheme(t)}
                                        className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                                            active
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-background/30 text-text-secondary hover:bg-glass-hover hover:text-text"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-semibold">{labels[t]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Notifications ───────────────────────────────────── */}
                    <div id="notifications" className="glass rounded-[var(--radius-lg)] p-6 shadow-sm scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/10">
                                <Bell className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-text">Notifications</h2>
                                <p className="text-xs text-text-secondary">Control how you receive updates</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {([
                                {
                                    key: "errorAlerts" as const,
                                    icon: Shield,
                                    title: "Error Alerts",
                                    desc: "Immediate email when an error-level log is received. Requires Email Notifications.",
                                },
                                {
                                    key: "emailNotifications" as const,
                                    icon: Bell,
                                    title: "Email Notifications",
                                    desc: "Master toggle for all email communication.",
                                },
                                {
                                    key: "weeklyDigest" as const,
                                    icon: Globe,
                                    title: "Weekly Digest",
                                    desc: "Weekly summary of your log activity. Requires Email Notifications.",
                                },
                            ] as const).map(({ key, icon: Icon, title, desc }) => (
                                <label
                                    key={key}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4 cursor-pointer hover:bg-glass-hover transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-text-secondary" />
                                        <div>
                                            <p className="text-sm font-semibold text-text">{title}</p>
                                            <p className="text-xs text-text-secondary">{desc}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData[key]}
                                        onChange={(e) => {
                                            const value = e.target.checked;
                                            setFormData({ ...formData, [key]: value });
                                            savePreference(key, value);
                                        }}
                                        disabled={savingPreference === key}
                                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Log Retention ───────────────────────────────────── */}
                    <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/10">
                                <Database className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-text">Log Retention</h2>
                                <p className="text-xs text-text-secondary">
                                    Logs older than this are purged automatically each night
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {RETENTION_OPTIONS.map((days) => {
                                const label = days >= 365 ? "1 year" : days >= 30 ? `${days / 30}mo` : `${days}d`;
                                const active = formData.logRetentionDays === days;
                                return (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, logRetentionDays: days });
                                            savePreference("logRetentionDays", days);
                                        }}
                                        disabled={savingPreference === "logRetentionDays"}
                                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
                                            active
                                                ? "border-info bg-info/10 text-info"
                                                : "border-border bg-background/30 text-text-secondary hover:bg-glass-hover hover:text-text"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs text-text-muted">
                            Currently set to <span className="font-semibold text-text">{formData.logRetentionDays} days</span>. Changes are saved immediately.
                        </p>
                    </div>
                </form>

                {/* ── Security ─────────────────────────────────────────────── */}
                <div id="security" className="space-y-6 scroll-mt-24">
                    <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10">
                                    <Shield className="h-5 w-5 text-success" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-text">Security</h2>
                                    <p className="text-xs text-text-secondary">Manage account protection and sign-ins</p>
                                </div>
                            </div>
                            {sessions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={handleRevokeAll}
                                    disabled={revokeAllLoading}
                                    className="inline-flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-xs font-semibold text-warning transition-all hover:bg-warning/20 disabled:opacity-50"
                                >
                                    {revokeAllLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <LogOut className="h-3.5 w-3.5" />
                                    )}
                                    Sign out others
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div id="security-sessions" className="scroll-mt-24 rounded-2xl border border-border bg-background/20 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-text-secondary">Active Sessions</h3>
                                </div>
                                <div className="space-y-3">
                                    {sessionsLoading ? (
                                        [...Array(2)].map((_, i) => (
                                            <div key={i} className="h-16 rounded-2xl bg-border/50 animate-pulse" />
                                        ))
                                    ) : sessions.length === 0 ? (
                                        <p className="text-sm text-text-muted text-center py-4">No sessions found</p>
                                    ) : (
                                        sessions.map((s) => {
                                            const { icon, label } = parseDevice(s.userAgent);
                                            const isCurrent = s.token === currentToken;
                                            return (
                                                <div
                                                    key={s.id}
                                                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-glass text-text-secondary">
                                                            {icon}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-text">{label}</p>
                                                                {isCurrent && (
                                                                    <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {s.ipAddress && (
                                                                    <p className="text-xs text-text-muted font-mono truncate">{s.ipAddress}</p>
                                                                )}
                                                                <span className="text-text-disabled">·</span>
                                                                <p className="text-xs text-text-muted flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!isCurrent && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRevokeSession(s.token)}
                                                            disabled={revokingToken === s.token}
                                                            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-error/20 bg-error/5 px-3 py-1.5 text-xs font-semibold text-error transition-all hover:bg-error/15 disabled:opacity-50"
                                                        >
                                                            {revokingToken === s.token ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <LogOut className="h-3 w-3" />
                                                            )}
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-text-secondary">Connected Accounts</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {accountsLoading ? (
                                        [...Array(2)].map((_, i) => (
                                            <div key={i} className="h-12 w-40 rounded-2xl bg-border/50 animate-pulse" />
                                        ))
                                    ) : connectedAccounts.length === 0 ? (
                                        <p className="text-sm text-text-muted py-2">No connected providers found</p>
                                    ) : (
                                        connectedAccounts.map((acc) => (
                                            <div
                                                key={acc.id}
                                                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 ${providerColor(acc.providerId)}`}
                                            >
                                                <span className="text-sm font-bold">{providerLabel(acc.providerId)}</span>
                                                <span className="text-xs opacity-60">
                                                    since {new Date(acc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Account Info ────────────────────────────────────────── */}
                <div id="account" className="glass rounded-[var(--radius-lg)] p-6 shadow-sm scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/10">
                            <Shield className="h-5 w-5 text-info" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text">Account</h2>
                            <p className="text-xs text-text-secondary">Your account details</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-background/30 p-4">
                            <p className="text-xs text-text-secondary mb-1">Member since</p>
                            <p className="text-sm font-semibold text-text">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-background/30 p-4">
                            <p className="text-xs text-text-secondary mb-1">Account ID</p>
                            <p className="text-sm font-mono text-text truncate">{user?.id || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* ── Danger Zone ─────────────────────────────────────────── */}
                <div id="danger" className="glass rounded-[var(--radius-lg)] p-6 shadow-sm border border-error/20 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-error/10">
                            <TriangleAlert className="h-5 w-5 text-error" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-error">Danger Zone</h2>
                            <p className="text-xs text-text-secondary">Irreversible actions — proceed carefully</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Sign out all sessions */}
                        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4">
                            <div>
                                <p className="text-sm font-semibold text-text">Sign out of all sessions</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Revokes all active sessions except this one. You&apos;ll stay signed in here.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRevokeAll}
                                disabled={revokeAllLoading || sessions.length <= 1}
                                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning transition-all hover:bg-warning/20 disabled:opacity-40"
                            >
                                {revokeAllLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LogOut className="h-4 w-4" />
                                )}
                                Sign out all
                            </button>
                        </div>

                        {/* Delete account */}
                        <div className="flex items-start justify-between gap-4 rounded-2xl border border-error/20 bg-error/5 p-4">
                            <div>
                                <p className="text-sm font-semibold text-error">Delete account</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Permanently deletes your account, all projects, logs, and API keys. This cannot be undone.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-95"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
