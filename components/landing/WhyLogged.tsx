"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Server, Layers, Zap } from "lucide-react";

export default function WhyLogged() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold tracking-widest text-primary uppercase"
        >
          WHY LOGGED?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          Built for the moment things go wrong.
        </motion.h2>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {/* Card 1: One Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-border/80 bg-glass/40 p-8 backdrop-blur-xl transition hover:border-primary/50 flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
              <Server size={14} /> CENTRALIZED
            </div>
            <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
              One dashboard. Every environment.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              Development, staging, production—keep your application&apos;s activity organized without switching between terminal tabs.
            </p>
          </div>
          <IllustrationEnvironmentSwitcher />
        </motion.div>

        {/* Card 2: Context over clutter */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-border/80 bg-glass/40 p-8 backdrop-blur-xl transition hover:border-primary/50 flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
              <Layers size={14} /> DEEP VISIBILITY
            </div>
            <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
              Context over clutter.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              A log shouldn&apos;t just tell you that something failed. Logged helps you see what happened right before and after.
            </p>
          </div>
          <IllustrationContextFlow />
        </motion.div>

        {/* Card 3: Find signal faster */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-border/80 bg-glass/40 p-8 backdrop-blur-xl transition hover:border-primary/50 flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
              <Search size={14} /> INSTANT SEARCH
            </div>
            <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
              Find the signal faster.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              Filter, search, and narrow down your logs instantly instead of scrolling through an endless wall of text.
            </p>
          </div>
          <IllustrationSearchFilter />
        </motion.div>

        {/* Card 4: Built for developers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-border/80 bg-glass/40 p-8 backdrop-blur-xl transition hover:border-primary/50 flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
              <Zap size={14} /> ZERO FRICTION
            </div>
            <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
              Built for developers.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              No complicated observability setup. No giant infrastructure project. Just install, send logs, and start debugging.
            </p>
          </div>
          <IllustrationZeroFriction />
        </motion.div>
      </div>
    </section>
  );
}

{/* Animation 1: Multi-Environment Switcher */}
function IllustrationEnvironmentSwitcher() {
  const [activeEnv, setActiveEnv] = useState(0);
  const envs = ["Production", "Staging", "Development"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEnv((prev) => (prev + 1) % envs.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [envs.length]);

  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        {envs.map((env, idx) => (
          <div
            key={env}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold font-console transition-all ${
              idx === activeEnv
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-glass text-text-muted"
            }`}
          >
            {env}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-console text-xs">
        <span className="text-text-muted">Active Stream:</span>
        <motion.span
          key={activeEnv}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-primary"
        >
          env:{envs[activeEnv].toLowerCase()}
        </motion.span>
      </div>
    </div>
  );
}

{/* Animation 2: Pre-error Context Flow */}
function IllustrationContextFlow() {
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner font-console text-xs space-y-2">
      <div className="flex items-center gap-2 text-text-muted">
        <span className="h-2 w-2 rounded-full bg-info" />
        <span>10:42:01 — User checkout clicked</span>
      </div>
      <div className="flex items-center gap-2 text-text-muted">
        <span className="h-2 w-2 rounded-full bg-warning" />
        <span>10:42:03 — Payment API response delayed</span>
      </div>
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex items-center gap-2 rounded-lg bg-error/10 p-2 font-bold text-error border border-error/20"
      >
        <span className="h-2 w-2 rounded-full bg-error" />
        <span>10:42:05 — Gateway timeout failure</span>
      </motion.div>
    </div>
  );
}

{/* Animation 3: Interactive Search Bar Filter */}
function IllustrationSearchFilter() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sequence = ["", "5", "50", "500", "500 error"];
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % sequence.length;
      setQuery(sequence[idx]);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner">
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-glass px-3 py-2 text-xs font-console text-text">
        <Search size={14} className="text-primary" />
        <span>{query}</span>
        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
          |
        </motion.span>
      </div>
      <div className="mt-3 flex items-center justify-between font-console text-xs text-text-muted">
        <span>Scanned 14,200 events</span>
        <span className="font-bold text-primary">
          {query ? "1 match found" : "14,200 results"}
        </span>
      </div>
    </div>
  );
}

{/* Animation 4: Zero Friction Pulse Badge */}
function IllustrationZeroFriction() {
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Zap size={20} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-text">Ready out of the box</p>
          <p className="text-[10px] text-text-muted font-console">Zero infra setup</p>
        </div>
      </div>
      <span className="rounded-full bg-primary/10 px-3 py-1 font-console text-xs font-bold text-primary">
        &lt; 2 min init
      </span>
    </div>
  );
}
