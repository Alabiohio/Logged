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

        <div className="mt-12 space-y-8 text-sm leading-7 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text">Base URL</h2>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
              https://api.logged.dev/v1
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
            <h2 className="text-xl font-bold text-text">Send Logs</h2>
            <p className="mt-4">
              POST /logs - Send log entries to Logged for storage and analysis.
            </p>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`curl -X POST https://api.logged.dev/v1/logs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "error",
    "message": "Something went wrong",
    "service": "my-app",
    "timestamp": "2026-08-28T19:00:00Z"
  }'`}
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Response</h2>
            <pre className="mt-4 rounded-xl border border-border bg-background p-4 font-mono text-xs text-text">
{`{
  "id": "log_123abc",
  "status": "accepted",
  "timestamp": "2026-08-28T19:00:00Z"
}`}
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Error Codes</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><span className="font-mono text-text">400</span> - Bad Request</li>
              <li><span className="font-mono text-text">401</span> - Unauthorized</li>
              <li><span className="font-mono text-text">429</span> - Rate Limited</li>
              <li><span className="font-mono text-text">500</span> - Server Error</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
