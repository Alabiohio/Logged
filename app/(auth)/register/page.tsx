"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Mail } from "lucide-react";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";

type LoadingMethod = "google" | "github" | "email" | null;

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [isResentLink, setIsResentLink] = useState(false);
    const router = useRouter();

    const isBusy = loadingMethod !== null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoadingMethod("email");

        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (error) {
            // If user already exists (e.g. registered before but unverified), resend verification link
            try {
                const resendRes = await authClient.sendVerificationEmail({ email });
                if (!resendRes.error) {
                    setIsResentLink(true);
                    setEmailSent(true);
                    setLoadingMethod(null);
                    return;
                }
            } catch {
                // Ignore resend error and show original error
            }

            setError(error.message || "An error occurred during registration");
            setLoadingMethod(null);
            return;
        }

        setIsResentLink(false);
        setEmailSent(true);
        setLoadingMethod(null);
    };

    const handleGoogleSignUp = async () => {
        setLoadingMethod("google");
        setError(null);

        const { data, error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/set-username",
        });

        if (error) {
            setError(error.message || "Failed to sign up with Google");
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

    const handleGithubSignUp = async () => {
        setLoadingMethod("github");
        setError(null);

        const { data, error } = await authClient.signIn.social({
            provider: "github",
            callbackURL: "/set-username",
        });

        if (error) {
            setError(error.message || "Failed to sign up with GitHub");
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

    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md space-y-6 rounded-2xl glass p-8 shadow-2xl text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-text">
                        Check your email
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {isResentLink ? (
                            <>
                                An account with <span className="font-medium text-text">{email}</span> already exists but is not verified yet. We sent a new verification link to your inbox.
                            </>
                        ) : (
                            <>
                                We sent a verification link to <span className="font-medium text-text">{email}</span>. Click the link to verify your account.
                            </>
                        )}
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-all"
                    >
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl glass p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-text">Create an account</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Join Logged and start tracking logs in seconds.
                    </p>
                </div>

                <div className="space-y-3">
                    <GoogleSignInButton
                        onClick={handleGoogleSignUp}
                        disabled={isBusy}
                        label={loadingMethod === "google" ? "Connecting to Google..." : "Continue with Google"}
                    />
                    <button
                        type="button"
                        onClick={handleGithubSignUp}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm font-medium text-text transition-all hover:bg-background hover:border-primary/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.64 7.64 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                        </svg>
                        <span>{loadingMethod === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-text-muted">
                        <span className="bg-background px-2">Or sign up with email</span>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-text">Name</label>
                            <input
                                type="text"
                                required
                                disabled={isBusy}
                                className="mt-2 block w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
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

                    <p className="text-center text-xs text-text-secondary">
                        By continuing, you agree to our <Link href="/terms" className="font-medium text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                    </p>

                    <button
                        type="submit"
                        disabled={isBusy}
                        className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMethod === "email" ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

