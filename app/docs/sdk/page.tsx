import Link from "next/link";
import { Code, Zap, Bug, Monitor, Terminal } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function SdkPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          SDK
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          The <code className="font-mono text-primary">@logged/sdk</code> package
          provides a typed client for sending logs, capturing errors, and
          intercepting browser console activity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Installation</h2>
        <CodeBlock
          language="bash"
          code="npm install @logged/sdk"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Initialization</h2>
        <CodeBlock
          language="typescript"
          code={`import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});`}
        />
        <Callout variant="info" title="Browser vs Node">
          The SDK works in both browsers and Node.js. Browser-only features,
          such as auto capture and console interception, are guarded so they
          do nothing in server environments.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Logging methods</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Use these methods to send logs at different severity levels.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "log", example: 'logger.log("Application started");' },
            { name: "info", example: 'logger.info("User logged in");' },
            { name: "success", example: 'logger.success("Payment completed");' },
            { name: "warn", example: 'logger.warn("API response is slow");' },
            { name: "error", example: 'logger.error("Database connection failed");' },
            { name: "debug", example: 'logger.debug("Request details", { method: "GET" });' },
          ].map((method) => (
            <div
              key={method.name}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <p className="font-mono text-xs text-primary mb-2">
                logger.{method.name}()
              </p>
              <CodeBlock language="typescript" code={method.example} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Metadata</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Attach structured metadata to any log for richer debugging context.
        </p>
        <CodeBlock
          language="typescript"
          code={`logger.info("User logged in", {
  userId: "123",
  role: "admin",
});`}
        />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/docs/sdk/capture"
          className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
        >
          <Bug className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
            Capture Errors
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Extract message, stack, and name from caught errors and send them
            as structured logs.
          </p>
        </Link>

        <Link
          href="/docs/sdk/auto"
          className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
        >
          <Monitor className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
            Browser Auto Capture
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Automatically capture uncaught browser errors and unhandled promise
            rejections.
          </p>
        </Link>

        <Link
          href="/docs/sdk/console"
          className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
        >
          <Terminal className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
            Console Capture
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Intercept console output and send it to Logged without replacing
            existing console methods.
          </p>
        </Link>

        <Link
          href="/docs/rest-api"
          className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
        >
          <Code className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
            REST API
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Skip the SDK and send logs directly to the Logged ingestion API.
          </p>
        </Link>
      </section>
    </div>
  );
}
