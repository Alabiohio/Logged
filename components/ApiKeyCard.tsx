"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCcw, Check } from "lucide-react";
import { trackApiKeyCopied, trackApiKeyRegenerated } from "@/lib/analytics";

interface ApiKeyCardProps {
  apiKey: string | null;
  environment: string;
  projectId: string;
  onRegenerate: (env: string, newKey: string) => void;
}

export function ApiKeyCard({ apiKey, environment, projectId, onRegenerate }: ApiKeyCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const hasKey = Boolean(apiKey);
  const maskedKey = apiKey ? apiKey.slice(0, 8) + "•".repeat(Math.max(0, apiKey.length - 8)) : "";

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    trackApiKeyCopied(projectId, environment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const handleRegenerate = async () => {
    if (!hasKey && !confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    if (!hasKey && confirmRegen) {
      setConfirmRegen(false);
    }
    setRegenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/regenerate-key`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment }),
      });
      if (res.ok) {
        const data = await res.json();
        trackApiKeyRegenerated(projectId, environment);
        onRegenerate(environment, data.apiKey);
      }
    } catch (err) {
      console.error("Failed to regenerate key", err);
    } finally {
      setRegenerating(false);
      setConfirmRegen(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-glass p-6 space-y-4 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
            {environment} API Key
          </p>
          <p className="text-xs text-text-muted mt-1">Use this key to send logs from your {environment} environment.</p>
        </div>
      </div>

      {hasKey ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
          <code className="flex-1 min-w-0 font-mono text-sm text-text truncate">
            {revealed ? apiKey : maskedKey}
          </code>
          <button
            onClick={() => setRevealed((v) => !v)}
            className="flex-shrink-0 rounded-xl p-2 text-text-secondary transition hover:bg-glass-hover hover:text-text"
            title={revealed ? "Hide key" : "Reveal key"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 rounded-xl p-2 text-text-secondary transition hover:bg-glass-hover hover:text-text"
            title="Copy key"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background/50 px-4 py-4 text-sm text-text-muted">
          No API key generated yet for this environment.
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        {confirmRegen ? (
          <div className="flex flex-wrap items-center gap-3 w-full">
            <p className="text-sm text-warning flex-1">
              {hasKey ? "This will invalidate the existing key. Continue?" : "Generate a new API key for this environment?"}
            </p>
            <button
              onClick={() => setConfirmRegen(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:bg-glass-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="rounded-xl bg-error/10 px-3 py-1.5 text-sm font-semibold text-error transition hover:bg-error/20 disabled:opacity-50"
            >
              {regenerating ? "Generating…" : "Confirm"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:bg-glass-hover hover:text-text"
          >
            {hasKey ? <RefreshCcw className="h-4 w-4" /> : null}
            {hasKey ? "Regenerate Key" : "Generate Key"}
          </button>
        )}
      </div>
    </div>
  );
}
