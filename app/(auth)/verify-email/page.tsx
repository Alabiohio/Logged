"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
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
            }
        }

        verify();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl glass p-8 shadow-2xl text-center">
                {status === "loading" && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-text">
                            Verifying your email
                        </h2>
                        <p className="text-sm text-text-secondary">
                            Please wait while we verify your email address...
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
                            <CheckCircle2 className="h-8 w-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-text">
                            Email verified
                        </h2>
                        <p className="text-sm text-text-secondary">
                            Your email has been verified successfully. You can now sign in.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-all"
                        >
                            Continue to Sign In
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mx-auto">
                            <XCircle className="h-8 w-8 text-error" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-text">
                            Verification failed
                        </h2>
                        <p className="text-sm text-text-secondary">
                            This verification link is invalid or has expired. Please try signing up again.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-all"
                        >
                            Sign Up Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
