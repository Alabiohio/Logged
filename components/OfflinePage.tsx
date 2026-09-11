"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, RefreshCcw, WifiOff } from "lucide-react";

export function OfflinePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      if (window.location.pathname === "/offline") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.replace("/dashboard");
      return;
    }

    window.location.reload();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(114,125,143,0.16),transparent_52%)]" />

      <div className="relative w-full max-w-xl rounded-[30px] border border-border bg-glass/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background/60 text-primary shadow-inner">
          <WifiOff className="h-9 w-9" />
        </div>

        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
          No internet connection
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-text sm:text-4xl">
          You&apos;re offline
        </h1>
        <p className="mt-4 text-center text-base leading-7 text-text-secondary">
          Logged is ready to keep working in a reduced mode, but live monitoring, sync,
          and data refresh need an internet connection.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-text transition hover:bg-background-secondary"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Home className="h-4 w-4" />
            Open dashboard
          </Link>
        </div>

        <div className="mt-7 rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">PWA status</span>
            <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
              Offline mode
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            This page is cached for installed app usage, so the experience remains clear even
            when the device is disconnected.
          </p>
        </div>
      </div>
    </main>
  );
}
