"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function SetUsernamePage() {
    const { data: sessionData, isPending: sessionLoading } = authClient.useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!sessionLoading) {
            if (!sessionData?.user) {
                router.push("/login");
                return;
            }

            const currentUser = sessionData.user as { name?: string; username?: string; email?: string };

            // If user already has a username set, send them straight to dashboard
            if (currentUser.username && currentUser.username.trim() !== "") {
                router.push("/dashboard");
                return;
            }

            if (!initialized) {
                setName(currentUser.name || "");
                if (currentUser.email) {
                    const derived = currentUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
                    setUsername(derived);
                }
                setInitialized(true);
            }
        }
    }, [sessionData, sessionLoading, initialized, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanedUsername = username.trim().toLowerCase();
        const cleanedName = name.trim();

        if (!cleanedUsername) {
            setError("Username is required.");
            return;
        }

        if (cleanedUsername.length < 3) {
            setError("Username must be at least 3 characters long.");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
            setError("Username can only contain letters, numbers, and underscores.");
            return;
        }

        setSubmitting(true);

        try {
            const { error: updateError } = await authClient.updateUser({
                name: cleanedName || (sessionData?.user?.name ?? ""),
                username: cleanedUsername,
            });

            if (updateError) {
                setError(updateError.message || "Failed to set username. It may be taken.");
                setSubmitting(false);
                return;
            }

            router.push("/dashboard");
        } catch {
            setError("An unexpected error occurred while setting your username.");
            setSubmitting(false);
        }
    };

    if (sessionLoading || !initialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-text-secondary">Checking account status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md space-y-8 md:rounded-2xl md:glass p-4 md:p-8 md:shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-text">Choose your username</h1>
                    <p className="text-sm text-text-secondary">
                        Your account requires a unique handle before you can continue.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text">
                                Username <span className="text-primary">*</span>
                            </label>
                            <div className="relative mt-2">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted text-sm font-semibold pointer-events-none">
                                    @
                                </span>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    disabled={submitting}
                                    className="block w-full rounded-xl border border-border bg-background-secondary pl-8 pr-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-text-muted">
                                Minimum 3 characters. Letters, numbers, and underscores only.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text">Full Name</label>
                            <div className="relative mt-2">
                                <input
                                    type="text"
                                    disabled={submitting}
                                    className="block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Setting username...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue to Dashboard</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-xs text-text-muted">
                    Logged in as <span className="font-semibold text-text">{sessionData?.user?.email}</span>
                </div>
            </div>
        </div>
    );
}
