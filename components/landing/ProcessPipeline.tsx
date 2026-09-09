"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Terminal, Database, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function ProcessPipeline() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    {
      id: 0,
      title: "1. App Event Triggered",
      desc: "Your frontend, API server, or background worker executes an action (e.g. checkout API call).",
      icon: Terminal,
    },
    {
      id: 1,
      title: "2. Lightweight SDK Ingestion",
      desc: "@logged/sdk batches events asynchronously without blocking main thread execution.",
      icon: Database,
    },
    {
      id: 2,
      title: "3. Context Enrichment & Parsing",
      desc: "Logged correlates headers, user ID, environment tags, and preceding stack traces.",
      icon: ShieldAlert,
    },
    {
      id: 3,
      title: "4. Instant Dashboard Stream",
      desc: "Event rendered on your dashboard in under 50ms with instant search & smart grouping.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold tracking-widest text-primary uppercase"
        >
          UNDER THE HOOD
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          How Logged processes your data
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg"
        >
          From execution in your app to instant visibility on your screen.
        </motion.p>
      </div>

      {/* Interactive Process Pipeline Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-16 rounded-3xl border border-border/80 bg-glass/60 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl"
      >
        {/* Animated Connector Line */}
        <div className="relative mb-12 hidden lg:block">
          <div className="h-1.5 w-full rounded-full bg-border/40" />
          <motion.div
            className="absolute top-0 h-1.5 rounded-full bg-primary"
            animate={{
              left: `${(activeStage / 3) * 75}%`,
              width: "25%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Stages Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = stage.id === activeStage;

            return (
              <motion.div
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                whileHover={{ scale: 1.02 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all ${
                  isActive
                    ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border/60 bg-background/50 opacity-70 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isActive ? "bg-primary text-white" : "bg-glass text-text-muted"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    {isActive && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-base font-bold text-text">{stage.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">{stage.desc}</p>
                </div>

                <div className="mt-6 flex items-center gap-1 font-console text-[10px] text-primary font-bold">
                  <span>STAGE 0{stage.id + 1}</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Simulation Display */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-background/90 p-5 font-console text-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-text-muted">Live Pipeline Inspector</span>
            <span className="text-primary font-bold">Latency: 14ms</span>
          </div>

          <div className="mt-4 space-y-2">
            {activeStage === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text">
                <span className="text-primary">&gt;</span> Executing logger.error(&quot;Payment gateway timeout&quot;, &#123; userId: &quot;usr_402&quot; &#125;)
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text">
                <span className="text-primary">&gt;</span> Encrypting payload &amp; pushing to asynchronous memory queue (buffer: 1/100)
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text">
                <span className="text-primary">&gt;</span> Appending geo:US-East, env:production, traceId:tr_88294
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-bold">
                &gt; Event stored &amp; rendered on dashboard live log table [STATUS: OK]
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
