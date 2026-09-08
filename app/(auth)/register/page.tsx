"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Mail, ChevronLeft } from "lucide-react";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { motion } from "framer-motion";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

type LoadingMethod = "google" | "github" | "email" | null;

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>(null);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const isBusy = loadingMethod !== null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoadingMethod("email");

        const { error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (error) {
            setError(error.message || "An error occurred during registration");
            setLoadingMethod(null);
            return;
        }

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const resData = await res.json().catch(() => null);

            if (!res.ok) {
                setError(resData?.error || "Unable to send the verification email. Please try again.");
                return;
            }

            setEmailSent(true);
        } catch {
            setError("Unable to send the verification email. Please check your connection and try again.");
        } finally {
            setLoadingMethod(null);
        }
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
            <div className="flex min-h-screen items-center justify-center bg-background py-4 relative overflow-hidden">
                {/* Ambient background glows */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md space-y-6 p-4 md:p-8 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto"
                    >
                        <Mail className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-hero font-bold tracking-tight text-text">
                        Check your email
                    </h2>
                    <p className="text-sm font-bold text-text-secondary">
                        We sent a verification link to <span className="font-semibold text-text">{email}</span>. Click the link to verify your account.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                    >
                        Go to Sign In
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-1 py-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] as const }}
                className="w-full max-w-md space-y-8 px-4 py-4 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-hero font-bold tracking-tight text-text">Create an account</h2>
                    <p className="mt-2 text-sm font-bold text-text-secondary">
                        Join Logged and start tracking logs in seconds.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <GoogleSignInButton
                        onClick={handleGoogleSignUp}
                        disabled={isBusy}
                        isLoading={loadingMethod === "google"}
                        label={loadingMethod === "google" ? "Connecting..." : "Google"}
                    />
                    <button
                        type="button"
                        onClick={handleGithubSignUp}
                        disabled={isBusy}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm font-medium text-text transition-all hover:bg-background hover:border-primary/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMethod === "github" ? (
                            <Cardio size="52" color="currentColor" speed="1.5" stroke="5" bgOpacity="0.1" />
                        ) : (
                            <>
                                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.64 7.64 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                                </svg>
                                <span>GitHub</span>
                            </>
                        )}
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
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-text">Name</label>
                            <input
                                type="text"
                                required
                                disabled={isBusy}
                                className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text">Email Address</label>
                            <input
                                type="email"
                                required
                                disabled={isBusy}
                                className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text">Password</label>
                            <input
                                type="password"
                                required
                                disabled={isBusy}
                                className="mt-2 block w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="text-center text-xs text-text-secondary">
                        By continuing, you agree to our <Link href="/terms" className="font-semibold text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isBusy}
                        className="flex w-full justify-center rounded-xl bg-primary px-4 py-2 text-lg font-bold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMethod === "email" ? (
                            <Cardio size="52" color="white" speed="1.5" stroke="5" bgOpacity="0.1" />
                        ) : (
                            "Sign Up"
                        )}
                    </motion.button>
                </form>

                <div className="text-center space-y-2">
                    <p className="text-sm text-text-secondary">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold font-hero text-primary hover:text-primary-hover transition-colors">
                            Sign in
                        </Link>
                    </p>
                    <div>
                        <Link href="/" className="text-xs font-semibold text-text-muted hover:text-text transition-colors inline-flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

