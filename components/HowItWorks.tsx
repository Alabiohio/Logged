"use client";

import {
  FolderPlus,
  KeyRound,
  Code2,
  Activity,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: FolderPlus,
    title: "Create a Project",
    description:
      "Create a project in Logged and organize your applications in one place.",
  },
  {
    icon: KeyRound,
    title: "Copy Your API Key",
    description:
      "Every project gets a secure API key for sending logs safely.",
  },
  {
    icon: Code2,
    title: "Install the SDK",
    description:
      "Add the SDK to your application and initialize it with your API key.",
  },
  {
    icon: Activity,
    title: "Start Monitoring",
    description:
      "Logs begin appearing instantly in your dashboard with filtering and search.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">

      <div className="text-center">

        <h2 className="mt-6 text-3xl font-black text-text sm:text-4xl lg:text-5xl">
          Get started in minutes.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base text-text-muted sm:text-lg">
          No complicated setup. Just create a project, install the SDK,
          and start receiving logs instantly.
        </p>

      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-24 lg:grid-cols-4">

        {steps.map((step, index) => {

          const Icon = step.icon;

          return (
            <div key={step.title} className="relative">

              <div className="glass p-6 sm:p-8 h-full rounded-3xl">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
                  <Icon size={26} />
                </div>

                <div className="mt-6 sm:mt-8">

                  <span className="text-sm font-semibold text-primary-hover">
                    Step {index + 1}
                  </span>

                  <h3 className="mt-3 text-xl font-bold sm:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-text-muted">
                    {step.description}
                  </p>

                </div>

              </div>

              {index !== steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-7 top-1/2 hidden -translate-y-1/2 text-text-disabled lg:block"
                  size={28}
                />
              )}

            </div>
          );
        })}

      </div>

    </section>
  );
}