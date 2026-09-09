"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function QuickDemo() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.error("Payment failed", {
  userId: "usr_94021",
  orderId: "ord_88294",
  reason: "Gateway timeout"
});`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold tracking-widest text-primary uppercase"
          >
            DEVELOPER EXPERIENCE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
            From zero to logging in minutes.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-text-secondary leading-relaxed"
          >
            No complicated observability setup. No giant infrastructure project. Just install the lightweight SDK and start sending structured events directly to your dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">1</span>
              <span className="font-semibold text-text">Install package</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">2</span>
              <span className="font-semibold text-text">Initialize SDK with your API key</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-console text-xs font-bold text-primary">3</span>
              <span className="font-semibold text-text">Send logs with rich context</span>
            </div>
          </motion.div>
        </div>

        {/* Right Code Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border/80 bg-background/80 p-6 shadow-2xl backdrop-blur-2xl"
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-error/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="ml-2 font-console text-xs text-text-muted">app/logger.ts</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="rounded-lg bg-glass-hover px-3 py-1 text-xs font-semibold text-text-muted hover:text-text transition"
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>

          {/* Installation strip */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-glass p-3 font-console text-xs text-primary">
            <span>$ npm install @logged/sdk</span>
          </div>

          {/* Code snippet */}
          <pre className="mt-4 overflow-x-auto p-2 font-console text-xs sm:text-sm text-text leading-relaxed">
            <code>
              <span className="text-primary font-bold">import</span> &#123; Logged &#125; <span className="text-primary font-bold">from</span> <span className="text-warning">&quot;@logged/sdk&quot;</span>;{"\n\n"}
              <span className="text-primary font-bold">const</span> logger = <span className="text-primary font-bold">new</span> Logged(&#123;{"\n"}
              {"  "}apiKey: process.env.<span className="text-info">LOGGED_API_KEY</span>,{"\n"}
              &#125;);{"\n\n"}
              logger.<span className="text-error font-bold">error</span>(<span className="text-warning">&quot;Payment failed&quot;</span>, &#123;{"\n"}
              {"  "}userId: <span className="text-warning">&quot;usr_94021&quot;</span>,{"\n"}
              {"  "}orderId: <span className="text-warning">&quot;ord_88294&quot;</span>,{"\n"}
              {"  "}reason: <span className="text-warning">&quot;Gateway timeout&quot;</span>{"\n"}
              &#125;);
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
