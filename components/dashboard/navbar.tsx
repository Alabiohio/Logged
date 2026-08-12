"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar({ openMenu }: { openMenu: () => void }) {
  const pathname = usePathname();

  const title = pathname.includes("/projects") 
    ? "Projects" 
    : pathname.includes("/activity") 
    ? "Activity" 
    : pathname.includes("/settings") 
    ? "Settings" 
    : "Overview";

  return (
    <div className="lg:hidden shrink-0 border-b border-border bg-background/80 px-4 py-4 shadow-sm backdrop-blur-xl z-30 relative">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={openMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-glass text-text-secondary transition hover:bg-glass-hover"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-text">{title}</h1>
        </div>
        <div className="h-11 w-11" />
      </div>
    </div>
  );
}
