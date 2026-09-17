"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { DocsMobileHeader, DocsSidebar } from "@/components/docs/docs-sidebar";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background overflow-hidden">
      <DocsMobileHeader mobileOpen={mobileOpen} onToggle={() => setMobileOpen((prev) => !prev)} />

      <div className="flex h-[calc(100vh-57px)] w-full overflow-hidden lg:h-screen">
        <DocsSidebar pathname={pathname} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-4xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
