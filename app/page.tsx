import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/Faq";
import Footer from "@/components/Footer";
import CTA from "@/components/Cta";
import TheProblem from "@/components/landing/TheProblem";
import WhyLogged from "@/components/landing/WhyLogged";
import InterestingFacts from "@/components/landing/InterestingFacts";
import Comparison from "@/components/landing/Comparison";
import QuickDemo from "@/components/landing/QuickDemo";
import ProcessPipeline from "@/components/landing/ProcessPipeline";

export const metadata: Metadata = {
  title: {
    absolute: "Logged | Error Monitoring for Modern Apps",
  },
  description:
    "Track errors, inspect logs, and understand product issues in real time with Logged.",
};

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none isolate will-change-transform">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-info/15 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <Hero />
      <DashboardPreview />
      <TheProblem />
      <ProcessPipeline />
      <WhyLogged />
      <InterestingFacts />
      <Comparison />
      <QuickDemo />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}