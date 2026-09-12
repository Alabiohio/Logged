"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

interface LogExample {
  method: string;
  methodColor: string;
  badgeBg: string;
  message: string;
  payload: { key: string; value: string }[];
}

interface CodeToken {
  text: string;
  className: string;
}

const LOG_EXAMPLES: LogExample[] = [
  {
    method: "error",
    methodColor: "text-error font-bold",
    badgeBg: "bg-error/15 text-error border-error/30",
    message: "Payment failed",
    payload: [
      { key: "userId", value: '"usr_94021"' },
      { key: "orderId", value: '"ord_88294"' },
      { key: "reason", value: '"Gateway timeout"' },
    ],
  },
  {
    method: "warn",
    methodColor: "text-warning font-bold",
    badgeBg: "bg-warning/15 text-warning border-warning/30",
    message: "Rate limit threshold reached",
    payload: [
      { key: "userId", value: '"usr_33104"' },
      { key: "usage", value: '"92%"' },
      { key: "endpoint", value: '"/v1/analytics"' },
    ],
  },
  {
    method: "info",
    methodColor: "text-info font-bold",
    badgeBg: "bg-info/15 text-info border-info/30",
    message: "User session started",
    payload: [
      { key: "userId", value: '"usr_77201"' },
      { key: "ip", value: '"192.168.1.1"' },
      { key: "browser", value: '"Chrome 122"' },
    ],
  },
  {
    method: "track",
    methodColor: "text-primary font-bold",
    badgeBg: "bg-primary/15 text-primary border-primary/30",
    message: "Order completed",
    payload: [
      { key: "orderId", value: '"ord_99012"' },
      { key: "amount", value: '"$149.00"' },
      { key: "currency", value: '"USD"' },
    ],
  },
];

function getTokensForExample(ex: LogExample): CodeToken[] {
  const tokens: CodeToken[] = [
    { text: "logger.", className: "text-text" },
    { text: ex.method, className: ex.methodColor },
    { text: "(", className: "text-text" },
    { text: `"${ex.message}"`, className: "text-warning" },
    { text: ", {\n", className: "text-text" },
  ];

  ex.payload.forEach((item, i) => {
    tokens.push({ text: `  ${item.key}: `, className: "text-text" });
    tokens.push({ text: item.value, className: "text-warning" });
    tokens.push({
      text: i < ex.payload.length - 1 ? ",\n" : "\n",
      className: "text-text",
    });
  });

  tokens.push({ text: "});", className: "text-text" });

  return tokens;
}

