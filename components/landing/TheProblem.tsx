"use client";

import { motion } from "framer-motion";
import { Layers, Puzzle, Clock, AlertTriangle } from "lucide-react";

const painPoints = [
  {
    icon: Layers,
    title: "Scattered logs",
    description: "Jumping between servers, containers, and environment logs manually.",
  },
  {
    icon: Puzzle,
    title: "Missing context",
    description: "A bare stack trace without the sequence of events leading up to it.",
  },
  {
    icon: Clock,
    title: "Slow debugging",
    description: "Searching thousands of lines of terminal output just to find one clue.",
  },
  {
    icon: AlertTriangle,
    title: "Production panic",
    description: "Something breaks and everyone is urgently asking, 'What happened?'",
  },
];

export default function TheProblem() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[40px] py-8 backdrop-blur-2xl sm:p-12 lg:p-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold font-hero tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
            Your logs shouldn&apos;t feel like{" "}
            <span className="text-primary underline decoration-primary/30 underline-offset-8">
              archaeology.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-text-secondary"
          >
            When something breaks, the last thing you need is another terminal tab.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-border/80 bg-background/50 p-6 shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-text">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="inline-block rounded-full !font-console bg-primary/10 px-2 py-2.5 text-base font-semibold text-primary">
            Logged turns that mess into a timeline you can actually follow.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
