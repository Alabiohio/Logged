"use client";

import { motion } from "framer-motion";
import { FolderPlus, KeyRound, Code2, Activity, Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-2xl font-hero font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
        >
          Get started in minutes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg"
        >
          No complicated setup. Just create a project, grab your key, send logs, and start debugging.
        </motion.p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="flex flex-col rounded-3xl border border-border/80 bg-glass/50 p-6 backdrop-blur-xl transition hover:border-primary/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderPlus size={24} />
            </div>
            <span className="font-console text-xs font-bold text-primary">STEP 01</span>
          </div>

          <h3 className="text-xl font-bold text-text">Create a Project</h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Organize your web apps, microservices, and APIs in dedicated project spaces.
          </p>

          <IllustrationStepOne />
        </motion.div>

        {/* Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="flex flex-col rounded-3xl border border-border/80 bg-glass/50 p-6 backdrop-blur-xl transition hover:border-primary/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound size={24} />
            </div>
            <span className="font-console text-xs font-bold text-primary">STEP 02</span>
          </div>

          <h3 className="text-xl font-bold text-text">Copy Your API Key</h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Every project gets a secure API key to authenticate log ingestion.
          </p>

          <IllustrationStepTwo />
        </motion.div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -6 }}
          className="flex flex-col rounded-3xl border border-border/80 bg-glass/50 p-6 backdrop-blur-xl transition hover:border-primary/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Code2 size={24} />
            </div>
            <span className="font-console text-xs font-bold text-primary">STEP 03</span>
          </div>

          <h3 className="text-xl font-bold text-text">Install the SDK</h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Add `@oheoco/logged` to your app and initialize with a couple lines of code.
          </p>

          <IllustrationStepThree />
        </motion.div>

        {/* Step 4 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -6 }}
          className="flex flex-col rounded-3xl border border-border/80 bg-glass/50 p-6 backdrop-blur-xl transition hover:border-primary/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Activity size={24} />
            </div>
            <span className="font-console text-xs font-bold text-primary">STEP 04</span>
          </div>

          <h3 className="text-xl font-bold text-text">Start Monitoring</h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Logs stream live into your dashboard with instant search & filter controls.
          </p>

          <IllustrationStepFour />
        </motion.div>
      </div>
    </section>
  );
}

{/* Step 1 Visual: Animated Project Card Creator */}
function IllustrationStepOne() {
  return (
    <div className="mt-6 flex-1 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <div className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-pulse" />
        <span className="font-console text-xs text-text-muted">Create New Project</span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="rounded-lg bg-glass-hover p-2 text-xs font-medium text-text flex items-center justify-between">
          <span>Name: <strong className="text-primary">E-Commerce API</strong></span>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary font-bold"
          >
            PROD
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0, width: "0%" }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
          className="h-1 rounded-full bg-primary"
        />
      </div>
    </div>
  );
}

{/* Step 2 Visual: Interactive Key Generator */}
function IllustrationStepTwo() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCopied((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 flex-1 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner flex flex-col justify-between">
      <span className="font-console text-[11px] text-text-muted">API Access Token</span>
      <div className="mt-2 flex items-center justify-between rounded-xl border border-border/40 bg-glass p-2.5 font-console text-xs">
        <span className="text-primary truncate">lg_live_9482...</span>
        <motion.div animate={{ scale: copied ? 1.2 : 1 }}>
          {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-text-muted" />}
        </motion.div>
      </div>
      <span className="mt-2 text-[10px] text-primary/80 font-console">
        {copied ? "✓ Key copied to clipboard" : "Click to copy key"}
      </span>
    </div>
  );
}

{/* Step 3 Visual: Animated Terminal Code Execution */}
function IllustrationStepThree() {
  return (
    <div className="mt-6 flex-1 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner font-console text-[11px]">
      <div className="flex items-center gap-1 text-text-muted">
        <span className="text-primary">$</span>
        <span>npm i @oheoco/logged</span>
      </div>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-3 text-[10px] text-primary font-bold"
      >
        + @oheoco/logged@1.4.0 added
      </motion.div>
      <div className="mt-2 text-[10px] text-text-disabled">
        logger.init(&#123; apiKey &#125;)
      </div>
    </div>
  );
}

{/* Step 4 Visual: Real-time Live Log Stream Animation */}
function IllustrationStepFour() {
  const [logs, setLogs] = useState([
    { level: "INFO", text: "Auth success", color: "text-info" },
    { level: "WARN", text: "High latency", color: "text-warning" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogs((prev) => [
        {
          level: "ERROR",
          text: "DB timeout",
          color: "text-error",
        },
        prev[0],
      ]);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 flex-1 rounded-2xl border border-border/60 bg-background/80 p-3 shadow-inner space-y-2 overflow-hidden">
      {logs.slice(0, 2).map((log, idx) => (
        <motion.div
          key={idx + log.text}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between rounded-lg bg-glass p-2 text-[11px] font-console"
        >
          <span className={`font-bold ${log.color}`}>{log.level}</span>
          <span className="text-text-muted truncate max-w-[90px]">{log.text}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
        </motion.div>
      ))}
    </div>
  );
}