import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata: Metadata = {
  title: "React Example | Logged",
  description:
    "Use Logged in a React application with Vite or Create React App.",
};

export default function ReactExamplePage() {
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
          React
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Use Logged in a React application with Vite or Create React App.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Initialize Logged</h2>
        <CodeBlock
          language="tsx"
          code={`import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: import.meta.env.VITE_LOGGED_API_KEY,
});`}
        />
        <Callout variant="info" title="Environment variables">
          In Vite, expose the API key to the browser by prefixing it with{" "}
          <span className="font-mono text-xs">VITE_</span>. Never commit real keys
          to source control.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Send logs</h2>
        <CodeBlock
          language="tsx"
          code={`function App() {
  useEffect(() => {
    logger.info("Application loaded");
    logger.auto();
    logger.interceptConsole();
  }, []);

  return <div>Hello world</div>;
}`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          You can call logger methods from event handlers, effects, or anywhere
          else in your application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Capture errors</h2>
        <CodeBlock
          language="tsx"
          code={`async function submitForm(data: FormData) {
  try {
    await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    logger.success("Form submitted");
  } catch (error) {
    logger.capture(error, {
      form: "contact",
    });
  }
}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Continue learning</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/examples/nextjs" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">Next.js</p>
            <p className="mt-2 text-sm text-text-secondary">See the App Router pattern for browser log capture.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View example
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/examples/javascript" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">JavaScript</p>
            <p className="mt-2 text-sm text-text-secondary">Use the SDK in plain JS or TypeScript projects.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Browse guide
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
          <Link href="/docs/sdk" className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-background-secondary">
            <p className="text-sm font-semibold text-text">SDK</p>
            <p className="mt-2 text-sm text-text-secondary">Learn the core API and capture features in depth.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Explore docs
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
