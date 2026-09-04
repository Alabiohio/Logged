"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 sm:py-5"
    >
      {/* Main bar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border bg-glass px-5 py-3 backdrop-blur-3xl shadow-lg">
        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center group shrink-0"
        >
          <motion.div whileHover={{ rotate: 10, scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Image src="/logo/logo.png" alt="Oheo logo" width={1000} height={20} className="relative w-9 h-9 object-contain" />
          </motion.div>
          <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl ml-2">Logged</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden gap-8 text-sm font-medium text-text-secondary md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative transition hover:text-text group"
            >
              {link.label}
              <span className="absolute left-0 bottom-[-4px] h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {!isPending && (
            user ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur-3xl transition hover:bg-glass hover:text-text"
                  title={user.name || user.email}
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={28}
                      height={28}
                      className="rounded-full object-cover w-7 h-7"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User size={16} />
                    </div>
                  )}
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {user.name || user.email?.split("@")[0] || "Profile"}
                  </span>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="rounded-full border border-border bg-primary px-5 py-2 text-sm text-text-secondary backdrop-blur-3xl transition hover:bg-glass"
                >
                  Sign In
                </Link>
              </motion.div>
            )
          )}
        </div>

        {/* Mobile: hamburger only */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-glass transition hover:bg-glass-hover md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </motion.button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-border bg-glass px-6 py-6 backdrop-blur-3xl shadow-lg md:hidden"
          >
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
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
                <span className="text-sm font-medium text-text-secondary">Theme</span>
                <ThemeToggle />
              </div>

              {!isPending && (
                user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-3 w-full rounded-full border border-border bg-primary/10 py-3 text-center text-sm font-medium text-text-secondary transition hover:bg-glass"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={24}
                        height={24}
                        className="rounded-full object-cover w-6 h-6"
                      />
                    ) : (
                      <User size={18} className="text-primary" />
                    )}
                    <span>Dashboard ({user.name || user.email?.split("@")[0]})</span>
                  </Link>
                ) : (
                  <>
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
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}