export default function QuickDemo() {
  const [copied, setCopied] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentExample = LOG_EXAMPLES[activeIdx];
  const tokens = useMemo(() => getTokensForExample(currentExample), [currentExample]);
  const totalChars = useMemo(() => tokens.reduce((sum, t) => sum + t.text.length, 0), [tokens]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && charCount < totalChars) {
      // Type next char
      timer = setTimeout(() => {
        setCharCount((prev) => prev + 1);
      }, 35);
    } else if (!isDeleting && charCount === totalChars) {
      // Pause at full text
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 3000);
    } else if (isDeleting && charCount > 0) {
      // Fast rapid deletion (4 chars every 10ms)
      timer = setTimeout(() => {
        setCharCount((prev) => Math.max(0, prev - 4));
      }, 10);
    } else if (isDeleting && charCount === 0) {
      // Switch to next snippet
      timer = setTimeout(() => {
        setIsDeleting(false);
        setActiveIdx((prev) => (prev + 1) % LOG_EXAMPLES.length);
      }, 0);
    }

    return () => clearTimeout(timer);
  }, [charCount, totalChars, isDeleting, activeIdx]);

  const selectExample = (index: number) => {
    setActiveIdx(index);
    setCharCount(0);
    setIsDeleting(false);
  };

  const getCodeSnippetText = () => `import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.${currentExample.method}("${currentExample.message}", {
${currentExample.payload.map((p) => `  ${p.key}: ${p.value}`).join(",\n")}
});`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCodeSnippetText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render tokens up to charCount with typewriter cursor
  const renderTypedTokens = () => {
    let remaining = charCount;
    let cursorPlaced = false;

    const elements: React.ReactNode[] = [];

    tokens.forEach((token, idx) => {
      if (remaining <= 0) return;

      if (remaining >= token.text.length) {
        remaining -= token.text.length;
        elements.push(
          <span key={idx} className={token.className}>
            {token.text}
          </span>
        );
      } else {
        const visibleText = token.text.slice(0, remaining);
        remaining = 0;
        cursorPlaced = true;
        elements.push(
          <span key={idx} className={token.className}>
            {visibleText}
            <span className="inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-middle ml-0.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
          </span>
        );
      }
    });

    if (!cursorPlaced && charCount > 0) {
      elements.push(
        <span key="cursor" className="inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-middle ml-0.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
      );
    }

    if (charCount === 0) {
      elements.push(
        <span key="cursor-start" className="inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-middle ml-0.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
      );
    }

    return elements;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        {/* Left copy */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-2xl font-hero font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
            From zero to logging in minutes.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed"
          >
            No complicated observability setup. No giant infrastructure project. Just install the lightweight SDK and start sending structured events directly to your dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 space-y-3 sm:space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">1</span>
              <span className="text-sm sm:text-base font-semibold text-text">Install package</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">2</span>
              <span className="text-sm sm:text-base font-semibold text-text">Initialize SDK with your API key</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">3</span>
              <span className="text-sm sm:text-base font-semibold text-text">Send logs with rich context</span>
            </div>
          </motion.div>
        </div>

        {/* Right Code Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl sm:rounded-3xl border border-border/80 bg-background/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl"
        >
          {/* Terminal header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 sm:pb-4">
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-error/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <span className="ml-2 font-console text-xs text-text-muted">app/logger.ts</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="sm:hidden rounded-lg bg-glass-hover px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:text-text transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Quick level indicator selectors */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <div className="flex items-center gap-1.5">
                {LOG_EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.method}
                    onClick={() => selectExample(i)}
                    className={`rounded-md border px-2 py-0.5 font-console text-[10px] font-medium whitespace-nowrap transition ${
                      activeIdx === i
                        ? ex.badgeBg
                        : "border-transparent text-text-muted hover:text-text"
                    }`}
                  >
                    logger.{ex.method}
                  </button>
                ))}
              </div>
              <button
                onClick={copyToClipboard}
                className="hidden sm:block ml-2 rounded-lg bg-glass-hover px-3 py-1 text-xs font-semibold text-text-muted hover:text-text transition shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Installation strip */}
          <div className="mt-3 sm:mt-4 flex items-center justify-between rounded-xl bg-glass p-2.5 sm:p-3 font-console text-[11px] sm:text-xs text-primary overflow-x-auto">
            <span>$ npm install @oheoco/logged</span>
          </div>

          {/* Code snippet with Typewriter Animation */}
          <pre className="mt-3 min-h-[190px] overflow-x-auto whitespace-pre-wrap break-all p-1.5 font-console text-[11px] leading-relaxed text-text sm:mt-4 sm:min-h-[220px] sm:p-2 sm:text-sm">
            <code className="block break-words">
              <span className="font-bold text-primary">import</span> &#123; Logged &#125; <span className="font-bold text-primary">from</span> <span className="text-warning">&quot;@oheoco/logged&quot;</span>;{"\n\n"}
              <span className="font-bold text-primary">const</span> logger = <span className="font-bold text-primary">new Logged</span>(&#123;{"\n"}
              {"  "}apiKey: process.env.<span className="text-info">LOGGED_API_KEY</span>,{"\n"}
              &#125;);{"\n\n"}
              {renderTypedTokens()}
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}


