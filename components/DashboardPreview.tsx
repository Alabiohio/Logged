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
    <section className="mx-auto max-w-7xl px-6 py-32">

      <div className="text-center">

        <h2 className="mt-6 text-5xl font-black text-text">
          Everything in one place.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted">
          Monitor projects, inspect logs, track errors and keep your
          applications healthy from a single dashboard.
        </p>

      </div>

      <div className="glass mt-20 overflow-hidden p-0">

        <div className="grid lg:grid-cols-[260px_1fr]">

          {/* Sidebar */}

          <aside className="border-r border-border bg-white/25 p-6">

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

          <main className="p-8">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-5">

              <div>

                <h3 className="text-3xl font-black">
                  Dashboard
                </h3>

                <p className="mt-2 text-text-muted">
                  Monitor your applications in real time.
                </p>

              </div>

              <div className="flex items-center gap-3 rounded-full border border-border bg-glass-hover px-5 py-3">

                <Search size={18} />

                <input
                  placeholder="Search logs..."
                  className="bg-transparent outline-none"
                />

              </div>

            </div>

            {/* Stats */}

            <div className="mt-10 grid gap-5 md:grid-cols-4">

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

            <div className="glass mt-8 p-0">

              <div className="border-b border-border px-6 py-5">

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
    <div className="glass p-6">

      <p className="text-sm text-text-muted">
        {title}
      </p>

      <h3 className="mt-3 text-4xl font-black">
        {value}
      </h3>

      <div
        className={`mt-5 h-2 rounded-full bg-${color}-500`}
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
    <div className="flex items-center justify-between border-b border-border px-6 py-5">

      <div className="flex items-center gap-4">

        <div className={color}>
          {icon}
        </div>

        <div>

          <h5 className="font-semibold">
            {level}
          </h5>

          <p className="text-sm text-text-muted">
            {message}
          </p>

        </div>

      </div>

      <span className="text-sm text-text-disabled">
        just now
      </span>

    </div>
  );
}