"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const }}
        className="glass overflow-hidden rounded-[28px] px-6 py-14 text-center sm:rounded-[40px] sm:p-16 shadow-2xl relative"
      >
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-hero leading-tight sm:mt-8 sm:text-5xl lg:text-6xl">
          <span className="font-normal">Stop</span>
          <span className="font-normal"> chasing</span>
          <span className="font-semibold"> logs</span>
          .
          <br />
          <span className="font-bold"> Start</span>
          <span className="font-extrabold text-primary"> Understanding</span>
          <span className="font-black"> them.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-muted sm:mt-8 sm:text-lg">
          Join developers building more reliable software with Logged.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover sm:mt-10"
        >
          Start Free
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </section>
  );
}