"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [unverified, setUnverified] = useState(false);
    const [resent, setResent] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUnverified(false);

        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            if (error.message?.toLowerCase().includes("verify") || error.message?.toLowerCase().includes("unverified")) {
                setUnverified(true);
            } else {
                setError(error.message || "An error occurred during login");
            }
            setLoading(false);
            return;
        }

        router.push(redirectPath || "/dashboard");
    };

    const handleResendVerification = async () => {
        setLoading(true);
        await authClient.sendVerificationEmail({ email });
        setResent(true);
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md space-y-8 rounded-2xl glass p-8 shadow-2xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-text">Sign in to Logged</h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Welcome back! Please enter your details.
                </p>
            </div>

            {unverified && !resent && (
                <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 space-y-3">
                    <p className="text-sm text-warning font-medium">
                        Your email is not verified.
                    </p>
                    <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Resend verification email
                    </button>
                </div>
            )}

            {resent && (
                <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                    <p className="text-sm text-success font-medium">
                        Verification email sent! Check your inbox.
                    </p>
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                {error && (
                    <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text">Email Address</label>
                        <input
                            type="email"
                            required
                            className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="text-center text-sm text-text-secondary">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Suspense fallback={<div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl animate-pulse h-96" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
