"use client";

import Link from "next/link";
import { openCookieBanner } from "@/components/CookieBanner";
import Image from "next/image";
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
    href: "https://github.com/oheoco",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/@oheoco",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/logo/logo.png"
                alt="Logged logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span
                className="text-2xl font-black tracking-tight text-primary"
              >
                Logged
              </span>
            </Link>

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
                  className="group flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                  <span aria-hidden="true">{s.icon}</span>
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
                        className="text-sm transition-colors duration-150 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            <button
              onClick={(e) => {
                e.preventDefault();
                openCookieBanner();
              }}
              className="text-xs transition-colors duration-150 cursor-pointer"
              style={{ color: "var(--text-disabled)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-disabled)"; }}
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}