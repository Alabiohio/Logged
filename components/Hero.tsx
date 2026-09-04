"use client";

import { motion } from "framer-motion";

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

  const logsVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
        delay: 0.3,
      },
    },
  };

  return (
    <section className="mx-auto flex min-h-[85vh] max-w-8xl flex-col items-center justify-center gap-12 px-4 py-16 pt-44 lg:flex-row lg:gap-20">
      {/* Left */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl text-center lg:text-left"
      >
        <motion.h1
          variants={itemVariants}
          className="mt-4 text-4xl font-hero font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-7xl"
        >
          Monitor every log.
          <br />
          <span className="text-primary">Fix issues faster.</span>
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
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="rounded-full bg-primary px-7 py-4 font-semibold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover"
          >
            Start Free
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="rounded-full border border-border bg-glass px-7 py-4 font-medium backdrop-blur-xl transition hover:bg-glass-hover"
          >
            Documentation
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right */}
      <motion.div
        variants={logsVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full max-w-[430px] shrink-0"
      >
        <div className="w-full rounded-[36px] border border-border bg-glass p-6 backdrop-blur-3xl shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-bold text-text">Live Logs</h2>
            <span className="relative flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-active">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              LIVE
            </span>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.4 },
              },
            }}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <Log color="bg-info" level="INFO" message="User logged in" />
            <Log color="bg-warning" level="WARNING" message="API response is slow" />
            <Log color="bg-error" level="ERROR" message="Database timeout" />
            <Log color="bg-primary" level="SUCCESS" message="Payment completed" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Log({
  level,
  message,
  color,
}: {
  level: string;
  message: string;
  color: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -16 },
        show: { opacity: 1, x: 0 },
      }}
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-glass-hover p-4 backdrop-blur-xl transition-colors cursor-pointer"
    >
      <div className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text">{level}</p>
        <p className="text-sm text-text-muted truncate">{message}</p>
      </div>
      <span className="shrink-0 text-xs text-text-disabled">now</span>
    </motion.div>
  );
}