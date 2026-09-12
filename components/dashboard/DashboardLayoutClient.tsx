"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { authClient } from "@/lib/auth-client";
import { LogIn } from "lucide-react";
import LogoLoading from "@/components/LogoLoading";
import Link from "next/link";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const authCheckedRef = useRef(false);
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  if (!mobileOpen && drawerVisible) {
    setDrawerVisible(false);
  }

  useEffect(() => {
    if (sessionLoading) return;

    if (!authCheckedRef.current) {
      authCheckedRef.current = true;
      return;
    }

    if (!session?.user) {
      const timer = setTimeout(async () => {
        const { data } = await authClient.getSession();
        if (!data?.user) {
          router.replace("/login");
        }
      }, 800);
      return () => clearTimeout(timer);
    }

    const currentUser = session.user as { username?: string };
    if (!currentUser.username || currentUser.username.trim() === "") {
      router.replace("/set-username");
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

        <main id="main-content" className="flex-1 overflow-y-auto flex flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
