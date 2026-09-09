"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ClosingBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[40px] border border-border/80 bg-gradient-to-b from-glass/80 to-background/90 p-8 backdrop-blur-3xl sm:p-14 lg:p-20 text-center shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold tracking-widest text-primary uppercase"
        >
          BECAUSE DEBUGGING IS ALREADY HARD ENOUGH
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl"
        >
          When production breaks, <br className="hidden sm:block" />
          <span className="text-primary">don&apos;t guess. Know what happened.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg font-medium text-text-secondary sm:text-xl"
        >
          Your application is already telling you a story. <br className="hidden sm:block" />
          <span className="text-text font-bold">Logged helps you listen.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover text-lg"
            >
              Start logging &rarr;
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
