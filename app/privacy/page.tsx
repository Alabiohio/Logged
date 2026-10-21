import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Lock,
  Clock,
  CreditCard,
  Server,
  Trash2,
  Cookie,
  Mail,
  EyeOff,
  Layers,
  FileText
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Logged",
  description: "Comprehensive Privacy Policy for Logged - Error Monitoring and Observability Platform by Oheo.",
};

export default function PrivacyPage() {
  const lastUpdated = "October 21, 2026";

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none isolate will-change-transform">
        <div className="absolute left-[-140px] top-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute right-[-120px] top-64 h-[420px] w-[420px] rounded-full bg-info/15 blur-[100px]" />
        <div className="absolute bottom-10 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-soft blur-[120px]" />
      </div>

      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-28">
        {/* Header Badge & Title */}
        <div className="text-center sm:text-left">

          <h1 className="mt-10 text-4xl font-black tracking-tight text-text sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-base text-text-muted">
            Last updated: <span className="font-medium text-text">{lastUpdated}</span>
          </p>
          <p className="mt-1 text-base text-text-muted">
            Effective from: <span className="font-medium text-text">{lastUpdated}</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            This Privacy Policy describes how Logged (&quot;Logged&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), developed by <strong>Oheo</strong>, collects, processes, protects, and retains your information when you access our hosted service at <Link href="https://logged.oheo.site" className="text-primary hover:underline">logged.oheo.site</Link>, use our APIs, install the <code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-xs text-text">@oheoco/logged</code> SDK, or otherwise interact with our error monitoring and observability platform.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <EyeOff className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Auto-Redacted Secrets</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Passwords, tokens, authorization headers, and API keys are automatically stripped upon ingestion.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Zero Card Storage</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Payment card data is processed directly by Paystack (PCI-DSS Level 1); we never store raw card numbers.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Automated Retention</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Telemetry logs automatically purge based on your plan retention tier (7 to 90 days).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <Trash2 className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Full Right to Erasure</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              One-click account deletion permanently wipes all user projects, API keys, credentials, and log data.
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="mt-14 space-y-12 text-sm leading-7 text-text-secondary">

          {/* Section 1 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">1</span>
              <h2 className="text-xl font-bold text-text">Roles: Controller vs. Processor</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Depending on how you interact with Logged, we operate in two distinct capacities under privacy legislation (including GDPR, UK GDPR, and the Nigeria Data Protection Act / NDPA):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Logged as a Data Controller:</strong> When you register an account, configure profile preferences, purchase a plan, deposit into your wallet, access our dashboard, or submit feedback, we act as the Controller for your account details, identity, and billing data.
                </li>
                <li>
                  <strong>Logged as a Data Processor:</strong> When you integrate our SDK (<code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">@oheoco/logged</code>) or ingest application logs via our REST API (<code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">POST /api/v1/logs</code>), you (the developer or customer) are the Data Controller of that application data, and Logged acts as a Data Processor executing telemetry collection on your behalf.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">2</span>
              <h2 className="text-xl font-bold text-text">Information We Collect</h2>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-text text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  A. Account &amp; Identity Credentials
                </h3>
                <p className="mt-2">
                  When you sign up or authenticate with Logged, we collect:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Full name, primary email address, username, and optional display username.</li>
                  <li>Cryptographically hashed passwords (for email and password registrations). We never store raw passwords.</li>
                  <li>Third-party OAuth metadata if signing in via Google or GitHub (provider account ID, email, profile avatar URL).</li>
                  <li>Email verification state, reset password tokens, and account creation timestamps.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-text text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  B. Application Telemetry &amp; Ingested Logs
                </h3>
                <p className="mt-2">
                  When your client, edge, or backend applications transmit events to Logged, we collect and store:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li><strong>Log Properties:</strong> Log severity levels (<code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">log</code>, <code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">debug</code>, <code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">info</code>, <code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">success</code>, <code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">warn</code>, <code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">error</code>), message text, and optional client-supplied timestamps.</li>
                  <li><strong>Error Diagnostics:</strong> Exception messages, error names, and full call stack traces (<code className="font-mono text-xs">stack</code>).</li>
                  <li><strong>Contextual Metadata:</strong> Application context supplied in custom JSON metadata objects, browser URLs, routing pathnames, and runtime sources (<code className="font-mono text-xs">server</code>, <code className="font-mono text-xs">client</code>, or <code className="font-mono text-xs">edge</code>).</li>
                  <li><strong>Originating Environment:</strong> Target environment labels (<code className="font-mono text-xs">development</code>, <code className="font-mono text-xs">staging</code>, or <code className="font-mono text-xs">production</code>).</li>
                  <li><strong>Network Telemetry:</strong> Client IP address (extracted from <code className="font-mono text-xs">x-forwarded-for</code> or <code className="font-mono text-xs">x-real-ip</code> request headers) and the HTTP <code className="font-mono text-xs">User-Agent</code> header.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-text text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  C. Billing &amp; Payment Details
                </h3>
                <p className="mt-2">
                  If you subscribe to a paid tier or use our Pay-As-You-Go (PAYG) prepaid wallet:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li><strong>Billing Profiles:</strong> Billing classification (individual vs. company), full billing name, email, phone number, company name, Tax Identification Number (TIN / VAT), and billing address (street, city, region, postal code, and country).</li>
                  <li><strong>Transaction Records:</strong> Prepaid wallet balances, transaction timestamps, debit amounts for log consumption units, Paystack customer codes, and provider reference IDs.</li>
                  <li><strong>Payment Card Data:</strong> All payments are processed directly by <strong>Paystack</strong>. Sensitive credit/debit card numbers, CVVs, and banking credentials are handled exclusively by Paystack in accordance with PCI-DSS Level 1 standards and are <em>never</em> received, logged, or stored on Logged servers.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-text text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  D. Security, Device, and Session Diagnostics
                </h3>
                <p className="mt-2">
                  To protect your account and investigate security incidents:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Active session tokens, session creation dates, expiration dates, device categorization (Mobile, Desktop, Browser type), and login IP addresses visible within your security settings.</li>
                  <li>Security audit entries capturing IP addresses, attempted paths, user IDs, and timestamps when unauthorized access to restricted endpoints is detected.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-text text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  E. Feedback, Communications, &amp; Preferences
                </h3>
                <p className="mt-2">
                  When you submit inquiries or use our in-app feedback dialog, we store your selected feedback category (Bug, Feature, General), rating score, written feedback, and email (with an option for anonymous submission). We also store your notification preferences (email alerts, weekly digest toggle, and soft retention defaults).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">3</span>
              <h2 className="text-xl font-bold text-text">Automated Data Redaction &amp; Sanitization</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Logged is engineered with a privacy-by-design ingestion pipeline. Every incoming log undergoes automatic sanitization before it touches our persistence layer:
              </p>
              <div className="rounded-2xl border border-border bg-background-secondary/60 p-4 font-mono text-xs space-y-2">
                <p className="font-semibold text-text">Built-in Redaction Rule Highlights:</p>
                <p className="text-text-secondary">
                  Keys matching: <span className="text-primary">password</span>, <span className="text-primary">secret</span>, <span className="text-primary">token</span>, <span className="text-primary">apikey</span>, <span className="text-primary">accesstoken</span>, <span className="text-primary">refreshtoken</span>, <span className="text-primary">authorization</span>, <span className="text-primary">bearer</span>, <span className="text-primary">cookie</span>, <span className="text-primary">sessionid</span>, <span className="text-primary">jwt</span>, <span className="text-primary">credential</span>, <span className="text-primary">clientsecret</span>, or <span className="text-primary">privatekey</span> are replaced with <span className="font-bold text-error">[REDACTED]</span>.
                </p>
                <p className="text-text-secondary">
                  Authorization header strings, Bearer tokens, and token-pattern values are automatically stripped from error messages and stack traces.
                </p>
              </div>
              <p className="text-xs text-text-muted">
                Note: While our sanitizer catches standard tokens and secret keys, developers remain responsible for ensuring their applications do not transmit unencrypted highly sensitive personal data (e.g., medical records, full card numbers) in arbitrary free-text log messages.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">4</span>
              <h2 className="text-xl font-bold text-text">How We Use Your Information</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p>We process collected data exclusively for valid operational and legal purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Delivery:</strong> Ingesting, parsing, indexing, and presenting logs, errors, and traces in your authenticated dashboard.</li>
                <li><strong>Automated Notifications:</strong> Dispatching real-time error alert emails when critical exceptions occur in your projects, and sending opt-in weekly digest summaries via Resend.</li>
                <li><strong>Account Administration:</strong> Authenticating user sessions, issuing environment-specific API keys, facilitating password resets, and sending email verifications.</li>
                <li><strong>Billing &amp; Usage Reconciliation:</strong> Tracking monthly ingested log quotas, calculating Pay-As-You-Go units, and debiting prepaid balances accurately.</li>
                <li><strong>Platform Security &amp; Fraud Prevention:</strong> Protecting API endpoints from abuse, enforcing rate limits per project API key, blocking unauthorized admin attempts, and safeguarding infrastructure.</li>
                <li><strong>Continuous Improvement:</strong> Analyzing aggregated, anonymized usage metrics (e.g., active dashboard features) to improve platform stability and user experience.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">5</span>
              <h2 className="text-xl font-bold text-text">Cookies &amp; Analytics</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                We use cookies and browser storage strictly to ensure platform security, preserve user sessions, and gather consented analytics:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="rounded-2xl border border-border bg-background-secondary/40 p-4">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-text">Essential Cookies</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                    Required for user authentication, security verification, CSRF mitigation, and maintaining your signed-in state. These cannot be disabled as the dashboard cannot function without them.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background-secondary/40 p-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-text">Analytics &amp; Performance</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                    We use Google Analytics (<code className="font-mono text-xs">gtag.js</code>) to evaluate dashboard interactions (e.g., project switching, key copying). You can manage or customize cookie preferences at any time via the cookie banner or footer link.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">6</span>
              <h2 className="text-xl font-bold text-text">Third-Party Service Providers (Subprocessors)</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                We engage trusted, enterprise-grade third-party service providers to assist in operating Logged. Each subprocessor is bound by rigorous data protection standards:
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div>
                    <span className="font-bold text-text">Paystack</span>
                    <p className="text-xs text-text-muted">Payment gateway, subscription recurring billing, and prepaid wallet settlements.</p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-mono text-text-secondary">PCI-DSS Level 1</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div>
                    <span className="font-bold text-text">Resend</span>
                    <p className="text-xs text-text-muted">Transactional email delivery for verification, password resets, digests, and error alerts.</p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-mono text-text-secondary">Encrypted SMTP / TLS</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div>
                    <span className="font-bold text-text">Neon</span>
                    <p className="text-xs text-text-muted">Managed PostgreSQL cloud database hosting application records and partitioned logs.</p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-mono text-text-secondary">Encrypted at rest &amp; in transit</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div>
                    <span className="font-bold text-text">Vercel</span>
                    <p className="text-xs text-text-muted">Global edge network, application hosting, serverless execution, and scheduled cron jobs.</p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-mono text-text-secondary">SOC2 Type II / ISO 27001</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div>
                    <span className="font-bold text-text">Google Analytics</span>
                    <p className="text-xs text-text-muted">Web measurement and usage analytics (subject to user consent preferences).</p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-mono text-text-secondary">Consent Mode v2</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">7</span>
              <h2 className="text-xl font-bold text-text">Data Retention &amp; Scheduled Purging</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                We do not retain application telemetry indefinitely. Log records are maintained according to clear, plan-specific lifecycle policies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free Tier Projects:</strong> Telemetry logs are retained for <strong>7 days</strong>.</li>
                <li><strong>Plus / Paid Plans:</strong> Telemetry logs are retained for <strong>30 days</strong> (or extended up to plan entitlement).</li>
                <li><strong>Automated Purge Cron:</strong> An automated scheduled maintenance cron job (<code className="rounded bg-background-secondary px-1 font-mono text-xs text-text">/api/cron/purge-logs</code>) runs daily to permanently delete records exceeding their respective cutoff date.</li>
                <li><strong>Account Credentials:</strong> Account data and project metadata are retained for as long as your account remains active.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">8</span>
              <h2 className="text-xl font-bold text-text">Your Data Rights &amp; One-Click Erasure</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Regardless of your geographic location, Logged provides you with comprehensive privacy controls:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right of Access &amp; Portability:</strong> You can view all projects, API keys, logs, billing transactions, and active sessions directly within the authenticated dashboard.</li>
                <li><strong>Right to Rectification:</strong> You can update your profile name, usernames, passwords, connected OAuth accounts, and billing profile at any time.</li>
                <li><strong>Right to Session Revocation:</strong> You can inspect active device logins and remotely terminate any unrecognized session with immediate effect.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Under <em>Settings &gt; Danger Zone</em>, you have the right to permanently delete your account. Confirming deletion immediately executes a hard cascade delete: all projects, API keys, ingested logs, preferences, and account credentials are permanently erased from our production databases.</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">9</span>
              <h2 className="text-xl font-bold text-text">Security Safeguards</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                We implement rigorous technical and organizational measures to safeguard your information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>End-to-end transport layer encryption (TLS 1.3) for all web, dashboard, and ingestion API traffic.</li>
                <li>Cryptographic hashing of project API keys using secure hash algorithms; raw keys are never stored in plain text.</li>
                <li>Session security utilizing HTTP-only, SameSite secure authentication cookies.</li>
                <li>Automated security alerts sent to administrators upon unauthorized access attempts to protected endpoints.</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">10</span>
              <h2 className="text-xl font-bold text-text">Contact Information</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                If you have questions, feedback, or data privacy requests concerning this Privacy Policy, please reach out to our privacy and security team:
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-background-secondary/40 p-5 space-y-2 text-xs">
                <p><strong>Service Operator:</strong> Oheo</p>
                <p><strong>Direct Inquiries:</strong> <a href="mailto:legal@oheo.site" className="text-primary hover:underline font-mono">info@oheo.site</a></p>
                <p><strong>Support &amp; Inquiries:</strong> <a href="https://oheo.site/inquiry" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">oheo.site/contact</a></p>
                <p><strong>Platform Status:</strong> <Link href="/status" className="text-primary hover:underline">logged.oheo.site/status</Link></p>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}
