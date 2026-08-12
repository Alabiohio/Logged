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

export default function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">

      <div className="text-center">

        <h2 className="mt-6 text-3xl font-black text-text sm:text-4xl lg:text-5xl">
          Everything in one place.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base text-text-muted sm:text-lg">
          Monitor projects, inspect logs, track errors and keep your
          applications healthy from a single dashboard.
        </p>

      </div>

      <div className="glass mt-16 overflow-hidden p-0">

        <div className="grid lg:grid-cols-[220px_1fr]">

          {/* Sidebar — hidden on mobile, shown on lg+ */}

          <aside className="hidden border-r border-border bg-white/25 p-6 lg:block">

            <h3 className="text-2xl font-black">
              Logged
            </h3>

            <nav className="mt-10 space-y-2">

              <Item icon={<LayoutDashboard size={18} />} active>
                Dashboard
              </Item>

              <Item icon={<FolderKanban size={18} />}>
                Projects
              </Item>

              <Item icon={<Activity size={18} />}>
                Logs
              </Item>

              <Item icon={<Bell size={18} />}>
                Alerts
              </Item>

              <Item icon={<Settings size={18} />}>
                Settings
              </Item>

            </nav>

          </aside>

          {/* Main */}

          <main className="p-5 sm:p-8">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <h3 className="text-2xl font-black sm:text-3xl">
                  Dashboard
                </h3>

                <p className="mt-2 text-sm text-text-muted sm:text-base">
                  Monitor your applications in real time.
                </p>

              </div>

              <div className="flex items-center gap-3 rounded-full border border-border bg-glass-hover px-4 py-2.5 sm:px-5 sm:py-3">

                <Search size={16} />

                <input
                  placeholder="Search logs..."
                  className="bg-transparent text-sm outline-none w-28 sm:w-auto"
                />

              </div>

            </div>

            {/* Stats */}

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">

              <Card
                title="Logs Today"
                value="18,324"
                color="emerald"
              />

              <Card
                title="Errors"
                value="14"
                color="red"
              />

              <Card
                title="Warnings"
                value="39"
                color="amber"
              />

              <Card
                title="Projects"
                value="12"
                color="blue"
              />

            </div>

            {/* Logs */}

            <div className="glass mt-6 sm:mt-8 p-0">

              <div className="border-b border-border px-5 py-4 sm:px-6 sm:py-5">

                <h4 className="font-bold">
                  Recent Logs
                </h4>

              </div>

              <div>

                <Log
                  icon={<CheckCircle2 size={18} />}
                  level="INFO"
                  message="User logged in successfully."
                  color="text-primary-hover"
                />

                <Log
                  icon={<AlertTriangle size={18} />}
                  level="WARNING"
                  message="Slow response from payments API."
                  color="text-yellow-500"
                />

                <Log
                  icon={<Bug size={18} />}
                  level="ERROR"
                  message="Database connection timeout."
                  color="text-red-500"
                />

              </div>

            </div>

          </main>

        </div>

      </div>

    </section>
  );
}

function Item({
  icon,
  children,
  active,
}: any) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
        active
          ? "bg-primary text-white"
          : "hover:bg-glass"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {children}
      </div>

      <ChevronRight size={16} />
    </button>
  );
}

function Card({
  title,
  value,
  color,
}: any) {
  return (
    <div className="glass p-4 sm:p-6">

      <p className="text-xs text-text-muted sm:text-sm">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black sm:mt-3 sm:text-4xl">
        {value}
      </h3>

      <div
        className={`mt-4 h-1.5 rounded-full bg-${color}-500 sm:mt-5 sm:h-2`}
      />

    </div>
  );
}

function Log({
  icon,
  level,
  message,
  color,
}: any) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6 sm:py-5">

      <div className="flex items-center gap-3 min-w-0">

        <div className={`${color} shrink-0`}>
          {icon}
        </div>

        <div className="min-w-0">

          <h5 className="font-semibold text-sm sm:text-base">
            {level}
          </h5>

          <p className="text-xs text-text-muted truncate sm:text-sm">
            {message}
          </p>

        </div>

      </div>

      <span className="shrink-0 text-xs text-text-disabled ml-3">
        just now
      </span>

    </div>
  );
}