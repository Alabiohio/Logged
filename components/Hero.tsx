"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40, rotateX: 15, rotateY: -20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 12,
      rotateY: -15,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
        delay: 0.3,
      },
    },
  };

  return (
    <section className="mx-auto flex min-h-[85vh] max-w-8xl flex-col items-center justify-center gap-12 px-4 py-16 pt-44 lg:flex-row lg:gap-20 overflow-hidden">
      {/* Left */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl text-center lg:text-left"
      >
        <motion.h1
          variants={itemVariants}
          className="mt-4 text-5xl font-hero font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-7xl"
        >
          <span className="font-normal">Monitor</span>
          <span className="font-bold"> every</span>
          <span className="font-extrabold"> log.</span>
          <br />
          <span className="font-extrabold text-primary">Fix issues</span>
          <span className="font-black text-primary"> faster.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl text-base !font-console leading-8 text-text-secondary sm:text-lg mx-auto lg:mx-0"
        >
          Collect logs from your websites, APIs, and applications in one
          beautiful dashboard. Search, monitor, and debug with confidence.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href="/dashboard"
              className="inline-block rounded-full bg-primary px-7 py-4 font-semibold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover"
            >
              Start Free
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href="/docs"
              className="inline-block rounded-full border border-border bg-glass px-7 py-4 font-medium backdrop-blur-xl transition hover:bg-glass-hover"
            >
              Documentation
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right - Tilted 3D Image */}
      <div className="perspective-1000 flex items-center justify-center p-4">
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="show"
          whileHover={{
            rotateX: 4,
            rotateY: -6,
            scale: 1.03,
            y: -10,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative max-w-[260px] sm:max-w-[320px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)]"
        >
          <Image
            src="/dcim/phone.png"
            alt="Logged Mobile & App Dashboard Preview"
            width={480}
            height={1000}
            className="h-auto w-full object-contain filter drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}