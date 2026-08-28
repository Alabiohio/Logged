import Link from "next/link";
import { FileText, Code, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DocsPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-black tracking-tight text-text sm:text-5xl">
          Build with Logged
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-text-secondary">
          Monitor and debug your applications with simple, structured logging.
          Send logs from any environment and inspect them from one dashboard.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/docs/quick-start">
            <Button size="lg" icon={<Zap className="h-4 w-4" />}>
              Quick Start
            </Button>
          </Link>
          <Link href="/docs/rest-api">
            <Button variant="secondary" size="lg" icon={<Code className="h-4 w-4" />}>
              API Reference
            </Button>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-text">Documentation</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/docs/installation"
            className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
          >
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              Getting Started
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Install the SDK and set up your first project.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Installation
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Quick Start
              </li>
            </ul>
          </Link>

          <Link
            href="/docs/sdk"
            className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
          >
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              SDK
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Send logs, capture errors, and intercept console output.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Logger
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Capture Errors
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Browser Auto Capture
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Console Capture
              </li>
            </ul>
          </Link>

          <Link
            href="/docs/rest-api"
            className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
          >
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              REST API
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Send logs directly to Logged without the SDK.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                POST /api/v1/logs
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Authentication
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Request / Response
              </li>
            </ul>
          </Link>

          <Link
            href="/docs/examples/nextjs"
            className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
          >
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              Examples
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Integration guides for common frameworks and environments.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Next.js
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                React
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                JavaScript
              </li>
            </ul>
          </Link>
        </div>
      </section>
    </div>
  );
}
