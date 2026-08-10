"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

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
