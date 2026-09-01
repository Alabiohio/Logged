import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const metadata = {
  title: "Status | Logged",
  description: "Logged system status and uptime information.",
};

export const revalidate = 60; // Check every 60 seconds

async function checkDatabase() {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    return false;
  }
}

export default async function StatusPage() {
  const isDbOperational = await checkDatabase();

  const getStatusBadge = (isOperational: boolean) => {
    if (isOperational) {
      return (
        <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Operational
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Degraded
      </span>
    );
  };

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
          System Status
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          Real-time status of Logged services and infrastructure.
        </p>

        <div className="mt-12 space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">API</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Log ingestion and REST API endpoints
                </p>
              </div>
              {getStatusBadge(isDbOperational)}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">Dashboard</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Web dashboard and log viewer
                </p>
              </div>
              {getStatusBadge(isDbOperational)}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">SDKs</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  JavaScript, TypeScript, Node.js, and browser SDKs
                </p>
              </div>
              {getStatusBadge(true)}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
