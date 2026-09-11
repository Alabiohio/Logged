"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface StackTraceViewerProps {
    stack: string;
}

export function StackTraceViewer({ stack }: StackTraceViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(stack);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Parse stack into frames
    const lines = stack.split("\n").filter((line) => line.trim().length > 0);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Stack Trace
                </span>
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-text-secondary transition hover:bg-glass-hover hover:text-text"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 text-success" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            Copy Stack
                        </>
                    )}
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-error/10 bg-background-secondary">
                <div className="space-y-0.5 overflow-x-auto p-4">
                    {lines.map((line, i) => {
                        const isErrorLine = i === 0 && !line.trim().startsWith("at ");
                        return (
                            <div
                                key={i}
                                className={`break-all font-mono text-xs leading-6 ${
                                    isErrorLine
                                        ? "font-semibold text-error"
                                        : "pl-4 text-text-muted"
                                }`}
                            >
                                {line}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
