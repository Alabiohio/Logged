"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { authClient } from "@/lib/auth-client";
import { LogIn } from "lucide-react";
import LogoLoading from "@/components/LogoLoading";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading) {
      if (!session?.user) {
        router.push("/login");
      } else {
        const currentUser = session.user as { username?: string };
        if (!currentUser.username || currentUser.username.trim() === "") {
          router.push("/set-username");
        }
      }
    }
  }, [session, sessionLoading, router]);

  const openMenu = () => {
    setMobileOpen(true);
    setDrawerVisible(true);
  };

  const closeMenu = () => {
    setDrawerVisible(false);
    window.setTimeout(() => setMobileOpen(false), 220);
  };

  useEffect(() => {
    if (!mobileOpen) {
      setDrawerVisible(false);
    }
  }, [mobileOpen]);

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <LogoLoading className="w-32 h-32" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <LogIn className="h-12 w-12 text-text-muted/40" />
          <div>
            <h2 className="text-lg font-bold text-text">Authentication Required</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Please sign in to access the dashboard.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text">
      <Sidebar 
        mobileOpen={mobileOpen} 
        drawerVisible={drawerVisible} 
        closeMenu={closeMenu} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar openMenu={openMenu} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
