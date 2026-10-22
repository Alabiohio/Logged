"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { ShieldCheck, Smartphone, Mail, KeyRound, ChevronLeft, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

type VerifyMode = "totp" | "otp" | "backup";

function TwoFactorVerifyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

    const [mode, setMode] = useState<VerifyMode>("totp");
    const [code, setCode] = useState("");
    const [trustDevice, setTrustDevice] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Email OTP states
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for email OTP resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleSendOtp = async () => {
        setOtpLoading(true);
        setError(null);
        try {
            const res = await authClient.twoFactor.sendOtp();
            if (res?.error) {
                setError(res.error.message || "Failed to send verification email");
                return;
            }
            setOtpSent(true);
            setResendCooldown(60);
            setMode("otp");
            setCode("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send email verification code";
            setError(message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanCode = code.trim();
        if (!cleanCode) {
            setError("Please enter the verification code");
            return;
        }

        setIsSubmitting(true);

        try {
            let res;
            if (mode === "totp") {
                res = await authClient.twoFactor.verifyTotp({
                    code: cleanCode,
                    trustDevice,
                });
            } else if (mode === "otp") {
                res = await authClient.twoFactor.verifyOtp({
                    code: cleanCode,
                    trustDevice,
                });
            } else if (mode === "backup") {
                res = await authClient.twoFactor.verifyBackupCode({
                    code: cleanCode,
                    trustDevice,
                });
            }

            if (res?.error) {
                setError(res.error.message || "Invalid verification code. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Verification successful! Check user state
            const { data } = await authClient.getSession();
            const user = data?.user as Record<string, unknown> | undefined;

            if (user && (!user.username || (typeof user.username === "string" && user.username.trim() === ""))) {
                window.location.replace("/set-username");
                return;
            }

            window.location.replace(redirectPath || "/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
            setError(message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 glass p-6 md:p-8 rounded-[var(--radius-lg)] shadow-2xl relative z-10 border border-border">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
                    {mode === "totp" && <Smartphone className="h-7 w-7" />}
                    {mode === "otp" && <Mail className="h-7 w-7" />}
                    {mode === "backup" && <KeyRound className="h-7 w-7" />}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-text">Two-Factor Authentication</h1>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    {mode === "totp" && "Enter the 6-digit authentication code from your authenticator app"}
                    {mode === "otp" && (otpSent ? "We sent a 6-digit verification code to your email" : "Verify using a one-time code sent to your email")}
                    {mode === "backup" && "Enter one of your 10-character emergency recovery backup codes"}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-error/20 bg-error/10 p-4 text-xs text-error flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        {mode === "backup" ? "Recovery Backup Code" : "6-Digit Security Code"}
                    </label>
                    <input
                        type="text"
                        required
                        autoFocus
                        value={code}
                        maxLength={mode === "backup" ? 20 : 6}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCode(mode === "backup" ? val : val.replace(/\D/g, ""));
                        }}
                        placeholder={mode === "backup" ? "abcde-12345" : "000000"}
                        className={`w-full rounded-xl border border-border bg-background-secondary px-4 py-3 text-text placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary ${
                            mode === "backup"
                                ? "font-mono font-bold text-center tracking-wider text-base"
                                : "font-mono font-bold text-center tracking-[0.4em] text-xl"
                        }`}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={trustDevice}
                            onChange={(e) => setTrustDevice(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-xs text-text-secondary">Trust this device for 30 days</span>
                    </label>

                    {mode === "otp" && (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendCooldown > 0 || otpLoading}
                            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <Cardio size="46" color="white" speed="1.5" stroke="4" bgOpacity="0.1" />
                    ) : (
                        <>
                            Verify & Continue
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Alternative Verification Options */}
            <div className="pt-2 border-t border-border/60 space-y-2">
                <p className="text-[11px] font-semibold text-text-muted text-center uppercase tracking-wider mb-2">
                    Alternative Methods
                </p>

                {mode !== "totp" && (
                    <button
                        type="button"
                        onClick={() => {
                            setMode("totp");
                            setCode("");
                            setError(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover transition-colors"
                    >
                        <Smartphone className="h-3.5 w-3.5 text-primary" />
                        Use Authenticator App
                    </button>
                )}

                {mode !== "otp" && (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover transition-colors disabled:opacity-50"
                    >
                        {otpLoading ? (
                            <Cardio size="32" color="currentColor" speed="1.5" stroke="3" bgOpacity="0.1" />
                        ) : (
                            <>
                                <Mail className="h-3.5 w-3.5 text-info" />
                                Send code to my email
                            </>
                        )}
                    </button>
                )}

                {mode !== "backup" && (
                    <button
                        type="button"
                        onClick={() => {
                            setMode("backup");
                            setCode("");
                            setError(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover transition-colors"
                    >
                        <KeyRound className="h-3.5 w-3.5 text-warning" />
                        Use an emergency backup code
                    </button>
                )}
            </div>

            {/* Back to sign in */}
            <div className="text-center pt-2">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}

export default function TwoFactorVerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={<div className="w-full max-w-md p-8 h-96 animate-pulse" />}>
                <TwoFactorVerifyForm />
            </Suspense>
        </div>
    );
}
