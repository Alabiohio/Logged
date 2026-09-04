"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

type LoadingMethod = "google" | "github" | "email" | "resend" | null;

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
    const [unverified, setUnverified] = useState(false);
    const [resent, setResent] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

    // Detect OAuth cancellation / errors returned via query params
    // e.g. /login?error=access_denied&error_description=...
    useEffect(() => {
        const oauthError = searchParams.get("error");
        if (!oauthError) return;

        // Clear the loading spinner on whichever button was clicked
        setLoadingMethod(null);

        if (oauthError === "access_denied") {
            setError("Sign-in was cancelled. You can try again whenever you're ready.");
        } else {
            const description = searchParams.get("error_description");
            setError(description || "Something went wrong during sign-in. Please try again.");
        }
    }, [searchParams]);

    const isBusy = loadingMethod !== null;
    const isGithubLoading = loadingMethod === "github";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingMethod("email");
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
            setLoadingMethod(null);
            return;
        }

        if (data?.user) {
            const u = data.user as Record<string, unknown>;
            if (!u.username || (typeof u.username === "string" && u.username.trim() === "")) {
                router.push("/set-username");
                return;
            }
        }

        router.push(redirectPath || "/dashboard");
    };

    const handleResendVerification = async () => {
        setLoadingMethod("resend");
        setError(null);
        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) {
                setError(result?.error || "Unable to resend the verification email. Please try again.");
                return;
            }

            setResent(true);
        } catch {
            setError("Unable to resend the verification email. Please check your connection and try again.");
        } finally {
            setLoadingMethod(null);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoadingMethod("google");
        setError(null);

        const { data, error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/set-username",
            errorCallbackURL: "/login",
        });

        if (error) {
            setError(error.message || "Failed to sign in with Google");
            setLoadingMethod(null);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
            return;
        }

        router.push("/set-username");
        setLoadingMethod(null);
    };

    const handleGithubSignIn = async () => {
        setLoadingMethod("github");
        setError(null);

        const { data, error } = await authClient.signIn.social({
            provider: "github",
            callbackURL: "/set-username",
            errorCallbackURL: "/login",
        });

        if (error) {
            setError(error.message || "Failed to sign in with GitHub");
            setLoadingMethod(null);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
            return;
        }

        router.push("/set-username");
        setLoadingMethod(null);
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
                        disabled={isBusy}
                        className="text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMethod === "resend" ? "Sending..." : "Resend verification email"}
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

            <div className="space-y-3">
                <GoogleSignInButton
                    onClick={handleGoogleSignIn}
                    disabled={isBusy}
                    isLoading={loadingMethod === "google"}
                    label={loadingMethod === "google" ? "Connecting to Google..." : "Continue with Google"}
                />
                <button
                    type="button"
                    onClick={handleGithubSignIn}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm font-medium text-text transition-all hover:bg-background hover:border-primary/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGithubLoading ? (
                        <Cardio size="52" color="currentColor" speed="1.5" stroke="5" bgOpacity="0.1" />
                    ) : (
                        <>
                            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.64 7.64 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                            </svg>
                            <span>{isGithubLoading ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
                        </>
                    )}
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-text-muted">
                    <span className="bg-background px-2">Or continue with email</span>
                </div>
            </div>

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
                            disabled={isBusy}
                            className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isBusy}
                            className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isBusy}
                    className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingMethod === "email" ? (
                        <Cardio size="52" color="white" speed="1.5" stroke="5" bgOpacity="0.1" />
                    ) : (
                        "Sign In"
                    )}
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
