"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const matrix = [
  {
    without: "console.log() everywhere",
    withLogged: "Structured application logs",
  },
  {
    without: "Terminal scrolling",
    withLogged: "Centralized dashboard",
  },
  {
    without: "“Which server was that?”",
    withLogged: "Environment-aware logs",
  },
  {
    without: "Search through raw text files",
    withLogged: "Search & filter in milliseconds",
  },
  {
    without: "Reproduce the bug again",
    withLogged: "Investigate what already happened",
  },
];

export default function Comparison() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-hero font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          Debugging shouldn&apos;t be a{" "}
          <span className="text-primary underline decoration-primary/30 underline-offset-8">
            scavenger hunt.
          </span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-14 overflow-hidden rounded-3xl border border-border/80 bg-glass/60 backdrop-blur-2xl shadow-xl"
      >
        <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60 bg-glass-hover/50 px-6 py-4 sm:px-8 sm:py-5 text-xs sm:text-sm font-bold tracking-wider uppercase">
          <div className="flex items-center gap-2 text-text-muted pr-4 sm:pr-6">
            <span className="h-2 w-2 rounded-full bg-error/60" />
            Without Logged
          </div>
          <div className="flex items-center gap-2 text-primary pl-4 sm:pl-8">
            <span className="h-2 w-2 rounded-full bg-primary" />
            With Logged
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {matrix.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-2 divide-x divide-border/30 px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base font-medium transition hover:bg-glass-hover/30"
            >
              <div className="flex items-center gap-3.5 text-text-muted pr-4 sm:pr-6">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                  <X className="h-4 w-4" />
                </div>
                <code className="font-console text-xs sm:text-sm text-text-muted/90 leading-relaxed">
                  {row.without}
                </code>
              </div>
              <div className="flex items-center gap-3.5 text-text font-bold pl-4 sm:pl-8">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="text-text leading-relaxed">{row.withLogged}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-center"
      >
        <p className="text-xl font-black text-text">
          Less hunting. <span className="text-primary">More fixing.</span>
        </p>
      </motion.div>
    </section>
  );
}
