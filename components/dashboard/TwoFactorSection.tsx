"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck, ShieldAlert, KeyRound, Smartphone, Mail,
    Copy, Check, Download, AlertCircle, RefreshCw, Lock, ArrowRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Modal } from "@/components/ui/Modal";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import QRCode from "qrcode";
import { PasswordInput } from "@/components/ui/PasswordInput";

interface TwoFactorStatus {
    enabled: boolean;
    hasPassword: boolean;
    verified: boolean;
}

export function TwoFactorSection() {
    const [status, setStatus] = useState<TwoFactorStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Setup Modal state
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupStep, setSetupStep] = useState<"password" | "scan" | "verify" | "backup">("password");
    const [passwordInput, setPasswordInput] = useState("");
    const [totpURI, setTotpURI] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [confirmedSavedCodes, setConfirmedSavedCodes] = useState(false);

    // Disable Modal state
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableLoading, setDisableLoading] = useState(false);
    const [disableError, setDisableError] = useState<string | null>(null);

    // Backup Codes Modal state
    const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
    const [backupPassword, setBackupPassword] = useState("");
    const [viewBackupCodes, setViewBackupCodes] = useState<string[]>([]);
    const [backupCodesLoading, setBackupCodesLoading] = useState(false);
    const [backupCodesError, setBackupCodesError] = useState<string | null>(null);
    const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/user/two-factor/status");
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (err) {
            console.error("Failed to fetch 2FA status:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchStatus();
    }, [fetchStatus]);

    // Parse secret from TOTP URI for manual entry
    const extractSecret = (uri: string): string => {
        try {
            const url = new URL(uri);
            return url.searchParams.get("secret") || "";
        } catch {
            return "";
        }
    };

    // Start setup flow
    const handleStartSetup = () => {
        setModalError(null);
        setPasswordInput("");
        setVerificationCode("");
        setConfirmedSavedCodes(false);

        if (status?.hasPassword) {
            setSetupStep("password");
        } else {
            // OAuth-only user, skip directly to generating TOTP URI
            void handleGenerateTotp("");
        }
        setShowSetupModal(true);
    };

    const handleGenerateTotp = async (pwd?: string) => {
        setActionLoading(true);
        setModalError(null);
        try {
            const res = await authClient.twoFactor.enable({
                password: pwd || passwordInput,
                issuer: "Logged",
            });

            if (res?.error) {
                setModalError(res.error.message || "Failed to initialize 2FA setup");
                return;
            }

            if (!res?.data || res.data.method !== "totp") {
                setModalError("Server did not return a TOTP URI");
                return;
            }

            const uri = res.data.totpURI;
            const codes = res.data.backupCodes || [];

            if (!uri) {
                setModalError("Server did not return a TOTP URI");
                return;
            }

            setTotpURI(uri);
            setBackupCodes(codes);
            setSecretKey(extractSecret(uri));

            const qrUrl = await QRCode.toDataURL(uri, {
                width: 200,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });
            setQrDataUrl(qrUrl);
            setSetupStep("scan");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate QR code";
            setModalError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyTotp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode.trim().length < 6) {
            setModalError("Please enter the complete 6-digit code");
            return;
        }

        setActionLoading(true);
        setModalError(null);
        try {
            const res = await authClient.twoFactor.verifyTotp({
                code: verificationCode.trim(),
            });

            if (res?.error) {
                setModalError(res.error.message || "Invalid verification code. Please check your authenticator app.");
                return;
            }

            // Successfully enabled! Transition to backup codes step
            setSetupStep("backup");
            await fetchStatus();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Verification failed";
            setModalError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinishSetup = () => {
        setShowSetupModal(false);
        void fetchStatus();
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setDisableLoading(true);
        setDisableError(null);

        try {
            const res = await authClient.twoFactor.disable({
                password: status?.hasPassword ? disablePassword : "",
            });

            if (res?.error) {
                setDisableError(res.error.message || "Failed to disable 2FA. Please verify your password.");
                return;
            }

            setShowDisableModal(false);
            setDisablePassword("");
            await fetchStatus();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to disable 2FA";
            setDisableError(message);
        } finally {
            setDisableLoading(false);
        }
    };

    const handleGenerateNewBackupCodes = async (e: React.FormEvent) => {
        e.preventDefault();
        setBackupCodesLoading(true);
        setBackupCodesError(null);

        try {
            const res = await authClient.twoFactor.generateBackupCodes({
                password: status?.hasPassword ? backupPassword : "",
            });

            if (res?.error) {
                setBackupCodesError(res.error.message || "Failed to generate backup codes");
                return;
            }

            if (res?.data?.backupCodes) {
                setViewBackupCodes(res.data.backupCodes);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate backup codes";
            setBackupCodesError(message);
        } finally {
            setBackupCodesLoading(false);
        }
    };

    const downloadBackupCodes = (codes: string[]) => {
        const text = `Logged - Two-Factor Authentication Recovery Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe. Each code can only be used once.\n\n${codes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n`;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `logged-backup-codes-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-border bg-background/20 p-5 animate-pulse">
                <div className="h-6 w-48 bg-border/40 rounded-lg mb-3" />
                <div className="h-4 w-72 bg-border/30 rounded-lg" />
            </div>
        );
    }

    const isEnabled = Boolean(status?.enabled);

    return (
        <div id="two-factor" className="scroll-mt-24 rounded-2xl border border-border bg-background/20 px-4 py-5 sm:p-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isEnabled ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    }`}>
                        {isEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-base font-bold text-text">Two-Factor Authentication</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isEnabled 
                                    ? "bg-success/10 text-success border border-success/20" 
                                    : "bg-surface-elevated text-text-muted border border-border"
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isEnabled ? "bg-success" : "bg-text-muted"}`} />
                                {isEnabled ? "Active" : "Disabled"}
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 max-w-xl">
                            {isEnabled
                                ? "Your account is protected with two-factor authentication. An authenticator code, email OTP, or backup recovery code is required when signing in."
                                : "Add an extra layer of defense to your account using an authenticator app (Google Authenticator, Apple Passwords, 1Password) and backup recovery codes."
                            }
                        </p>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
                    {isEnabled ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setViewBackupCodes([]);
                                    setBackupPassword("");
                                    setBackupCodesError(null);
                                    setShowBackupCodesModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/40 px-3.5 py-2 text-xs font-semibold text-text transition-all hover:bg-glass-hover active:scale-95"
                            >
                                <KeyRound className="h-3.5 w-3.5 text-text-secondary" />
                                Backup Codes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDisablePassword("");
                                    setDisableError(null);
                                    setShowDisableModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2 text-xs font-semibold text-error transition-all hover:bg-error/20 active:scale-95"
                            >
                                Disable 2FA
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleStartSetup}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Enable 2FA
                        </button>
                    )}
                </div>
            </div>

            {isEnabled && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Smartphone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-text truncate">Authenticator App (TOTP)</p>
                            <p className="text-[11px] text-text-muted">Google Authenticator, Apple, 1Password</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-text truncate">Email OTP Backup</p>
                            <p className="text-[11px] text-text-muted">Instant one-time codes to registered email</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Setup Flow Modal ────────────────────────────────────────────── */}
            {showSetupModal && (
                <Modal
                    title="Enable Two-Factor Authentication"
                    subtitle="Protect your account with an Authenticator app"
                    icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                    iconContainerClassName="bg-primary/10"
                    onClose={() => {
                        if (!actionLoading) setShowSetupModal(false);
                    }}
                >
                    {modalError && (
                        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{modalError}</span>
                        </div>
                    )}

                    {/* Step 1: Password entry for password users */}
                    {setupStep === "password" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void handleGenerateTotp();
                            }}
                            className="space-y-4"
                        >
                            <p className="text-xs text-text-secondary">
                                Please confirm your password before configuring two-factor authentication.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                                    Current Password
                                </label>
                                <PasswordInput
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoFocus
                                    inputClassName="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSetupModal(false)}
                                    className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text hover:bg-glass-hover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading || !passwordInput}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Cardio size="36" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: QR Code Scan & Manual Entry */}
                    {setupStep === "scan" && (
                        <div className="space-y-4">
                            <p className="text-xs text-text-secondary">
                                Scan this QR code with your authenticator app (such as Google Authenticator, Apple Passwords, or 1Password).
                            </p>

                            <div className="flex justify-center my-3">
                                <div className="rounded-2xl bg-white p-3 shadow-md border border-border">
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="2FA QR Code" width={180} height={180} className="rounded-lg" />
                                    ) : (
                                        <div className="w-[180px] h-[180px] flex items-center justify-center">
                                            <Cardio size="40" color="#18181b" speed="1.5" stroke="3" bgOpacity="0.1" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {secretKey && (
                                <div className="rounded-xl border border-border bg-background/40 p-2.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-text-muted">Or enter secret manually:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(secretKey);
                                                setCopiedSecret(true);
                                                setTimeout(() => setCopiedSecret(false), 2000);
                                            }}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                        >
                                            {copiedSecret ? (
                                                <>
                                                    <Check className="h-3 w-3 text-success" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3" />
                                                    Copy Key
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="font-mono text-xs text-text font-bold break-all tracking-wider select-all">
                                        {secretKey}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleVerifyTotp} className="space-y-3 pt-1">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                                        Enter the 6-digit verification code from your app:
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                        placeholder="000000"
                                        autoFocus
                                        required
                                        className="w-full text-center tracking-[0.4em] font-mono font-bold text-lg rounded-xl border border-border bg-background/50 px-4 py-2.5 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSetupModal(false)}
                                        className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text hover:bg-glass-hover"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading || verificationCode.length < 6}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Cardio size="36" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                                        ) : (
                                            "Verify & Enable"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Backup Codes Screen */}
                    {setupStep === "backup" && (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning flex items-start gap-2.5">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Save these backup recovery codes!</strong> If you lose access to your authenticator app, these are the only way to regain access to your account.
                                </span>
                            </div>

                            <div className="rounded-2xl border border-border bg-background/60 p-3">
                                <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs font-bold text-text py-1">
                                    {backupCodes.map((code, index) => (
                                        <div key={index} className="rounded-lg bg-surface-elevated/80 py-1.5 px-2 tracking-wider border border-border/50">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(backupCodes.join("\n"));
                                        setCopiedCodes(true);
                                        setTimeout(() => setCopiedCodes(false), 2000);
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover"
                                >
                                    {copiedCodes ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copiedCodes ? "Copied" : "Copy Codes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadBackupCodes(backupCodes)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download (.txt)
                                </button>
                            </div>

                            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={confirmedSavedCodes}
                                    onChange={(e) => setConfirmedSavedCodes(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                />
                                <span className="text-xs text-text-secondary select-none">
                                    I have stored these backup recovery codes in a secure location.
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleFinishSetup}
                                disabled={!confirmedSavedCodes}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {/* ── Disable 2FA Modal ───────────────────────────────────────────── */}
            {showDisableModal && (
                <Modal
                    title="Disable Two-Factor Authentication"
                    subtitle="Are you sure you want to disable 2FA?"
                    icon={<ShieldAlert className="h-5 w-5 text-error" />}
                    iconContainerClassName="bg-error/10"
                    onClose={() => {
                        if (!disableLoading) setShowDisableModal(false);
                    }}
                >
                    <form onSubmit={handleDisable2FA} className="space-y-4">
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Disabling two-factor authentication leaves your account protected only by your password or social sign-in.
                        </p>

                        {disableError && (
                            <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{disableError}</span>
                            </div>
                        )}

                        {status?.hasPassword && (
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                                    Enter Password to Confirm
                                </label>
                                <PasswordInput
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoFocus
                                    inputClassName="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-error focus:ring-2 focus:ring-error/20"
                                />
                            </div>
                        )}

                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDisableModal(false)}
                                disabled={disableLoading}
                                className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text hover:bg-glass-hover"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={disableLoading || (status?.hasPassword && !disablePassword)}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                            >
                                {disableLoading ? (
                                    <Cardio size="36" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                                ) : (
                                    "Disable 2FA"
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── View / Generate Backup Codes Modal ──────────────────────────── */}
            {showBackupCodesModal && (
                <Modal
                    title="Recovery Backup Codes"
                    subtitle="Emergency access codes"
                    icon={<KeyRound className="h-5 w-5 text-primary" />}
                    iconContainerClassName="bg-primary/10"
                    onClose={() => setShowBackupCodesModal(false)}
                >
                    <div className="space-y-4">
                        {backupCodesError && (
                            <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{backupCodesError}</span>
                            </div>
                        )}

                        {viewBackupCodes.length === 0 ? (
                            <form onSubmit={handleGenerateNewBackupCodes} className="space-y-4">
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Generate 10 new single-use recovery codes. Generating fresh backup codes will invalidate any existing codes.
                                </p>

                                {status?.hasPassword && (
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                                            Confirm Password
                                        </label>
                                        <PasswordInput
                                            value={backupPassword}
                                            onChange={(e) => setBackupPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            autoFocus
                                            inputClassName="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBackupCodesModal(false)}
                                        className="flex-1 rounded-xl border border-border bg-background/30 px-4 py-2.5 text-xs font-semibold text-text hover:bg-glass-hover"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={backupCodesLoading || (status?.hasPassword && !backupPassword)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {backupCodesLoading ? (
                                            <Cardio size="36" color="white" speed="1.5" stroke="3" bgOpacity="0.1" />
                                        ) : (
                                            <>
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Generate Codes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-border bg-background/60 p-3">
                                    <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs font-bold text-text py-1">
                                        {viewBackupCodes.map((code, index) => (
                                            <div key={index} className="rounded-lg bg-surface-elevated/80 py-1.5 px-2 tracking-wider border border-border/50">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(viewBackupCodes.join("\n"));
                                            setCopiedBackupCodes(true);
                                            setTimeout(() => setCopiedBackupCodes(false), 2000);
                                        }}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover"
                                    >
                                        {copiedBackupCodes ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copiedBackupCodes ? "Copied" : "Copy Codes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadBackupCodes(viewBackupCodes)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/30 px-3 py-2 text-xs font-semibold text-text hover:bg-glass-hover"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download (.txt)
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowBackupCodesModal(false)}
                                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
