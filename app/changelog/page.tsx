import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Changelog | Logged",
  description: "Latest updates and improvements to Logged.",
};

export default function ChangelogPage() {
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
          Changelog
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Stay up to date with the latest features, fixes, and improvements.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-lg font-bold text-text">August 28, 2026</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-text-secondary">
              <li>Added privacy policy and terms of service pages</li>
              <li>Improved footer navigation with legal links</li>
              <li>Updated documentation styling for better readability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">August 20, 2026</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-text-secondary">
              <li>Released SDK v1.0.0 with browser console capture</li>
              <li>Introduced automatic error grouping</li>
              <li>Added real-time log streaming dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">August 10, 2026</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-text-secondary">
              <li>Initial public beta launch</li>
              <li>Next.js and React SDK support</li>
              <li>REST API ingestion endpoint</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
