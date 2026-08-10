"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-6 py-5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-glass border border-border px-6 py-3 backdrop-blur-3xl shadow-lg">

        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-text"
        >
          Logged
        </Link>

        <div className="hidden gap-8 text-sm font-medium text-text-secondary md:flex">
          <Link href="#">Features</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Docs</Link>
          <Link href="#">Blog</Link>
        </div>

        <div className="flex items-center gap-3">
          
          <ThemeToggle />

          <button className="rounded-full px-5 py-2 bg-black/10 backdrop-blur-3xl border border-border text-text-secondary transition hover:bg-glass">
            Sign In
          </button>

          <button className="rounded-full bg-primary px-5 py-2 font-medium text-white shadow-lg shadow-lg transition hover:bg-primary-hover">
            Start Free
          </button>

        </div>

      </nav>
    </header>
  );
}