"use client";

import { motion } from "framer-motion";

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
          className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
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
        <div className="grid grid-cols-2 border-b border-border/60 bg-glass-hover/50 p-4 sm:p-6 text-sm font-bold tracking-wider text-text uppercase">
          <div className="text-text-muted">Without Logged</div>
          <div className="text-primary">With Logged</div>
        </div>

        <div className="divide-y divide-border/40">
          {matrix.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-2 p-4 sm:p-6 text-sm sm:text-base font-medium transition hover:bg-glass-hover/30"
            >
              <div className="flex items-center gap-2 text-text-muted">
                <span className="text-error/70 font-bold">✕</span>
                <code className="font-console text-xs sm:text-sm">{row.without}</code>
              </div>
              <div className="flex items-center gap-2 text-text font-bold">
                <span className="text-primary font-bold">✓</span>
                <span>{row.withLogged}</span>
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
        className="mt-8 text-center"
      >
        <p className="text-xl font-black text-text">
          Less hunting. <span className="text-primary">More fixing.</span>
        </p>
      </motion.div>
    </section>
  );
}
