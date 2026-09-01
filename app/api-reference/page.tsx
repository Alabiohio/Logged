import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "API Reference | Logged",
  description: "REST API reference for Logged error monitoring and logging platform.",
};

export default function ApiReferencePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-info/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-light/30 blur-[150px]" />
      </div>

      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-black tracking-tight text-text sm:text-5xl">
          API Reference
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Send logs directly to Logged using our REST API.
        </p>

        <div className="mt-12 space-y-12 text-sm leading-7 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text">Base URL</h2>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
              https://logged.oheo.site/api/v1
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Authentication</h2>
            <p className="mt-4">
              Authenticate requests using a bearer token in the Authorization header.
            </p>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
              Authorization: Bearer YOUR_API_KEY
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Send a Single Log</h2>
            <p className="mt-4">
              <span className="font-mono font-bold text-text">POST /logs</span> - Send a single log entry to Logged.
            </p>
            <p className="mt-2 text-text-muted">
              Supported fields:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
              <li><code className="text-text">level</code> (required): One of <code className="text-text">log, debug, info, success, warn, error</code>.</li>
              <li><code className="text-text">message</code> (required): The log message string (max 10KB).</li>
              <li><code className="text-text">metadata</code> (optional): A JSON object with custom data (max 50KB).</li>
              <li><code className="text-text">source</code> (optional): One of <code className="text-text">server, client, edge</code>.</li>
              <li><code className="text-text">url, pathname, stack, timestamp</code> (optional strings).</li>
            </ul>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`curl -X POST https://logged.oheo.site/api/v1/logs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "error",
    "message": "Failed to connect to database",
    "source": "server",
    "metadata": { "userId": "123", "retryCount": 3 }
  }'`}
            </pre>
            <p className="mt-4 font-bold text-text">Response</p>
            <pre className="mt-2 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`{
  "success": true,
  "id": "log_abc123"
}`}
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Send Batch Logs</h2>
            <p className="mt-4">
              <span className="font-mono font-bold text-text">POST /logs</span> - Send multiple log entries in a single request.
            </p>
            <p className="mt-2 text-text-muted">
              Provide an object with a <code className="text-text">logs</code> array. Maximum of 100 logs per batch.
            </p>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`curl -X POST https://logged.oheo.site/api/v1/logs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "logs": [
      {
        "level": "info",
        "message": "User login successful"
      },
      {
        "level": "error",
        "message": "Payment processing failed"
      }
    ]
  }'`}
            </pre>
            <p className="mt-4 font-bold text-text">Response</p>
            <pre className="mt-2 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`{
  "success": true,
  "accepted": 2,
  "rejected": 0
}`}
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Error Codes</h2>
            <p className="mt-2 text-text-muted">Max request body size is 100 KB.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><span className="font-mono text-text">400</span> - Bad Request (e.g., <code className="text-text">INVALID_JSON</code>, <code className="text-text">INVALID_LOG</code>)</li>
              <li><span className="font-mono text-text">401</span> - Unauthorized (<code className="text-text">INVALID_API_KEY</code>)</li>
              <li><span className="font-mono text-text">413</span> - Payload Too Large (Request body exceeds 100 KB limit)</li>
              <li><span className="font-mono text-text">429</span> - Rate Limited (<code className="text-text">RATE_LIMITED</code>)</li>
              <li><span className="font-mono text-text">500</span> - Server Error</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
