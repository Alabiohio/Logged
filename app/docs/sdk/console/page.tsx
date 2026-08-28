import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function ConsolePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Link
          href="/docs/sdk"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SDK
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          Console Capture
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Send existing browser console output to Logged without replacing your
          normal console behavior.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Setup</h2>
        <CodeBlock
          language="typescript"
          code={`import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.NEXT_PUBLIC_LOGGED_API_KEY!,
});

logger.interceptConsole();`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          After calling <code className="font-mono text-primary">interceptConsole()</code>,
          the following browser methods are forwarded to Logged while still
          appearing in DevTools:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li>
            <span className="font-mono text-primary">console.log</span>
          </li>
          <li>
            <span className="font-mono text-primary">console.info</span>
          </li>
          <li>
            <span className="font-mono text-primary">console.warn</span>
          </li>
          <li>
            <span className="font-mono text-primary">console.error</span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">How it works</h2>
        <CodeBlock
          language="typescript"
          code={`console.log("Application started");

console.info("User authenticated");

console.warn("API response is slow");

console.error("Payment failed");`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Each call still prints to the browser console. Logged receives a
          structured copy with the log level, message, and serialized arguments.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Serialization</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Console arguments are serialized safely so objects, arrays, and
          circular references do not break the SDK.
        </p>
        <CodeBlock
          language="typescript"
          code={`console.log("User:", {
  id: "123",
  role: "admin",
});`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          This produces a Logged event with the object preserved in metadata
          rather than stringified into <span className="font-mono text-primary">[object Object]</span>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Cleanup</h2>
        <CodeBlock
          language="typescript"
          code={`logger.stopConsoleInterception();`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Restores the original console methods. This is useful in tests or when
          disabling capture for part of an application lifecycle.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Notes</h2>
        <Callout variant="warning" title="Browser only">
          Console interception targets the browser. It does not modify Node.js
          server-side console behavior.
        </Callout>
        <Callout variant="info" title="Multiple calls are safe">
          Calling <code className="font-mono text-primary">interceptConsole()</code>{" "}
          multiple times does not wrap the same methods more than once.
        </Callout>
      </section>
    </div>
  );
}
