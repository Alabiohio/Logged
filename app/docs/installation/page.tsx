import Link from "next/link";
import { Code, Key, Server, ArrowRight } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function InstallationPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          Installation
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Add Logged to your application in minutes. The SDK is lightweight,
          works in the browser and Node.js, and sends logs to the Logged API.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Install the SDK</h2>
        <CodeBlock
          language="bash"
          code="npm install @logged/sdk"
        />
        <p className="text-sm text-text-secondary">
          This installs the <code className="font-mono text-primary">@logged/sdk</code> package
          into your project.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Initialize the client</h2>
        <CodeBlock
          language="typescript"
          code={`import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});`}
        />
        <Callout variant="info" title="API key">
          You can find your API key in the Logged dashboard under{" "}
          <span className="font-mono text-xs">Project → Settings → API Key</span>.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Send a log</h2>
        <CodeBlock
          language="typescript"
          code={`logger.info("Application started");`}
        />
        <p className="text-sm text-text-secondary">
          That&apos;s enough to send your first log. Open the dashboard to see it appear
          in real time.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Configuration options</h2>
        <p className="text-sm text-text-secondary">
          The <code className="font-mono text-primary">Logged</code> constructor accepts the
          following options:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-semibold text-text">Property</th>
                <th className="pb-3 pr-4 font-semibold text-text">Required</th>
                <th className="pb-3 font-semibold text-text">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">apiKey</td>
                <td className="py-3 pr-4 text-text-secondary">Yes</td>
                <td className="py-3 text-text-secondary">Project API key from the dashboard.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">environment</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">Application environment, for example development, staging, or production.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">baseUrl</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">Logged API URL. Defaults to the app URL.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">debug</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">Enable SDK debug logging to the browser or Node console.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Where to store your API key</h2>
        <Callout variant="warning" title="Security">
          Never commit API keys to source control. Use environment variables or a
          secrets manager instead.
        </Callout>
        <p className="text-sm text-text-secondary">
          For server-side applications, use a standard environment variable such as{" "}
          <code className="font-mono text-primary">LOGGED_API_KEY</code>. For browser
          applications, prefix the variable with{" "}
          <code className="font-mono text-primary">NEXT_PUBLIC_</code> or{" "}
          <code className="font-mono text-primary">VITE_</code> so it is available at
          runtime.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Next steps</h2>
        <p className="text-sm text-text-secondary">
          Once Logged is installed, follow the Quick Start to create a project and
          send your first log.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/docs/quick-start"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Quick Start
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs/sdk"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-glass-hover"
          >
            Explore the SDK
          </Link>
        </div>
      </section>
    </div>
  );
}
