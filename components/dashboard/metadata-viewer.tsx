"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MetadataViewerProps {
    data: Record<string, unknown>;
}

export function MetadataViewer({ data }: MetadataViewerProps) {
    const [copied, setCopied] = useState(false);
    const formatted = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(formatted);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Metadata
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
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-border/50 bg-background-secondary p-4 font-mono text-xs leading-relaxed text-text">
                {formatted}
            </pre>
        </div>
    );
}
