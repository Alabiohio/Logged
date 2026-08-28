import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function ReactExamplePage() {
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
          code={`import { Logged } from "@logged/sdk";

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
    </div>
  );
}
