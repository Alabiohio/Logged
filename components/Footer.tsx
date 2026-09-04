"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Documentation", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Status", href: "/status" },
    { label: "API Reference", href: "/api-reference" },
    { label: "Support", href: "https://oheo.site/inquiry" },
  ],
  Company: [
    { label: "About", href: "https://oheo.site/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "https://oheo.site/contact" },
  ],
};

const socials = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Emerald gradient top-accent bar */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent, #10B981 40%, #34D399 60%, transparent)",
          opacity: 0.6,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        {/* Top section: brand left, links right */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Brand column */}
          <div className="max-w-xs">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Logged
            </span>

            <p
              className="mt-4 text-sm leading-7"
              style={{ color: "var(--text-muted)" }}
            >
              The observability platform built for developers who care about
              uptime. Ship faster, debug smarter.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="group flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: "var(--glass-hover)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#10B981";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--glass-hover)";
                  }}
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-disabled)" }}
                >
                  {title}
                </p>

                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm transition-colors duration-150"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#10B981";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-10"
          style={{ height: "1px", background: "var(--border)" }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
            © {new Date().getFullYear()} Logged, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-disabled)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-disabled)"; }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-disabled)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-disabled)"; }}
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-disabled)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-disabled)"; }}
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}