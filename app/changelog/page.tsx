import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Terminal, Code, Cpu, ShieldCheck, Zap, Layers } from "lucide-react";

export const metadata = {
  title: "Changelog | SDK & API Updates | Logged",
  description: "Release history and updates for the @oheoco/logged SDK and REST Ingestion API.",
};

interface ChangelogEntry {
  date: string;
  version: string;
  scope: "SDK" | "API" | "SDK & API";
  badgeColor?: string;
  highlights: string[];
}

const changelogEntries: ChangelogEntry[] = [
  {
    date: "October 20, 2026",
    version: "SDK v0.1.18 & API v1.3",
    scope: "SDK & API",
    highlights: [
      "SDK: Enhanced client context auto-detection for browser runtime (`browser`, `device`, `os`, `url`, `pathname`).",
      "SDK: Refined TypeScript type definitions (`LogPayload`, `LogLevel`, `LogMetadata`, `TableData`) with full IDE autocompletion.",
      "SDK: Optimized dual ESM/CJS build artifacts and slimmed bundle size for browser and edge runtime consumers.",
      "API: Expanded automated sensitive data redaction to scrub JSON Web Tokens (JWTs), Bearer headers, and private key strings from free-text error messages and stack traces.",
      "API: Strengthened batch payload validation with strict 100 KB payload limits and informative reject diagnostics.",
    ],
  },
  {
    date: "September 18, 2026",
    version: "SDK v0.1.12 & API v1.2",
    scope: "SDK & API",
    highlights: [
      "SDK: Added `logger.table()` for tabular datasets, automatically packaging datasets into `metadata.table` for structured inspection.",
      "SDK: Added configurable `debug` option in `LoggedConfig` to log network transport diagnostics and ingestion errors to the developer console.",
      "API: Introduced batch ingestion via `POST /api/v1/logs` supporting up to 100 log events in a single HTTP round-trip.",
      "API: Added granular batch response schema reporting accepted and rejected event counts (`{ success: true, accepted: N, rejected: 0 }`).",
    ],
  },
  {
    date: "August 20, 2026",
    version: "SDK v0.1.5",
    scope: "SDK",
    highlights: [
      "SDK: Introduced browser console interception (`logger.interceptConsole()`) capturing `console.log`, `info`, `warn`, `error`, and `table` while preserving native DevTools output.",
      "SDK: Added `logger.stopConsoleInterception()` to safely restore native console methods during teardown.",
      "SDK: Published standalone UMD/global browser bundle (`dist/logged.global.js`) to jsDelivr and unpkg exposing `window.Logged`.",
      "SDK: Safe browser-environment checks to prevent execution errors when running in Node.js, Next.js server components, or edge workers.",
    ],
  },
  {
    date: "August 10, 2026",
    version: "SDK v0.1.0 & API v1.0",
    scope: "SDK & API",
    highlights: [
      "SDK: Initial release of `@oheoco/logged` on npm for JavaScript, TypeScript, React, and Next.js applications.",
      "SDK: Implemented standard log levels (`log`, `debug`, `info`, `success`, `warn`, `error`).",
      "SDK: Implemented `logger.capture(error, metadata)` for caught exceptions with automated name, message, and stack trace parsing.",
      "SDK: Implemented `logger.auto()` to listen for global uncaught errors (`window.onerror`) and unhandled promise rejections (`unhandledrejection`).",
      "API: Initial public release of the REST Ingestion API (`POST /api/v1/logs`) with Bearer token authentication.",
      "API: Support for environment tags (`development`, `staging`, `production`) and execution sources (`server`, `client`, `edge`).",
      "API: Automatic server-side extraction and normalization of client IP address (`x-forwarded-for`, `x-real-ip`) and HTTP `User-Agent` headers.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none isolate will-change-transform">
        <div className="absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-primary/25 blur-[80px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-info/20 blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-light/30 blur-[80px]" />
      </div>

      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        {/* Header */}
        <div className="text-center sm:text-left">

          <h1 className="mt-10 text-4xl font-black tracking-tight text-text sm:text-5xl">
            Changelog
          </h1>
          <p className="mt-4 text-base text-text-muted">
            Release notes, protocol updates, and improvements for the{" "}
            <code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-xs text-text">
              @oheoco/logged
            </code>{" "}
            SDK and the Ingestion REST API.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/docs/sdk"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-glass px-3 py-1.5 font-medium text-text-secondary transition hover:text-text hover:border-primary/40"
            >
              <Code className="h-3.5 w-3.5 text-primary" />
              <span>SDK Documentation</span>
            </Link>
            <Link
              href="/api-reference"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-glass px-3 py-1.5 font-medium text-text-secondary transition hover:text-text hover:border-primary/40"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>REST API Reference</span>
            </Link>
            <a
              href="https://www.npmjs.com/package/@oheoco/logged"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-glass px-3 py-1.5 font-medium text-text-secondary transition hover:text-text hover:border-primary/40"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>npm @oheoco/logged</span>
            </a>
          </div>
        </div>

        {/* Timeline Entries */}
        <div className="mt-14 space-y-10">
          {changelogEntries.map((entry, index) => (
            <article
              key={index}
              className="relative rounded-3xl border border-border bg-glass p-7 sm:p-8 backdrop-blur-xl transition hover:border-border/80"
            >
              {/* Header row: Date, Version, Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-text">
                    {entry.version}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-text-muted">
                    Released on {entry.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {entry.scope}
                  </span>
                </div>
              </div>

              {/* Release Highlights */}
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-text-secondary">
                {entry.highlights.map((highlight, hIndex) => {
                  const [prefix, ...rest] = highlight.split(":");
                  const hasPrefix = rest.length > 0;

                  return (
                    <li key={hIndex} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>
                        {hasPrefix ? (
                          <>
                            <strong className="text-text font-semibold">{prefix}:</strong>
                            {rest.join(":")}
                          </>
                        ) : (
                          highlight
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
