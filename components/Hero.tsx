"use client";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center gap-12 px-6 py-16 pt-44 lg:flex-row lg:gap-20">

      {/* Left */}

      <div className="max-w-2xl text-center lg:text-left">

        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-7xl">

          Monitor every log.

          <br />

          <span className="text-primary">
            Fix issues faster.
          </span>

        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary sm:text-lg mx-auto lg:mx-0">

          Collect logs from your websites, APIs, and applications in one
          beautiful dashboard. Search, monitor, and debug with confidence.

        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">

          <button className="rounded-full bg-primary px-7 py-4 font-semibold text-white shadow-xl transition hover:bg-primary-hover">

            Start Free

          </button>

          <button className="rounded-full border border-border bg-glass px-7 py-4 font-medium backdrop-blur-xl transition hover:bg-glass-hover">

            Documentation

          </button>

        </div>

      </div>

      {/* Right */}

      <div className="relative w-full max-w-[430px] shrink-0">

        <div className="w-full rounded-[36px] border border-border bg-glass p-6 backdrop-blur-3xl shadow-2xl">

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

      <div className={`h-3 w-3 shrink-0 rounded-full ${color}`} />

      <div className="flex-1 min-w-0">

        <p className="font-semibold text-text">
          {level}
        </p>

        <p className="text-sm text-text-muted truncate">
          {message}
        </p>

      </div>

      <span className="shrink-0 text-xs text-text-disabled">
        now
      </span>

    </div>
  );
}