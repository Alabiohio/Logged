import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function AutoPage() {
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
          Browser Auto Capture
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Automatically capture uncaught browser errors and unhandled promise
          rejections with <code className="font-mono text-primary">logger.auto()</code>.
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

logger.auto();`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Once enabled, Logged listens for global browser error events and sends
          them to the dashboard without any additional code.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">What gets captured</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li>
            <span className="font-semibold text-text">Uncaught errors</span> — errors
            thrown outside a try/catch block
          </li>
          <li>
            <span className="font-semibold text-text">Unhandled promise rejections</span>{" "}
            — rejected promises without a catch handler
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Example</h2>
        <CodeBlock
          language="typescript"
          code={`// Somewhere in your app initialization
logger.auto();

// Later, an uncaught error will be sent automatically
throw new Error("Something went wrong");`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Cleanup</h2>
        <CodeBlock
          language="typescript"
          code={`logger.stopAutoCapture();`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Call this when you no longer want Logged to listen for global errors,
          for example during tests or when tearing down a client-side
          application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Next.js</h2>
        <Callout variant="info" title="Client only">
          Auto capture is a browser-only feature. Enable it inside a{" "}
          <code className="font-mono text-primary">useEffect</code> or a client
          component so it never runs during server rendering.
        </Callout>
        <CodeBlock
          language="tsx"
          code={`"use client";

import { useEffect } from "react";
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.NEXT_PUBLIC_LOGGED_API_KEY!,
});

export function LoggedProvider() {
  useEffect(() => {
    logger.auto();
    return () => logger.stopAutoCapture();
  }, []);

  return null;
}`}
        />
      </section>
    </div>
  );
}
