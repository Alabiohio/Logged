"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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
        <div className="w-full max-w-md space-y-8 rounded-2xl glass p-8 shadow-2xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-text">Forgot password?</h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
            </div>

            {submitted ? (
                <div className="space-y-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-text">Check your inbox</h3>
                        <p className="text-sm text-text-secondary">
                            If an account exists with <span className="font-medium text-text">{email}</span>, you will receive password reset instructions shortly.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-text">Email Address</label>
                        <input
                            type="email"
                            required
                            disabled={isLoading}
                            className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <ArrowLeft className="h-4 w-4" />
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
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Suspense fallback={<div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl animate-pulse h-80" />}>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    );
}
