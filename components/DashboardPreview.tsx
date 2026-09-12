"use client";

import {
  Search,
  Bell,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Bug,
  LayoutDashboard,
  FolderKanban,
  Settings,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface LogItemData {
  id: string;
  level: "INFO" | "WARNING" | "ERROR";
  message: string;
  color: string;
  time: string;
  icon: React.ReactNode;
}

const INITIAL_LOGS: LogItemData[] = [
  {
    id: "log-1",
    level: "INFO",
    message: "User logged in successfully.",
    color: "text-emerald-500",
    time: "just now",
    icon: <CheckCircle2 size={18} />,
  },
  {
    id: "log-2",
    level: "WARNING",
    message: "Slow response from payments API (420ms).",
    color: "text-amber-500",
    time: "12s ago",
    icon: <AlertTriangle size={18} />,
  },
  {
    id: "log-3",
    level: "ERROR",
    message: "Database connection timeout on pool-04.",
    color: "text-red-500",
    time: "34s ago",
    icon: <Bug size={18} />,
  },
  {
    id: "log-4",
    level: "INFO",
    message: "Webhook event #evt_9912 delivered.",
    color: "text-emerald-500",
    time: "1m ago",
    icon: <CheckCircle2 size={18} />,
  },
];

const NEW_LOG_POOL: Omit<LogItemData, "id" | "time">[] = [
  {
    level: "INFO",
    message: "New user registered (usr_88192).",
    color: "text-emerald-500",
    icon: <CheckCircle2 size={18} />,
  },
  {
    level: "WARNING",
    message: "High memory usage detected on worker-02.",
    color: "text-amber-500",
    icon: <AlertTriangle size={18} />,
  },
  {
    level: "ERROR",
    message: "Failed to dispatch email template to SMTP host.",
    color: "text-red-500",
    icon: <Bug size={18} />,
  },
  {
    level: "INFO",
    message: "API key #key_7719 initialized.",
    color: "text-emerald-500",
    icon: <CheckCircle2 size={18} />,
  },
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [logCount, setLogCount] = useState(18324);
  const [logs, setLogs] = useState<LogItemData[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState("");

  // Periodically increment total logs count and push a new live log
  useEffect(() => {
    const timer = setInterval(() => {
      // Increment counter
      const increment = Math.floor(Math.random() * 3) + 1;
      setLogCount((prev) => prev + increment);

      // Push random new log
      const randomLog = NEW_LOG_POOL[Math.floor(Math.random() * NEW_LOG_POOL.length)];
      const newLog: LogItemData = {
        ...randomLog,
        id: `log-${Date.now()}`,
        time: "just now",
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 3)]);
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >

        <h2 className="mt-4 text-3xl font-hero font-black text-text sm:text-4xl lg:text-5xl">
          Everything in one place.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-text-muted">
          Monitor projects, inspect logs, track errors and keep your
          applications healthy from a single unified workspace.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] as const }}
        className="glass mt-12 sm:mt-16 overflow-hidden p-0 shadow-2xl rounded-2xl sm:rounded-3xl border border-border/80"
      >
        <div className="grid lg:grid-cols-[220px_1fr]">
          {/* Sidebar — hidden on mobile, shown on lg+ */}
          <aside className="hidden border-r border-border/60 bg-white/25 dark:bg-white/5 p-6 lg:block">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <h3 className="text-2xl font-black tracking-tight">Logged</h3>
            </div>

            <nav className="mt-10 space-y-2 relative">
              <NavItem
                name="Dashboard"
                icon={<LayoutDashboard size={18} />}
                active={activeTab === "Dashboard"}
                onClick={() => setActiveTab("Dashboard")}
              />
              <NavItem
                name="Projects"
                icon={<FolderKanban size={18} />}
                active={activeTab === "Projects"}
                onClick={() => setActiveTab("Projects")}
              />
              <NavItem
                name="Logs"
                icon={<Activity size={18} />}
                active={activeTab === "Logs"}
                onClick={() => setActiveTab("Logs")}
              />
              <NavItem
                name="Alerts"
                icon={<Bell size={18} />}
                active={activeTab === "Alerts"}
                onClick={() => setActiveTab("Alerts")}
              />
              <NavItem
                name="Settings"
                icon={<Settings size={18} />}
                active={activeTab === "Settings"}
                onClick={() => setActiveTab("Settings")}
              />
            </nav>
          </aside>

          {/* Main */}
          <main className="p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black sm:text-3xl">{activeTab}</h3>
                </div>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">
                  Real-time telemetry and error monitoring for active projects.
                </p>
              </div>

              <div className="flex items-center gap-2.5 rounded-full border border-border bg-glass-hover px-3.5 py-2 sm:px-4 sm:py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search size={15} className="text-text-muted shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs..."
                  className="bg-transparent text-xs sm:text-sm outline-none w-full sm:w-40"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                },
              }}
              className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
            >
              <Card
                title="Logs Today"
                numericValue={logCount}
                color="bg-emerald-500"
              />
              <Card title="Errors" numericValue={14} color="bg-red-500" />
              <Card title="Warnings" numericValue={39} color="bg-amber-500" />
              <Card title="Projects" numericValue={12} color="bg-blue-500" />
            </motion.div>

            {/* Logs Block */}
            <div className="glass mt-6 sm:mt-8 p-0 overflow-hidden border border-border/70 rounded-xl sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4 h-[48px] sm:h-[54px] shrink-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base">Recent Logs</h4>
                </div>
              </div>

              {/* Fixed height container to confine animations and prevent layout shifts */}
              <div className="relative h-[240px] sm:h-[256px] overflow-hidden divide-y divide-border/60">
                <AnimatePresence initial={false}>
                  {filteredLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, backgroundColor: "rgba(var(--primary-rgb), 0.15)" }}
                      animate={{ opacity: 1, backgroundColor: "rgba(0, 0, 0, 0)" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      className="flex h-[60px] sm:h-[64px] items-center justify-between px-4 sm:px-6 cursor-pointer transition-colors shrink-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`${log.color} shrink-0`}>{log.icon}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${log.color}`}>{log.level}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-text truncate mt-0.5">
                            {log.message}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-[11px] sm:text-xs text-text-muted ml-3 font-console">
                        {log.time}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredLogs.length === 0 && (
                  <div className="flex h-full items-center justify-center p-8 text-center text-xs sm:text-sm text-text-muted">
                    No logs match &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </section>
  );
}

function NavItem({
  name,
  icon,
  active,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${active ? "text-white" : "text-text-muted hover:text-text hover:bg-glass"
        }`}
    >
      {active && (
        <motion.div
          layoutId="sidebarActivePill"
          className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/25"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className="relative z-10 flex items-center gap-3">
        {icon}
        {name}
      </div>

      <ChevronRight size={15} className="relative z-10 opacity-70" />
    </motion.button>
  );
}

function CountUpNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(0);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    const startVal = prevTargetRef.current;
    const endVal = target;

    const controls = animate(startVal, endVal, {
      duration: startVal === 0 ? 1.6 : 0.4,
      ease: startVal === 0 ? [0.16, 1, 0.3, 1] : "easeOut",
      onUpdate(latest) {
        setDisplayValue(Math.floor(latest));
      },
      onComplete() {
        prevTargetRef.current = endVal;
      },
    });

    return () => controls.stop();
  }, [isInView, target]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

function Card({
  title,
  numericValue,
  color,
  pulse = false,
}: {
  title: string;
  numericValue: number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className="glass p-4 sm:p-5 cursor-pointer relative overflow-hidden rounded-xl sm:rounded-2xl"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted sm:text-sm font-medium">{title}</p>
        {pulse && (
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>

      <h3 className="mt-2 text-xl font-black sm:mt-3 sm:text-3xl tracking-tight">
        <CountUpNumber target={numericValue} />
      </h3>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className={`mt-3 h-1.5 rounded-full ${color} origin-left sm:mt-4 sm:h-2`}
      />
    </motion.div>
  );
}