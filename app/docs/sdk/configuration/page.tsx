import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata: Metadata = {
  title: "SDK Configuration | Logged",
  description:
    "Configure the Logged SDK with an API key, environment metadata, and debug logging.",
};

export default function ConfigurationPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Link
          href="/docs/sdk"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={4} />
          Back to SDK
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          SDK Configuration
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          The Logged SDK is intentionally small. The main configuration is the
          project API key, plus optional environment and debug metadata for
          diagnosing issues in the dashboard.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Constructor options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-semibold text-text">Option</th>
                <th className="pb-3 pr-4 font-semibold text-text">Required</th>
                <th className="pb-3 font-semibold text-text">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">apiKey</td>
                <td className="py-3 pr-4 text-text-secondary">Yes</td>
                <td className="py-3 text-text-secondary">
                  Project API key used to authenticate requests to Logged.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">environment</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  A human-friendly environment label such as development, staging,
                  or production.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">debug</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  Prints additional transport and capture diagnostics to the console
                  when requests fail or browser handlers throw.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Basic setup</h2>
        <CodeBlock
          language="typescript"
          code={`import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  debug: true,
});`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          In server-side code, prefer environment variables. In browser code, use
          a public runtime variable such as <code className="font-mono text-primary">NEXT_PUBLIC_*</code> or <code className="font-mono text-primary">VITE_*</code>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Environment variable recommendations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <h3 className="mb-2 font-semibold text-text">Server</h3>
            <CodeBlock
              language="bash"
              code={`LOGGED_API_KEY=your_secret_key`}
            />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <h3 className="mb-2 font-semibold text-text">Browser</h3>
            <CodeBlock
              language="bash"
              code={`NEXT_PUBLIC_LOGGED_API_KEY=your_public_key`}
            />
          </div>
        </div>
        <Callout variant="warning" title="Keep secrets safe">
          Do not commit real API keys. If you need logs from a public browser app,
          use a project key that is scoped for that environment and avoid giving
          access to anything sensitive.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Browser vs server behavior</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Browser-only features are skipped when the SDK runs in a non-browser
          context. The SDK does not require a full framework and can be used in
          Node.js, Edge functions, or vanilla JS as long as the API key is valid.
        </p>
        <CodeBlock
          language="typescript"
          code={`import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});

logger.info("Server boot complete");`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Current SDK limitations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li>The constructor does not currently expose a custom <code className="font-mono text-primary">baseUrl</code> override.</li>
          <li>Auto capture and console capture only work in browser environments.</li>
          <li>Capture is best-effort and will swallow internal errors when debug mode is disabled.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Continue learning</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/installation" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">Installation</p>
            <p className="mt-2 text-sm text-text-secondary">Set up the SDK in your project.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Start here
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/sdk/auto" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">Auto Capture</p>
            <p className="mt-2 text-sm text-text-secondary">Catch browser errors without extra boilerplate.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Learn more
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/rest-api" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">REST API</p>
            <p className="mt-2 text-sm text-text-secondary">Send logs directly without the SDK.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View API
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
