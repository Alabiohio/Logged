import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata: Metadata = {
  title: "JavaScript Example | Logged",
  description:
    "Use Logged from plain JavaScript or TypeScript without a framework.",
};

export default function JavaScriptExamplePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Link
          href="/docs/examples"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={4} />
          Back to Examples
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          JavaScript
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Use Logged from plain JavaScript or TypeScript without a framework.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Module example</h2>
        <CodeBlock
          language="html"
          code={`<script type="module">
import { Logged } from "@oheoco/logged";

  const logger = new Logged({
    apiKey: "YOUR_API_KEY",
  });

  logger.auto();
  logger.info("Application started");
</script>`}
        />
        <Callout variant="warning" title="Hardcoded keys">
          This example uses a hardcoded API key for brevity. In production, load
          the key from an environment variable or inject it from your backend.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">CommonJS</h2>
        <CodeBlock
          language="javascript"
          code={`const { Logged } = require("@oheoco/logged");

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.info("Server started");`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">ES modules</h2>
        <CodeBlock
          language="javascript"
          code={`import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.info("Application started");
logger.capture(new Error("Something failed"));`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Continue learning</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/examples/react" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">React</p>
            <p className="mt-2 text-sm text-text-secondary">See how to wire the SDK into a UI app.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View example
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/examples/nextjs" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">Next.js</p>
            <p className="mt-2 text-sm text-text-secondary">Use the same setup in a client-side App Router app.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Browse guide
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/rest-api" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">REST API</p>
            <p className="mt-2 text-sm text-text-secondary">Send logs directly without installing the SDK.</p>
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
