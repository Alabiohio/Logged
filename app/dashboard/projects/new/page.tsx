"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        router.push(`/dashboard/projects/${data.id}`);
      } catch (err) {
        setError("Failed to create project. Please try again.");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-black text-text">Create Project</h1>
        <p className="text-text-secondary mt-1">Set up a new application to start receiving logs.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-glass p-6 space-y-5">
          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-text">
              Project Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              placeholder="e.g. My Portfolio"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-text">
              Description
              <span className="ml-2 text-xs font-normal text-text-muted">Optional</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What does this project do?"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>



          {/* Website URL */}
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-semibold text-text">
              Website URL
              <span className="ml-2 text-xs font-normal text-text-muted">Optional</span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/projects"
            className="rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-glass-hover"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-95 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
