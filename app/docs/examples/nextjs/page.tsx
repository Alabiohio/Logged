import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata: Metadata = {
  title: "Next.js Example | Logged",
  description:
    "Use Logged in a Next.js App Router project by initializing the SDK in a client component.",
};

export default function NextJsExamplePage() {
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
import { Logged } from "@oheoco/logged";

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

import { Logged } from "@oheoco/logged";

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

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Continue learning</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/examples/react" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">React</p>
            <p className="mt-2 text-sm text-text-secondary">Use the same SDK in a Vite or CRA app.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View example
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/examples/javascript" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">JavaScript</p>
            <p className="mt-2 text-sm text-text-secondary">Use Logged without a framework or React setup.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Browse guide
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/sdk/auto" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">Auto Capture</p>
            <p className="mt-2 text-sm text-text-secondary">Add automatic browser error collection.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Learn more
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
