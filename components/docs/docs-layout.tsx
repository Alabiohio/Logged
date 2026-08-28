"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { name: "Installation", href: "/docs/installation" },
      { name: "Quick Start", href: "/docs/quick-start" },
    ],
  },
  {
    title: "SDK",
    items: [
      { name: "Logger", href: "/docs/sdk" },
      { name: "Capture Errors", href: "/docs/sdk/capture" },
      { name: "Browser Auto Capture", href: "/docs/sdk/auto" },
      { name: "Console Capture", href: "/docs/sdk/console" },
    ],
  },
  {
    title: "REST API",
    items: [
      { name: "Overview", href: "/docs/rest-api" },
    ],
  },
  {
    title: "Examples",
    items: [
      { name: "Next.js", href: "/docs/examples/nextjs" },
      { name: "React", href: "/docs/examples/react" },
      { name: "JavaScript", href: "/docs/examples/javascript" },
    ],
  },
];

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/docs" className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-black text-text">Logged Docs</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-glass text-text-secondary transition hover:bg-glass-hover"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background-secondary/70 backdrop-blur-xl transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:block ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="hidden lg:flex h-16 items-center gap-2 border-b border-border px-6">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-black text-text">Logged Docs</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
              <nav className="space-y-6">
                {navigation.map((section) => (
                  <div key={section.title}>
                    <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-text-secondary hover:bg-glass hover:text-text"
                              }`}
                            >
                              {isActive && <ChevronRight className="h-4 w-4" />}
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>

            <div className="border-t border-border p-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to site
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
