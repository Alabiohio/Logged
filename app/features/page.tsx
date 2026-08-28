import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Features | Logged",
  description: "Explore Logged's error monitoring and logging features.",
};

export default function FeaturesPage() {
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
          Features
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Everything you need to monitor, debug, and improve your applications.
        </p>

        <div className="mt-12 space-y-8 text-sm leading-7 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text">Real-Time Log Streaming</h2>
            <p className="mt-4">
              Stream logs from your applications in real time. View logs as they
              happen, filter by severity, and search across your entire fleet
              instantly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Error Tracking & Grouping</h2>
            <p className="mt-4">
              Automatically group similar errors together so you can focus on
              fixing issues, not noise. Get stack traces, breadcrumbs, and
              context for every error.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Performance Monitoring</h2>
            <p className="mt-4">
              Track request latency, throughput, and error rates across your
              services. Identify slow endpoints and performance bottlenecks
              before they impact users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">SDKs for Every Stack</h2>
            <p className="mt-4">
              First-class SDKs for JavaScript, TypeScript, Next.js, React, Node.js,
              and more. Drop-in integration with automatic error capture and
              console interception.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Alerting & Integrations</h2>
            <p className="mt-4">
              Get notified via Slack, email, or webhooks when critical errors
              spike. Connect Logged to your existing workflow and on-call tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">Privacy-First Design</h2>
            <p className="mt-4">
              Built with privacy in mind. Redact sensitive data, control retention
              policies, and keep your logs secure with role-based access control.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
