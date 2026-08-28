import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/docs/callout";
import { CodeBlock } from "@/components/docs/code-block";

export default function RestApiPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          REST API
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Send logs directly to Logged using the REST API. This is useful when
          you cannot use the SDK or need to debug ingestion outside your
          application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Endpoint</h2>
        <CodeBlock
          language="http"
          code="POST /api/v1/logs"
        />
        <p className="text-sm leading-7 text-text-secondary">
          The API accepts single log objects as well as batches of logs.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Authentication</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Include your project API key in the Authorization header as a Bearer
          token.
        </p>
        <CodeBlock
          language="http"
          code={`Authorization: Bearer YOUR_API_KEY`}
        />
        <Callout variant="warning" title="Keep your key secret">
          Do not expose your API key in client-side code that runs in users&apos;
          browsers. Use a backend proxy if you need to ingest logs from a
          public client.
        </Callout>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Request body</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Send a JSON object with at least a level and message.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "level": "error",
  "message": "Database timeout",
  "metadata": {
    "query": "users"
  },
  "environment": "production",
  "source": "server",
  "url": "https://example.com/api/users",
  "pathname": "/api/users",
  "stack": "Error: Database timeout\\n  at ...",
  "timestamp": "2026-08-28T16:00:00.000Z"
}`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-semibold text-text">Field</th>
                <th className="pb-3 pr-4 font-semibold text-text">Required</th>
                <th className="pb-3 font-semibold text-text">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">level</td>
                <td className="py-3 pr-4 text-text-secondary">Yes</td>
                <td className="py-3 text-text-secondary">
                  Log severity. Must be one of: log, debug, info, success, warn, error.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">message</td>
                <td className="py-3 pr-4 text-text-secondary">Yes</td>
                <td className="py-3 text-text-secondary">
                  Human-readable log message.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">metadata</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  Arbitrary key-value pairs for additional debugging context.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">environment</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  Application environment. Must be one of: development, staging, production.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">source</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  Log source. Must be one of: server, client, edge.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">url</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">Full URL where the log originated.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">pathname</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  URL pathname where the log originated.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">stack</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  Stack trace or error stack text.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">timestamp</td>
                <td className="py-3 pr-4 text-text-secondary">No</td>
                <td className="py-3 text-text-secondary">
                  ISO-8601 timestamp. Defaults to server time if omitted.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Batch ingestion</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Send up to 100 logs in a single request by wrapping them in a{" "}
          <code className="font-mono text-primary">logs</code> array.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "logs": [
    {
      "level": "info",
      "message": "Job started",
      "environment": "production"
    },
    {
      "level": "error",
      "message": "Job failed",
      "environment": "production"
    }
  ]
}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Success response</h2>
        <CodeBlock
          language="json"
          code={`{
  "success": true,
  "id": "log_123"
}`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          For batch requests, the response includes an accepted count and
          rejected count.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "success": true,
  "accepted": 2,
  "rejected": 0
}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Errors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-semibold text-text">Status</th>
                <th className="pb-3 font-semibold text-text">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">401</td>
                <td className="py-3 text-text-secondary">
                  Invalid or missing API key.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">400</td>
                <td className="py-3 text-text-secondary">
                  Invalid request body or log fields.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">404</td>
                <td className="py-3 text-text-secondary">
                  Project or resource not found.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">429</td>
                <td className="py-3 text-text-secondary">
                  Too many requests. Respect the Retry-After header.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-primary text-xs">500</td>
                <td className="py-3 text-text-secondary">
                  Server error. Retry with backoff.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">cURL example</h2>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://localhost:3000/api/v1/logs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "error",
    "message": "Database timeout",
    "environment": "production"
  }'`}
        />
        <p className="text-sm leading-7 text-text-secondary">
          Replace <code className="font-mono text-primary">localhost:3000</code> with
          your Logged API host if different.
        </p>
      </section>
    </div>
  );
}
