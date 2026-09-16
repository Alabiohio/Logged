"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Bug, CheckCircle2, Lightbulb, MessageCircle, Send, Star } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Category = "bug" | "feature" | "general";

const categories = [
  { id: "feature" as const, label: "Feature request", icon: Lightbulb },
  { id: "bug" as const, label: "Bug report", icon: Bug },
  { id: "general" as const, label: "General", icon: MessageCircle },
];

export default function FeedbackPage() {
  const { data: session } = authClient.useSession();
  const [category, setCategory] = useState<Category>("feature");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    const feedbackEmail = email.trim() || session?.user?.email || "";
    if (!feedbackEmail) return setErrorMessage("Email address is required.");
    if (!message.trim()) return setErrorMessage("Please enter your feedback message.");

    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rating, message: message.trim(), email: feedbackEmail, isAnonymous }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setErrorMessage(data.error || "Failed to submit feedback. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCategory("feature");
    setRating(null);
    setMessage("");
    setIsAnonymous(false);
    setErrorMessage("");
  };

  return (
    <main id="main-content" className="min-h-screen bg-background text-text">
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight text-primary">Logged</Link>
          <Link href="/" className="text-sm font-semibold text-text-secondary underline underline-offset-4">Back to home</Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Send feedback</h1>
          <p className="mt-2 max-w-xl text-base text-text-secondary">Tell us what is working, what is not, or what you would like to see next.</p>
        </div>

        {submitted ? (
          <section className="border border-border bg-background-secondary p-6 sm:p-8" aria-live="polite">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold">Thank you for your feedback.</h2>
            <p className="mt-2 text-text-secondary">Your response has been saved.</p>
            <button type="button" onClick={resetForm} className="mt-6 border border-primary bg-primary px-5 py-3 text-sm font-bold text-white">Send another response</button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            {errorMessage && (
              <div className="flex gap-3 border border-error bg-red-50 p-4 text-sm font-medium text-error" role="alert">
                <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <fieldset>
              <legend className="mb-3 text-sm font-bold">Feedback type</legend>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {categories.map(({ id, label, icon: Icon }) => {
                  const selected = category === id;
                  return <button key={id} type="button" aria-pressed={selected} onClick={() => setCategory(id)} className={`min-h-24 border p-3 text-center text-xs font-bold sm:text-sm ${selected ? "border-primary bg-primary text-white" : "border-border bg-background-secondary text-text-secondary"}`}>
                    <Icon className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
                    {label}
                  </button>;
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-bold">Overall experience</legend>
              <div className="flex gap-2" role="group" aria-label="Overall experience rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const selected = rating !== null && star <= rating;
                  return <button key={star} type="button" aria-label={`Rate ${star} out of 5 stars`} aria-pressed={rating === star} onClick={() => setRating(star)} className={`flex h-11 w-11 items-center justify-center border ${selected ? "border-warning bg-warning text-white" : "border-border bg-background-secondary text-text-muted"}`}>
                    <Star className={selected ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden="true" />
                  </button>;
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="feedback-email" className="mb-2 block text-sm font-bold">Email address <span className="text-error">*</span></label>
              <input id="feedback-email" type="email" required autoComplete="email" value={email || session?.user?.email || ""} onChange={(event) => setEmail(event.target.value)} placeholder="your.email@example.com" className="w-full border border-border bg-background px-4 py-3 text-base text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label htmlFor="feedback-message" className="mb-2 block text-sm font-bold">Your feedback <span className="text-error">*</span></label>
              <textarea id="feedback-message" required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what is on your mind..." className="w-full resize-y border border-border bg-background p-4 text-base text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>

            <label className="flex items-start gap-3 border-t border-border pt-5 text-sm text-text-secondary">
              <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span><span className="block font-bold text-text">Submit anonymously</span>Your user account will not be linked to this response.</span>
            </label>

            <button type="submit" disabled={loading || !message.trim() || !(email.trim() || session?.user?.email)} className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" aria-hidden="true" />
              {loading ? "Submitting feedback..." : "Submit feedback"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
