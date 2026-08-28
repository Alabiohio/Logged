"use client";

import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-32">

      <div className="glass overflow-hidden rounded-[28px] px-6 py-14 text-center sm:rounded-[40px] sm:p-16">

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-hero leading-tight sm:mt-8 sm:text-5xl lg:text-6xl">
          <span className="font-normal">Stop</span>
          <span className="font-normal"> chasing</span>
          <span className="font-semibold"> logs</span>

           .

          <br />
          <span className="font-bold"> Start</span>
          <span className="font-extrabold"> Understanding</span>
          <span className="font-black"> them.</span>

           
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-muted sm:mt-8 sm:text-lg">

          Join developers building more reliable software with Logged.

        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-xl transition hover:bg-primary-hover sm:mt-10">

          Start Free

          <ArrowRight size={18} />

        </button>

      </div>

    </section>
  );
}