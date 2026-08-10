import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/Faq";
import Footer from "@/components/Footer";
import CTA from "@/components/Cta";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-info/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-light/30 blur-[150px]" />
    </div>

      <Navbar />
      <Hero />
      <DashboardPreview />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}