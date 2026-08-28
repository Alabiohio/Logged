import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function CapturePage() {
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
          Capture Errors
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Use <code className="font-mono text-primary">logger.capture()</code> to
          send caught errors to Logged with their message, stack, and optional
          metadata.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Basic usage</h2>
        <CodeBlock
          language="typescript"
          code={`try {
  await processPayment();
} catch (error) {
  logger.capture(error);
}`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Logged extracts the error message, stack trace, and error name when
          possible. If the value is not an Error instance, Logged attempts to
          serialize it safely.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Add context</h2>
        <CodeBlock
          language="typescript"
          code={`try {
  await processPayment();
} catch (error) {
  logger.capture(error, {
    orderId: "ORD-123",
    paymentMethod: "card",
  });
}`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Metadata helps you debug faster by attaching request-specific or
          domain-specific context to the captured error.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">What gets extracted</h2>
        <p className="text-sm leading-7 text-text-secondary">
          For <code className="font-mono text-primary">Error</code> objects, the SDK
          sends the following fields:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li>
            <span className="font-mono text-primary">message</span> — error message
          </li>
          <li>
            <span className="font-mono text-primary">stack</span> — stack trace
          </li>
          <li>
            <span className="font-mono text-primary">name</span> — error name, for
            example <span className="font-mono text-primary">TypeError</span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Avoid duplicate logs</h2>
        <Callout variant="warning" title="Note">
          If you also use <code className="font-mono text-primary">logger.auto()</code>{" "}
          or <code className="font-mono text-primary">logger.interceptConsole()</code>,
          the same error may be captured through multiple paths. The SDK includes
          basic duplicate filtering to reduce noise.
        </Callout>
      </section>
    </div>
  );
}
