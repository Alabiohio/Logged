import Link from "next/link";
import { FolderKanban, Download, Settings, Send, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

const steps = [
  {
    title: "Create a project",
    description:
      "Sign in to the Logged dashboard and create a new project. Each project gets its own API key.",
    icon: FolderKanban,
    href: "/dashboard/projects/new",
  },
  {
    title: "Install the SDK",
    description:
      "Add the Logged SDK to your application using npm.",
    icon: Download,
    code: {
      language: "bash",
      code: "npm install @logged/sdk",
    },
  },
  {
    title: "Initialize Logged",
    description:
      "Create a Logged client with your project API key.",
    icon: Settings,
    code: {
      language: "typescript",
      code: `import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});`,
    },
  },
  {
    title: "Send a log",
    description:
      "Call any logger method to send a log to the Logged API.",
    icon: Send,
    code: {
      language: "typescript",
      code: `logger.info("Application started");`,
    },
  },
  {
    title: "Open the dashboard",
    description:
      "Return to the Logged dashboard to inspect your logs, filter by level, and debug issues.",
    icon: BarChart3,
    href: "/dashboard",
  },
];

export default function QuickStartPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          Quick Start
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Follow these steps to send your first log to Logged in about five minutes.
        </p>
      </section>

      <section className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const content = (
            <div className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background-secondary text-sm font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-text">{step.title}</h2>
                </div>
                <p className="text-sm leading-7 text-text-secondary">{step.description}</p>
                {step.code && (
                  <CodeBlock language={step.code.language} code={step.code.code} />
                )}
                {step.href && (
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Open Logged
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          );
          return <div key={step.title}>{content}</div>;
        })}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">What next?</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Once you&apos;ve sent a log, explore the SDK to capture browser errors,
          intercept console output, and add structured metadata.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/docs/sdk"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Explore the SDK
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs/rest-api"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-glass-hover"
          >
            REST API
          </Link>
        </div>
      </section>
    </div>
  );
}
