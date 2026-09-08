"use client";

import { Menu } from "lucide-react";
import { ProjectSwitcher } from "@/components/dashboard/ProjectSwitcher";

export function Navbar({ openMenu }: { openMenu: () => void }) {
  return (
    <div className="shrink-0 bg-background/80 px-4 py-3 shadow-sm backdrop-blur-xl z-30 relative">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <button
          type="button"
          onClick={openMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-glass text-text-secondary transition hover:bg-glass-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <ProjectSwitcher variant="navbar" />
      </div>
    </div>
  );
}
