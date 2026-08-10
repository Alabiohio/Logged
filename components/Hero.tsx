"use client";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center gap-20 px-6 lg:flex-row">

      {/* Left */}

      <div className="max-w-2xl">

        <h1 className="mt-8 text-6xl font-black leading-tight tracking-tight text-text lg:text-7xl">

          Monitor every log.

          <br />

          <span className="text-primary">
            Fix issues faster.
          </span>

        </h1>

        <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary">

          Collect logs from your websites, APIs, and applications in one
          beautiful dashboard. Search, monitor, and debug with confidence.

        </p>

        <div className="mt-10 flex gap-4">

          <button className="rounded-full bg-primary px-7 py-4 font-semibold text-white shadow-xl shadow-lg transition hover:bg-primary-hover">

            Start Free

          </button>

          <button className="rounded-full border border-border bg-glass px-7 py-4 font-medium backdrop-blur-xl transition hover:bg-glass-hover">

            Documentation

          </button>

        </div>

      </div>

      {/* Right */}

      <div className="relative">

        <div className="w-[430px] rounded-[36px] border border-border bg-glass p-6 backdrop-blur-3xl shadow-2xl">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="font-bold text-text">
              Live Logs
            </h2>

            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-active">
              LIVE
            </span>

          </div>

          <div className="space-y-4">

            <Log
              color="bg-info"
              level="INFO"
              message="User logged in"
            />

            <Log
              color="bg-warning"
              level="WARNING"
              message="API response is slow"
            />

            <Log
              color="bg-error"
              level="ERROR"
              message="Database timeout"
            />

            <Log
              color="bg-primary"
              level="SUCCESS"
              message="Payment completed"
            />

          </div>

        </div>

      </div>

    </section>
  );
}

function Log({
  level,
  message,
  color,
}: {
  level: string;
  message: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-glass-hover p-4 backdrop-blur-xl">

      <div className={`h-3 w-3 rounded-full ${color}`} />

      <div className="flex-1">

        <p className="font-semibold text-text">
          {level}
        </p>

        <p className="text-sm text-text-muted">
          {message}
        </p>

      </div>

      <span className="text-xs text-text-disabled">
        now
      </span>

    </div>
  );
}