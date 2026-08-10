"use client";

import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-32">

      <div className="glass overflow-hidden rounded-[40px] p-16 text-center">

        <h2 className="mx-auto mt-8 max-w-3xl text-6xl font-black leading-tight">

          Stop chasing logs.

          <br />

          Start understanding them.

        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-text-muted">

          Join developers building more reliable software with Logged.

        </p>

        <button className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-xl shadow-lg transition hover:bg-primary-hover">

          Start Free

          <ArrowRight size={18} />

        </button>

      </div>

    </section>
  );
}