import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Examples | Logged",
  description:
    "Examples for using Logged in React, Next.js, and plain JavaScript projects.",
};

const examples = [
  {
    title: "Next.js",
    href: "/docs/examples/nextjs",
    description: "Client-side setup for App Router and browser error capture.",
  },
  {
    title: "React",
    href: "/docs/examples/react",
    description: "Vite or CRA setup with logging and error capture in components.",
  },
  {
    title: "JavaScript",
    href: "/docs/examples/javascript",
    description: "Plain JS and TypeScript examples without a framework.",
  },
];

export default function ExamplesIndexPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
          Examples
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Choose the integration pattern that matches your stack and start sending
          structured logs quickly.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {examples.map((example) => (
          <Link
            key={example.title}
            href={example.href}
            className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-sm"
          >
            <h2 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              {example.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              {example.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View example
              <ChevronRight className="h-4 w-4" strokeWidth={4} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
