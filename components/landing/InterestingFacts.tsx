"use client";

import { motion } from "framer-motion";

const facts = [
  {
    number: "01",
    title: "Most bugs don't announce themselves.",
    description: "A production issue can start as one tiny warning long before it becomes an obvious failure.",
  },
  {
    number: "02",
    title: "More logs ≠ better debugging.",
    description: "Thousands of unstructured messages can make finding the important one harder, not easier.",
  },
  {
    number: "03",
    title: "Context changes everything.",
    customContent: (
      <div className="mt-3 rounded-2xl border border-border/60 bg-background/80 p-4 font-console text-xs leading-relaxed text-text-muted">
        <p className="text-error/80"><span className="text-text-disabled">Without context:</span> Payment failed</p>
        <div className="mt-3 space-y-1.5 border-t border-border/40 pt-2">
          <p className="text-text-muted">User action &rarr; API call</p>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-primary font-bold"
          >
            Payment failed &rarr; user checkout &rarr; API timeout &rarr; retry &rarr; failure
          </motion.div>
        </div>
      </div>
    ),
    description: "See the full sequence of events leading up to the error.",
  },
  {
    number: "04",
    title: "Your logs are part of your application's memory.",
    description: "They record what your system was doing when nobody was actively watching.",
  },
];

export default function InterestingFacts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold tracking-widest text-primary uppercase"
        >
          DEBUGGING INSIGHTS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          A few things about debugging
        </motion.h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact, index) => (
          <motion.div
            key={fact.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="flex flex-col justify-between rounded-3xl border border-border/80 bg-glass/50 p-6 backdrop-blur-xl transition hover:border-primary/50"
          >
            <div>
              <span className="font-console text-3xl font-black text-primary/40">
                {fact.number}
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug text-text">
                {fact.title}
              </h3>
              {fact.customContent ? (
                fact.customContent
              ) : (
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  {fact.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <blockquote className="text-2xl font-black tracking-tight text-text sm:text-3xl">
          &ldquo;Don&apos;t just collect logs. <span className="text-primary">Understand them.</span>&rdquo;
        </blockquote>
      </motion.div>
    </section>
  );
}
