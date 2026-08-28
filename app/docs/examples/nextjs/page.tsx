import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function NextJsExamplePage() {
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
          Next.js
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Use Logged in a Next.js App Router project by initializing the SDK in a
          client component.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Provider component</h2>
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
    logger.interceptConsole();

    return () => {
      logger.stopAutoCapture();
      logger.stopConsoleInterception();
    };
  }, []);

  return null;
}`}
        />
        <Callout variant="info" title="Why this is a client component">
          <code className="font-mono text-primary">logger.auto()</code> and{" "}
          <code className="font-mono text-primary">interceptConsole()</code> rely on
          browser globals, so they must run on the client. The provider above
          uses the &quot;use client&quot; directive to ensure that.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Add the provider</h2>
        <CodeBlock
          language="tsx"
          code={`import { LoggedProvider } from "@/components/logged-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoggedProvider />
        {children}
      </body>
    </html>
  );
}`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Place the provider near the root of your application so it initializes
          once and remains active for the lifetime of the page.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Send logs from components</h2>
        <CodeBlock
          language="tsx"
          code={`"use client";

import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.NEXT_PUBLIC_LOGGED_API_KEY!,
});

export function CheckoutButton() {
  async function handleCheckout() {
    try {
      await pay();
      logger.success("Payment completed");
    } catch (error) {
      logger.capture(error, { step: "checkout" });
    }
  }

  return <button onClick={handleCheckout}>Pay now</button>;
}`}
        />
      </section>
    </div>
  );
}
