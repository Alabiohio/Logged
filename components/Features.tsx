"use client";

const features = [
  {
    title: "Real-time Logging",
    description:
      "View incoming logs instantly from every application without refreshing.",
    icon: "⚡",
  },
  {
    title: "Automatic Error Capture",
    description:
      "Catch uncaught exceptions and promise rejections automatically.",
    icon: "🚨",
  },
  {
    title: "Powerful Search",
    description:
      "Find any log using keywords, levels, timestamps or metadata.",
    icon: "🔍",
  },
  {
    title: "Analytics",
    description:
      "Visualize trends, error spikes and application health.",
    icon: "📊",
  },
  {
    title: "REST API",
    description:
      "Send logs from any language using a simple HTTP endpoint.",
    icon: "🌐",
  },
  {
    title: "Projects",
    description:
      "Separate environments and applications with dedicated API keys.",
    icon: "📦",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">

      <div className="text-center">

        <span className="rounded-full border border-primary-light bg-primary-soft px-4 py-2 text-sm font-medium text-primary-active">
          Why Logged
        </span>

        <h2 className="mt-6 text-5xl font-black tracking-tight text-text">
          Everything you need.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted">
          Built for modern developers who want reliable logging
          without the complexity.
        </p>

      </div>

      <div className="mt-20 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-[28px] border border-border bg-glass p-8 backdrop-blur-3xl transition duration-300 hover:-translate-y-2 hover:bg-glass-hover hover:shadow-2xl"
          >

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl shadow-lg shadow-lg">
              {feature.icon}
            </div>

            <h3 className="text-xl font-bold text-text">
              {feature.title}
            </h3>

            <p className="mt-4 leading-7 text-text-muted">
              {feature.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}