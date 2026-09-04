"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How do I send logs to Logged?",
    answer:
      "Install the SDK or send HTTP requests directly to the Logged API using your project API key.",
  },
  {
    question: "Does Logged support server-side applications?",
    answer:
      "Yes. Logged can receive logs from websites, APIs, servers, and any application capable of making HTTP requests.",
  },
  {
    question: "Can I use Logged for free?",
    answer:
      "Yes. The Free plan lets you monitor personal projects before upgrading.",
  },
  {
    question: "Are my logs secure?",
    answer:
      "All requests are authenticated using project API keys and transmitted over HTTPS.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="mt-6 text-3xl font-hero font-black sm:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
          },
        }}
        className="mt-12 space-y-4 sm:mt-16"
      >
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.question}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="glass overflow-hidden rounded-3xl"
          >
            <button
              onClick={() => setOpen(open === index ? null : index)}
              className="flex w-full items-center justify-between p-5 text-left sm:p-6 transition-colors hover:bg-glass-hover"
            >
              <span className="font-semibold text-base sm:text-lg pr-4">
                {faq.question}
              </span>

              <motion.div
                animate={{ rotate: open === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="shrink-0"
              >
                <ChevronDown />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {open === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] as const }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-text-muted leading-7 sm:px-6 sm:pb-6">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}