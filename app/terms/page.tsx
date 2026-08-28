import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Logged",
  description: "Terms of Service for Logged - Error Monitoring for Modern Apps",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Last updated: August 28, 2026
        </p>

        <div className="mt-12 space-y-8 text-sm leading-7 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text">1. Acceptance of Terms</h2>
            <p className="mt-4">
              By accessing or using Logged's services, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">2. Description of Service</h2>
            <p className="mt-4">
              Logged provides an error monitoring and logging platform that allows
              developers to track, inspect, and debug application errors in real time.
              We reserve the right to modify, suspend, or discontinue any part of the
              service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">3. User Accounts</h2>
            <p className="mt-4">
              You are responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account. You
              agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">4. Acceptable Use</h2>
            <p className="mt-4">
              You agree not to use the service for any unlawful purpose, to transmit
              malicious code, to interfere with the service's operation, or to attempt
              to gain unauthorized access to any portion of the service or any systems
              connected to it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">5. Intellectual Property</h2>
            <p className="mt-4">
              All content, features, and functionality of the Logged platform,
              including but not limited to text, graphics, logos, and software, are
              the exclusive property of Logged, Inc. and are protected by
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">6. Limitation of Liability</h2>
            <p className="mt-4">
              To the fullest extent permitted by law, Logged shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits or revenues, whether incurred directly or
              indirectly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">7. Changes to Terms</h2>
            <p className="mt-4">
              We may update these Terms of Service from time to time. We will notify
              you of any material changes by posting the new terms on our website or
              via email. Your continued use of the service after such modifications
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">8. Contact Information</h2>
            <p className="mt-4">
              If you have any questions about these Terms of Service, please contact us
              at legal@logged.dev.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
