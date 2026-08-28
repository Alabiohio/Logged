"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";

const navLinks = [
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 sm:py-5">

      {/* Main bar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border bg-glass px-5 py-3 backdrop-blur-3xl shadow-lg">

        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center group shrink-0"
        >
          <Image src="/logo/logo.png" alt="Oheo logo" width={1000} height={20} className="relative w-9 h-9 object-contain" />
          <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl ml-2">Logged</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden gap-8 text-sm font-medium text-text-secondary md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          <Link
            href="/login"
            className="rounded-full border border-border bg-primary px-5 py-2 text-sm text-text-secondary backdrop-blur-3xl transition hover:bg-glass"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile: hamburger only */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-glass transition hover:bg-glass-hover md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-border bg-glass px-6 py-6 backdrop-blur-3xl shadow-lg md:hidden">

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-glass-hover hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="w-full rounded-full border border-border bg-black/10 py-3 text-center text-sm font-medium text-text-secondary transition hover:bg-glass"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-primary-hover"
            >
              Start Free
            </Link>
          </div>

        </div>
      )}

    </header>
  );
}