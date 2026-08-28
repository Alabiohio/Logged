import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Logged",
  description: "Privacy Policy for Logged - Error Monitoring for Modern Apps",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Last updated: August 28, 2026
        </p>

        <div className="mt-12 space-y-8 text-sm leading-7 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text">1. Introduction</h2>
            <p className="mt-4">
              Logged ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our error monitoring and logging platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">2. Information We Collect</h2>
            <p className="mt-4">
              We collect information you provide directly to us, such as account
              registration details, and information collected automatically when you
              use our services, including log data, error reports, device information,
              and usage analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">3. How We Use Your Information</h2>
            <p className="mt-4">
              We use the information we collect to provide, maintain, and improve our
              services, to communicate with you, to monitor and analyze usage and
              trends, and to detect, investigate, and prevent fraudulent or
              unauthorized activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">4. Data Security</h2>
            <p className="mt-4">
              We implement appropriate technical and organizational security measures
              to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">5. Data Retention</h2>
            <p className="mt-4">
              We retain your information for as long as your account is active or as
              needed to provide you with our services. You may request deletion of
              your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">6. Your Rights</h2>
            <p className="mt-4">
              Depending on your location, you may have certain rights regarding your
              personal information, including the right to access, correct, or delete
              your data. To exercise these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text">7. Contact Us</h2>
            <p className="mt-4">
              If you have any questions about this Privacy Policy, please contact us
              at privacy@logged.dev.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
