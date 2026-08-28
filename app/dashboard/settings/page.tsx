"use client";

import { useEffect, useState } from "react";
import { User, Shield, Bell, Globe, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
    const { data: sessionData, isPending: sessionLoading } = authClient.useSession();
    const [saving, setSaving] = useState(false);
    const [savingPreference, setSavingPreference] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        emailNotifications: true,
        errorAlerts: true,
        weeklyDigest: false,
    });

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const res = await fetch("/api/user/preferences");
                if (res.ok) {
                    const data = await res.json();
                    setFormData((prev) => ({
                        ...prev,
                        ...data.preferences,
                    }));
                }
            } catch {
                // Silently fail - defaults will be used
            }
        }

        if (sessionData?.user) {
            setFormData((prev) => ({
                ...prev,
                name: sessionData.user.name || "",
            }));
            fetchPreferences();
        }
    }, [sessionData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await authClient.updateUser({
                name: formData.name,
            });

            if (error) {
                setError(error.message || "Failed to update profile");
                setSaving(false);
                return;
            }

            const prefRes = await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailNotifications: formData.emailNotifications,
                    errorAlerts: formData.errorAlerts,
                    weeklyDigest: formData.weeklyDigest,
                }),
            });

            if (!prefRes.ok) {
                setError("Failed to save preferences");
            } else {
                setSuccess("Settings saved successfully");
            }
        } catch {
            setError("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const savePreference = async (key: "emailNotifications" | "errorAlerts" | "weeklyDigest", value: boolean) => {
        setSavingPreference(key);
        try {
            await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value }),
            });
        } catch {
            // Silently fail - UI already reflects the new state
        } finally {
            setSavingPreference(null);
        }
    };

    const user = sessionData?.user;

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

    return (
        <div className="space-y-8 px-3 py-6 sm:px-3 lg:px-8">
            {/* Header */}
            <section className="py-6">
                <h1 className="text-3xl font-black tracking-tight text-text">Settings</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                    Manage your account settings and preferences.
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

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
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

                {/* Notifications Section */}
                <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
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
                        <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4 cursor-pointer hover:bg-glass-hover transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-text-secondary" />
                                <div>
                                    <p className="text-sm font-semibold text-text">Error Alerts</p>
                                    <p className="text-xs text-text-secondary">Immediate email when an error-level log is received. Requires Email Notifications to be enabled.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.errorAlerts}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setFormData({ ...formData, errorAlerts: value });
                                    savePreference("errorAlerts", value);
                                }}
                                disabled={savingPreference === "errorAlerts"}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4 cursor-pointer hover:bg-glass-hover transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-text-secondary" />
                                <div>
                                    <p className="text-sm font-semibold text-text">Email Notifications</p>
                                    <p className="text-xs text-text-secondary">Master toggle for all email communication. Disabling this turns off error alerts and weekly digests.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.emailNotifications}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setFormData({ ...formData, emailNotifications: value });
                                    savePreference("emailNotifications", value);
                                }}
                                disabled={savingPreference === "emailNotifications"}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/30 p-4 cursor-pointer hover:bg-glass-hover transition-colors">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-text-secondary" />
                                <div>
                                    <p className="text-sm font-semibold text-text">Weekly Digest</p>
                                    <p className="text-xs text-text-secondary">Weekly summary of your log activity. Requires Email Notifications to be enabled.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.weeklyDigest}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setFormData({ ...formData, weeklyDigest: value });
                                    savePreference("weeklyDigest", value);
                                }}
                                disabled={savingPreference === "weeklyDigest"}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary"
                            />
                        </label>
                    </div>
                </div>

                {/* Account Info */}
                <div className="glass rounded-[var(--radius-lg)] p-6 shadow-sm">
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
                            <p className="text-sm font-mono text-text truncate">
                                {user?.id || "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
