import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ErrorPageProps = {
  statusCode: number;
  title?: string;
  description?: string;
  eyebrow?: string;
  details?: ReactNode;
  primaryAction?: ErrorAction;
  secondaryAction?: ErrorAction;
};

const DEFAULT_CONTENT: Record<number, { title: string; description: string }> = {
  400: {
    title: "Bad request",
    description: "The request could not be processed because the information provided was incomplete or invalid.",
  },
  401: {
    title: "Authentication required",
    description: "This page needs a valid session before you can continue. Please sign in and try again.",
  },
  403: {
    title: "Access denied",
    description: "You do not have permission to view this resource. Please check your account access or return to the dashboard.",
  },
  404: {
    title: "Page not found",
    description: "The page you were looking for does not exist or may have moved. Try a different link or head back home.",
  },
  409: {
    title: "Conflict",
    description: "The data you requested conflicts with the current state of the application. Try refreshing and retrying.",
  },
  429: {
    title: "Too many requests",
    description: "You have sent too many requests in a short time. Please wait a moment and try again.",
  },
  500: {
    title: "Something went wrong",
    description: "We hit an unexpected error while loading this page. Please try again in a moment.",
  },
  503: {
    title: "Service unavailable",
    description: "The service is temporarily unavailable. We are working on restoring the connection.",
  },
};

export function ErrorPage({
  statusCode,
  title,
  description,
  eyebrow,
  details,
  primaryAction,
  secondaryAction,
}: ErrorPageProps) {
  const fallback = DEFAULT_CONTENT[statusCode] ?? {
    title: "Unexpected error",
    description: "Something went wrong while loading this page. Please retry or return to the home page.",
  };

  const primaryLabel = primaryAction?.label ?? "Back home";
  const secondaryLabel = secondaryAction?.label;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-text">
      <div className="absolute -top-32 left-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-info/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-12">
          <div className="mb-8 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3" aria-label="Logged home">
              <Image
                src="/logo/logo.png"
                alt="Logged logo"
                width={1000}
                height={20}
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl">Logged</span>
            </Link>
          </div>

          {eyebrow ? (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              {eyebrow}
            </p>
          ) : null}

          <div className="mb-6 font-mono text-6xl font-black tracking-[-0.08em] text-primary md:text-7xl">
            {statusCode}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-text md:text-5xl">
            {title ?? fallback.title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary md:text-lg">
            {description ?? fallback.description}
          </p>

          {details ? (
            <div className="mt-6 rounded-2xl border border-border-secondary bg-background-secondary/80 p-4 text-sm text-text-secondary">
              {details}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryAction ? (
              primaryAction.href ? (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  {primaryLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  {primaryLabel}
                </button>
              )
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Back home
              </Link>
            )}

            {secondaryAction ? (
              secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:bg-background-secondary"
                >
                  {secondaryLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:bg-background-secondary"
                >
                  {secondaryLabel}
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
