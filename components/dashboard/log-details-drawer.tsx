"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LogLevelBadge } from "./log-level-badge";
import { MetadataViewer } from "./metadata-viewer";
import { StackTraceViewer } from "./stack-trace-viewer";

export type LogRecord = {
    id: string;
    projectId: string;
    level: string;
    message: string;
    metadata: Record<string, unknown> | null;
    environment: string | null;
    source: string | null;
    url: string | null;
    pathname: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    stack: string | null;
    timestamp: string | null;
    createdAt: string;
};

interface LogDetailsDrawerProps {
    log: LogRecord | null;
    onClose: () => void;
}

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
    let browser = "Unknown";
    let os = "Unknown";
    let device = "Desktop";

    // Browser detection
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/")) browser = "Chrome";
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
    else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";

    // OS detection
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    // Device detection
    if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
    else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet";

    return { browser, os, device };
}

function formatTimestamp(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                {label}
            </span>
            <span className="block text-sm text-text break-all">{value}</span>
        </div>
    );
}

export function LogDetailsDrawer({ log, onClose }: LogDetailsDrawerProps) {
    // Escape key handler
    useEffect(() => {
        if (!log) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [log, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (log) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [log]);

    if (!log) return null;

    const clientInfo = log.userAgent ? parseUserAgent(log.userAgent) : null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer panel — full-screen on mobile, side panel on larger screens */}
            <div className="relative z-10 w-full sm:max-w-lg flex flex-col bg-background border-l border-border shadow-lg animate-in slide-in-from-right">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                    <h2 className="text-lg font-bold text-text">Log Details</h2>
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition hover:bg-glass-hover hover:text-text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Level + Message */}
                    <div className="space-y-3">
                        <LogLevelBadge level={log.level} size="md" />
                        <p className="text-base font-semibold text-text leading-relaxed">
                            {log.message}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <DetailRow
                        label="Timestamp"
                        value={formatTimestamp(log.timestamp || log.createdAt)}
                    />

                    {/* Environment */}
                    {log.environment && (
                        <DetailRow label="Environment" value={log.environment} />
                    )}

                    {/* Source */}
                    {log.source && <DetailRow label="Source" value={log.source} />}

                    {/* Request info */}
                    {(log.url || log.pathname) && (
                        <div className="space-y-4 border-t border-border/50 pt-4">
                            <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                                Request
                            </span>
                            {log.url && <DetailRow label="URL" value={log.url} />}
                            {log.pathname && (
                                <DetailRow label="Pathname" value={log.pathname} />
                            )}
                        </div>
                    )}

                    {/* Client info */}
                    {(clientInfo || log.ipAddress) && (
                        <div className="space-y-4 border-t border-border/50 pt-4">
                            <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                                Client
                            </span>
                            <div className="grid grid-cols-2 gap-4">
                                {clientInfo && (
                                    <>
                                        <DetailRow
                                            label="Browser"
                                            value={clientInfo.browser}
                                        />
                                        <DetailRow label="OS" value={clientInfo.os} />
                                        <DetailRow
                                            label="Device"
                                            value={clientInfo.device}
                                        />
                                    </>
                                )}
                                {log.ipAddress && (
                                    <DetailRow label="IP Address" value={log.ipAddress} />
                                )}
                            </div>
                            {log.userAgent && (
                                <div className="space-y-1">
                                    <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                                        User Agent
                                    </span>
                                    <span className="block text-xs text-text-muted font-mono break-all leading-relaxed">
                                        {log.userAgent}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    {log.metadata &&
                        typeof log.metadata === "object" &&
                        Object.keys(log.metadata).length > 0 && (
                            <div className="border-t border-border/50 pt-4">
                                <MetadataViewer data={log.metadata} />
                            </div>
                        )}

                    {/* Stack trace */}
                    {log.stack && (
                        <div className="border-t border-border/50 pt-4">
                            <StackTraceViewer stack={log.stack} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
