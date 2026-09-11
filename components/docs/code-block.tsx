"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
};

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background-secondary">
      <div className="flex items-center justify-between border-b border-border bg-background-tertiary/50 px-4 py-2">
        <span className="text-xs font-medium text-text-muted">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:bg-glass hover:text-text"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-text">
          <code className="block min-w-0 break-words">{code}</code>
        </pre>
      </div>
    </div>
  );
}
