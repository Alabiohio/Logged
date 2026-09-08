"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus("error");
                return;
            }

            const { error } = await authClient.verifyEmail({ query: { token } });

            if (error) {
                setStatus("error");
            } else {
                setStatus("success");
                setTimeout(() => {
                    router.push("/set-username");
                }, 1500);
            }
        }

        verify();
    }, [token, router]);

    return (
        <div className="w-full max-w-md space-y-6 p-4 md:p-8 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {status === "loading" && (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-hero font-bold tracking-tight text-text">
                        Verifying your email
                    </h2>
                    <p className="text-sm font-bold text-text-secondary">
                        Please wait while we verify your email address...
                    </p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-hero font-bold tracking-tight text-text">
                        Email verified
                    </h2>
                    <p className="text-sm font-bold text-text-secondary">
                        Your email has been verified. You are now logged in! Redirecting to dashboard...
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                    >
                        Go to Dashboard
                    </Link>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mx-auto">
                        <XCircle className="h-8 w-8 text-error" />
                    </div>
                    <h2 className="text-2xl font-hero font-bold tracking-tight text-text">
                        Verification failed
                    </h2>
                    <p className="text-sm font-bold text-text-secondary">
                        This verification link is invalid or has expired. Please try signing up again.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                    >
                        Sign Up Again
                    </Link>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={<div className="w-full max-w-md p-4 md:p-8 animate-pulse h-64" />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
