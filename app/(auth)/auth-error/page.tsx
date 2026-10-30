"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, RefreshCw } from "lucide-react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
    internal_server_error: {
        title: "Something went wrong",
        description: "An unexpected error occurred on our end. Please try again in a moment.",
    },
    access_denied: {
        title: "Access denied",
        description: "You don't have permission to access this resource.",
    },
    invalid_token: {
        title: "Invalid or expired link",
        description: "This link is no longer valid. It may have expired or already been used.",
    },
    token_expired: {
        title: "Link expired",
        description: "This link has expired. Please request a new one.",
    },
    user_not_found: {
        title: "Account not found",
        description: "We couldn't find an account associated with this request.",
    },
    email_not_verified: {
        title: "Email not verified",
        description: "Please verify your email address before continuing.",
    },
    oauth_account_not_linked: {
        title: "Account not linked",
        description: "This social account isn't linked to any Logged account. Try signing in with a different method.",
    },
    too_many_requests: {
        title: "Too many attempts",
        description: "You've made too many requests. Please wait a moment before trying again.",
    },
};

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get("error") ?? "unknown";

    const info = ERROR_MESSAGES[errorCode] ?? {
        title: "Authentication error",
        description: "An error occurred during authentication. Please try again or contact support if the problem persists.",
    };

    return (
        <div className="w-full max-w-md space-y-8 p-4 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/10">
                    <AlertTriangle className="h-10 w-10 text-red-400" strokeWidth={1.5} />
                </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
                <h1 className="text-2xl font-hero font-bold tracking-tight text-text">
                    {info.title}
                </h1>
                <p className="text-sm font-medium text-text-secondary leading-relaxed">
                    {info.description}
                </p>
                {errorCode !== "unknown" && (
                    <p className="text-xs text-text-muted font-mono bg-background-secondary border border-border rounded-lg px-3 py-1.5 inline-block">
                        Error: {errorCode}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
                <Link
                    href="/login"
                    className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg shadow-primary/25"
                >
                    Back to Sign In
                </Link>
                <button
                    onClick={() => window.location.reload()}
                    className="flex w-full justify-center items-center gap-2 rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm font-medium text-text hover:bg-background hover:border-primary/40 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
                <div>
                    <Link
                        href="/"
                        className="text-sm font-semibold text-text-muted hover:text-text transition-colors inline-flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" strokeWidth={4} />
                        Back to Home
                    </Link>
                </div>
                <p className="text-xs text-text-muted">
                    Need help?{" "}
                    <a
                        href="https://oheo.site/inquiry"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-text-secondary hover:text-text transition-colors underline underline-offset-2"
                    >
                        Contact us
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={<div className="w-full max-w-md p-4 md:p-8 animate-pulse h-96" />}>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
