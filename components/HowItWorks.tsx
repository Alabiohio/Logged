"use client";

import {
  FolderPlus,
  KeyRound,
  Code2,
  Activity,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: FolderPlus,
    title: "Create a Project",
    description:
      "Create a project in Logged and organize your applications in one place.",
  },
  {
    icon: KeyRound,
    title: "Copy Your API Key",
    description:
      "Every project gets a secure API key for sending logs safely.",
  },
  {
    icon: Code2,
    title: "Install the SDK",
    description:
      "Add the SDK to your application and initialize it with your API key.",
  },
  {
    icon: Activity,
    title: "Start Monitoring",
    description:
      "Logs begin appearing instantly in your dashboard with filtering and search.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="mt-6 text-3xl font-hero font-black text-text sm:text-4xl lg:text-5xl">
          Get started in minutes.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base text-text-muted sm:text-lg">
          No complicated setup. Just create a project, install the SDK,
          and start receiving logs instantly.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.15, delayChildren: 0.2 },
          },
        }}
        className="mt-16 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-24 lg:grid-cols-4"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="glass p-6 sm:p-8 h-full rounded-3xl cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Icon size={26} />
                </div>

                <div className="mt-6 sm:mt-8">
                  <span className="text-sm font-semibold text-primary-hover">
                    Step {index + 1}
                  </span>

                  <h3 className="mt-3 text-xl font-bold sm:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-text-muted">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {index !== steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-7 top-1/2 hidden -translate-y-1/2 text-text-disabled lg:block"
                  size={28}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}