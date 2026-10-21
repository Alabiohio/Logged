import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  FileCheck2, 
  ShieldAlert, 
  KeyRound, 
  Wallet, 
  Server, 
  Scale, 
  Ban, 
  Trash2, 
  HelpCircle, 
  CheckCircle,
  RefreshCw,
  Code
} from "lucide-react";

export const metadata = {
  title: "Terms of Service | Logged",
  description: "Terms of Service for Logged - Application Logging & Error Monitoring Platform by Oheo.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p className="mt-4 text-base text-text-muted">
            Last updated: <span className="font-medium text-text">{lastUpdated}</span>
          </p>
          <p className="mt-1 text-base text-text-muted">
            Effective from: <span className="font-medium text-text">{lastUpdated}</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;Developer&quot;, &quot;you&quot;, or &quot;your&quot;) and <strong>Oheo</strong> (&quot;Oheo&quot;, &quot;Logged&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your access to and use of the Logged error monitoring platform, dashboard, HTTP ingestion APIs, client libraries, and related services.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">API Key Security</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              You are responsible for securing your environment API keys and monitoring ingestion access.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Predictable Billing</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Transparent subscriptions and optional Pay-As-You-Go prepaid wallet settlements via Paystack.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Acceptable Telemetry</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Never send raw primary card numbers or unencrypted sensitive health records in log messages.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5 backdrop-blur-xl">
            <Trash2 className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-bold text-text">Simple Cancellation</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Cancel subscriptions anytime or delete your account to immediately wipe all project data.
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="mt-14 space-y-12 text-sm leading-7 text-text-secondary">

          {/* Section 1 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">1</span>
              <h2 className="text-xl font-bold text-text">Acceptance &amp; Eligibility</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                By registering an account, initializing the <code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-xs text-text">@oheoco/logged</code> SDK in your software, generating API keys, or sending requests to our ingestion endpoints (<code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-xs text-text">/api/v1/logs</code>), you agree to be bound by these Terms and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
              <p>
                If you are entering into these Terms on behalf of a company, organization, or other legal entity, you represent that you have the authority to bind such entity to these Terms. If you do not have such authority or do not agree with any part of these Terms, you must not access or use Logged.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">2</span>
              <h2 className="text-xl font-bold text-text">Description of the Service</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Logged is an application telemetry, structured logging, and real-time error-monitoring platform. Features provided under the service include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Project isolation with environment-scoped API keys (<code className="font-mono text-xs">development</code>, <code className="font-mono text-xs">staging</code>, <code className="font-mono text-xs">production</code>).</li>
                <li>Single and batch HTTP log ingestion supporting metadata, stack traces, and runtime origins.</li>
                <li>JavaScript and TypeScript SDK (<code className="font-mono text-xs">@oheoco/logged</code>) offering manual logging, caught error capturing, browser uncaught rejection listeners (<code className="font-mono text-xs">auto()</code>), and browser console interception.</li>
                <li>Web dashboard providing search, event inspection, analytics, and project activity timelines.</li>
                <li>Automated alert emails for newly ingested errors and optional weekly digests via Resend.</li>
                <li>Automated log retention management and cleanup cron schedules.</li>
              </ul>
              <p className="text-xs text-text-muted">
                We continuously improve our platform. We reserve the right to modify, update, enhance, or discontinue any feature with reasonable notice where practicable.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">3</span>
              <h2 className="text-xl font-bold text-text">User Accounts, Security, &amp; Verification</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                To utilize the platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate, current, and verifiable information during registration. Email verification is mandatory prior to dashboard project access.</li>
                <li>Maintain the strict confidentiality of your authentication credentials and passwords.</li>
                <li>Promptly audit and revoke unrecognized active sessions using the session manager in your security settings.</li>
                <li>Notify us immediately at <a href="mailto:info@oheo.site" className="text-primary hover:underline font-mono">info@oheo.site</a> if you suspect unauthorized access to your account or projects.</li>
              </ul>
              <p>
                You are solely responsible for all activities, API calls, and charges incurred under your account credentials.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">4</span>
              <h2 className="text-xl font-bold text-text">API Key Governance &amp; Developer Responsibilities</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Logged issues scoped API keys for each project environment. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Key Confidentiality:</strong> API keys grant ingestion access to your project. You must not commit API keys to public source code repositories or expose production server keys in untrusted client applications.</li>
                <li><strong>Key Regeneration:</strong> If an API key is compromised, you can and must immediately regenerate the key from the project settings dashboard. Regeneration renders the previous key invalid instantly.</li>
                <li><strong>Rate Limiting &amp; Payloads:</strong> Ingestion requests are subject to system rate limits, a maximum payload size of 100 KB per request, and a maximum batch limit of 100 logs. Automated abuse or deliberate attempts to bypass rate limits will result in temporary or permanent API key suspension.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">5</span>
              <h2 className="text-xl font-bold text-text">Billing, Subscriptions, &amp; Pay-As-You-Go (PAYG)</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Logged offers free tier usage, recurring monthly subscription plans, and Pay-As-You-Go overage billing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Plan Quotas:</strong> Each plan includes an allocated monthly log volume and project threshold. Log consumption resets at the beginning of each billing cycle.
                </li>
                <li>
                  <strong>Pay-As-You-Go Wallet:</strong> For log volume exceeding your monthly plan entitlement, Logged enables automated PAYG settlement via your prepaid wallet. Usage is billed in discrete unit blocks (as configured in your billing preferences). If your wallet balance is exhausted and spending limits are reached, over-quota log ingestion will be rejected until funds are deposited or the billing cycle resets.
                </li>
                <li>
                  <strong>Payment Processing via Paystack:</strong> All payments, recurring card authorizations, and prepaid deposits are facilitated through <strong>Paystack</strong>. You authorize Paystack to charge your designated payment method for applicable subscription fees and wallet top-ups.
                </li>
                <li>
                  <strong>Cancellation &amp; Refunds:</strong> You may cancel a paid subscription at any time via the billing settings. Cancellations take effect at the conclusion of the current prepaid billing period. Except where explicitly required by law, subscription fees and prepaid wallet deposits are non-refundable once consumed.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">6</span>
              <h2 className="text-xl font-bold text-text">Acceptable Use Policy (AUP)</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                You agree to use Logged exclusively for lawful application monitoring and telemetry. You shall not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transmit malicious code, viruses, worms, spyware, or harmful payloads via log messages or metadata.</li>
                <li>Interfere with, disrupt, or place an unreasonable load on Logged infrastructure or upstream service providers.</li>
                <li>Attempt to gain unauthorized access to accounts, administrative routes, internal APIs, or database records.</li>
                <li>Use Logged as a general-purpose file storage, video hosting, or arbitrary large-binary repository.</li>
                <li>Resell, sublicense, or rent the platform to third parties without prior written authorization from Oheo.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">7</span>
              <h2 className="text-xl font-bold text-text">Customer Data &amp; Privacy Obligations</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                As between you and Logged, you retain ownership of all log data, stack traces, and metadata transmitted to your projects (&quot;Customer Data&quot;).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Customer Warranties:</strong> You warrant that you possess all necessary consents, legal bases, and notices required under applicable privacy laws (such as GDPR, CCPA, and NDPA) to collect and transmit Customer Data to Logged.</li>
                <li><strong>Prohibited Sensitive Data:</strong> While Logged maintains automated redaction filters for passwords, secrets, and auth tokens, you agree <em>not</em> to configure your applications to transmit unredacted full credit card numbers, primary account numbers (PAN), personal banking PINs, or protected health information (PHI) to Logged.</li>
                <li><strong>License Grant:</strong> You grant Logged a worldwide, limited license to host, parse, filter, display, and process Customer Data solely as necessary to provide, maintain, and secure the service for you.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">8</span>
              <h2 className="text-xl font-bold text-text">Data Retention, Purges, &amp; Account Termination</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                Application logs are retained according to your plan entitlement:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Automated Retention Lifecycle:</strong> Ingested logs are retained for 7 days on the Free tier, 30 days on Plus plans, or up to 90 days. Records exceeding your retention window are permanently deleted during daily automated purge cycles.</li>
                <li><strong>Customer Termination / Deletion:</strong> You may permanently terminate your account at any time via <em>Settings &gt; Danger Zone</em>. Account deletion triggers a hard database cascade, immediately and permanently deleting all projects, API keys, logs, preferences, and session tokens.</li>
                <li><strong>Suspension by Logged:</strong> We may suspend or terminate your access immediately if you violate these Terms, engage in fraudulent payment activity, or pose a security risk to the platform.</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">9</span>
              <h2 className="text-xl font-bold text-text">Intellectual Property &amp; Open Source</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                The Logged platform, dashboard interfaces, branding, logos, trademarks, and documentation are the exclusive intellectual property of Oheo and its licensors.
              </p>
              <p>
                The client SDK (<code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-xs text-text">@oheoco/logged</code>) is published under the open-source <strong>MIT License</strong>. Your use of the SDK is governed by the terms of the MIT License, while your use of the hosted backend ingestion service and dashboard is governed by these Terms.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">10</span>
              <h2 className="text-xl font-bold text-text">Warranty Disclaimer</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p className="uppercase text-xs tracking-wider font-semibold text-text">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OHEO AND ITS AFFILIATES DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ENTIRELY FREE OF VULNERABILITIES.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">11</span>
              <h2 className="text-xl font-bold text-text">Limitation of Liability</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OHEO, ITS DIRECTORS, EMPLOYEES, PARTNERS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICE.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO LOGGED UNDER THESE TERMS IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED US DOLLARS ($100 USD), WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">12</span>
              <h2 className="text-xl font-bold text-text">Indemnification</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                You agree to defend, indemnify, and hold harmless Oheo, its affiliates, licensors, and their respective officers and employees from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or legal fees arising out of or relating to your violation of these Terms, your Customer Data, or your breach of any third-party rights or applicable laws.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">13</span>
              <h2 className="text-xl font-bold text-text">Governing Law &amp; Dispute Resolution</h2>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles.
              </p>
              <p>
                In the event of any controversy or claim arising out of these Terms, the parties agree to first attempt in good faith to resolve the dispute through informal direct negotiation by contacting <a href="mailto:info@oheo.site" className="text-primary hover:underline font-mono">info@oheo.site</a> before initiating formal arbitration or judicial proceedings.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section className="rounded-3xl border border-border bg-glass p-7 sm:p-9 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">14</span>
              <h2 className="text-xl font-bold text-text">Contact Information</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                For legal notices, terms inquiries, or formal questions regarding this agreement, please contact:
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-background-secondary/40 p-5 space-y-2 text-xs">
                <p><strong>Service Operator:</strong> Oheo</p>
                <p><strong>Legal &amp; Support Inquiries:</strong> <a href="mailto:legal@oheo.site" className="text-primary hover:underline font-mono">info@oheo.site</a></p>
                <p><strong>Contact Portal:</strong> <a href="https://oheo.site/contact" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">oheo.site/contact</a></p>
                <p><strong>Platform Status &amp; Uptime:</strong> <Link href="/status" className="text-primary hover:underline">logged.oheo.site/status</Link></p>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}
