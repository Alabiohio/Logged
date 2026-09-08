"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
        });

        setIsLoading(false);

        if (error) {
            setError(error.message || "An error occurred while requesting password reset.");
            return;
        }

        setSubmitted(true);
    };

    return (
        <div className="w-full max-w-md space-y-8 p-4 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
                <h2 className="text-3xl font-hero font-bold tracking-tight text-text">Forgot password?</h2>
                <p className="mt-2 text-sm font-bold text-text-secondary">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
            </div>

            {submitted ? (
                <div className="space-y-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-hero font-bold text-text">Check your inbox</h3>
                        <p className="text-sm font-bold text-text-secondary">
                            If an account exists with <span className="font-semibold text-text">{email}</span>, you will receive password reset instructions shortly.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" strokeWidth={4} />
                        Back to sign in
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-bold text-text">Email Address</label>
                        <input
                            type="email"
                            required
                            disabled={isLoading}
                            className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Cardio size="52" color="white" speed="1.5" stroke="5" bgOpacity="0.1" />
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={4} />
                            Back to sign in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={<div className="w-full max-w-md p-4 md:p-8 animate-pulse h-80" />}>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    );
}
