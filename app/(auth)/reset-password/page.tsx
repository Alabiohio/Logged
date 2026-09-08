"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error } = await authClient.resetPassword({
            newPassword,
            token,
        });

        setIsLoading(false);

        if (error) {
            setError(error.message || "Failed to reset password. The link may have expired.");
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    };

    if (!token) {
        return (
            <div className="w-full max-w-md space-y-6 p-4 md:p-8 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mx-auto">
                    <AlertCircle className="h-8 w-8 text-error" />
                </div>
                <h2 className="text-2xl font-hero font-bold tracking-tight text-text">Invalid Reset Link</h2>
                <p className="text-sm font-bold text-text-secondary">
                    This password reset link is invalid or has expired. Please request a new link.
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-8 p-4 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
                <h2 className="text-3xl font-hero font-bold tracking-tight text-text">Set new password</h2>
                <p className="mt-2 text-sm font-bold text-text-secondary">
                    Please enter your new password below.
                </p>
            </div>

            {success ? (
                <div className="space-y-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-hero font-bold text-text">Password reset successful!</h3>
                        <p className="text-sm font-bold text-text-secondary">
                            Your password has been updated. Redirecting to sign in...
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                    >
                        Sign In Now
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-text">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                disabled={isLoading}
                                className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-text">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                disabled={isLoading}
                                className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Cardio size="52" color="white" speed="1.5" stroke="5" bgOpacity="0.1" />
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={<div className="w-full max-w-md p-4 md:p-8 animate-pulse h-96" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
