"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I send logs to Logged?",
    answer:
      "Install the SDK or send HTTP requests directly to the Logged API using your project API key.",
  },
  {
    question: "Does Logged support server-side applications?",
    answer:
      "Yes. Logged can receive logs from websites, APIs, servers, and any application capable of making HTTP requests.",
  },
  {
    question: "Can I use Logged for free?",
    answer:
      "Yes. The Free plan lets you monitor personal projects before upgrading.",
  },
  {
    question: "Are my logs secure?",
    answer:
      "All requests are authenticated using project API keys and transmitted over HTTPS.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20 lg:py-32">

      <div className="text-center">

        <h2 className="mt-6 text-3xl font-black sm:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h2>

      </div>

      <div className="mt-12 space-y-4 sm:mt-16">

        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="glass overflow-hidden rounded-3xl"
          >
            <button
              onClick={() =>
                setOpen(open === index ? null : index)
              }
              className="flex w-full items-center justify-between p-5 text-left sm:p-6"
            >
              <span className="font-semibold text-base sm:text-lg pr-4">
                {faq.question}
              </span>

              <ChevronDown
                className={`shrink-0 transition ${
                  open === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {open === index && (
              <div className="px-5 pb-5 text-text-muted leading-7 sm:px-6 sm:pb-6">
                {faq.answer}
              </div>
            )}
          </div>
        ))}

      </div>

    </section>
  );
}