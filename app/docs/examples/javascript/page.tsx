import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function JavaScriptExamplePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Link
          href="/docs/examples"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" />
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
  import { Logged } from "@logged/sdk";

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
          code={`const { Logged } = require("@logged/sdk");

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
          code={`import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.info("Application started");
logger.capture(new Error("Something failed"));`}
        />
      </section>
    </div>
  );
}
