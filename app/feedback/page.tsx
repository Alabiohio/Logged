"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, CheckCircle2, Bug, Lightbulb, MessageCircle, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

export default function FeedbackPage() {
  const { data: session } = authClient.useSession();
  const [category, setCategory] = useState<"bug" | "feature" | "general">("feature");
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [syncedSessionEmail, setSyncedSessionEmail] = useState<string | null>(null);

  // Pre-fill email from session if logged in
  if (session?.user?.email && syncedSessionEmail !== session.user.email) {
    setSyncedSessionEmail(session.user.email);
    if (!email) {
      setEmail(session.user.email);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Please enter your feedback message.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim(),
          email: email.trim(),
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
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

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden pt-24 bg-background text-text">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-info/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-light/20 blur-[150px]" />
      </div>

      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black tracking-tight text-text sm:text-5xl">
            Help Us Improve Logged
          </h1>
          <p className="mt-4 text-base !font-console text-text-secondary max-w-xl mx-auto">
            Have a suggestion, spotted a bug, or want to request a feature? Let us know below—we read every response!
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl border border-border bg-glass p-10 text-center backdrop-blur-xl shadow-xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-text">Thank You!</h2>
            <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
              Your feedback has been saved. Thank you for helping make Logged better for everyone!
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setMessage("");
                setRating(null);
                setHoverRating(null);
                setIsAnonymous(false);
                setErrorMessage("");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover shadow-md"
            >
              Send Another Feedback
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mt-12 space-y-8 px-3 py-8"
          >
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-500">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Category selection */}
            <div>
              <label className="block text-sm font-semibold text-text mb-3">Feedback Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "feature", label: "Feature Request", icon: Lightbulb },
                  { id: "bug", label: "Bug Report", icon: Bug },
                  { id: "general", label: "General", icon: MessageCircle },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as "bug" | "feature" | "general")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-glass text-text-secondary hover:border-primary/40 hover:text-text"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Satisfaction rating with Star icons */}
            <div>
              <label className="block text-sm font-semibold text-text mb-3">Overall Experience</label>
              <div
                className="flex items-center gap-3"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = activeRating !== null && star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 ${
                        isFilled
                          ? "border-amber-400 bg-amber-400/10 text-amber-400 scale-105 shadow-md"
                          : "border-border bg-glass text-text-muted hover:border-amber-400/50 hover:text-amber-400/70"
                      }`}
                    >
                      <Star
                        className={`h-6 w-6 transition-all ${
                          isFilled ? "fill-amber-400 text-amber-400" : "fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email input (Required) */}
            <div>
              <label htmlFor="feedback-email" className="block text-sm font-semibold text-text mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-2xl border border-border bg-background/60 p-3.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Message input */}
            <div>
              <label htmlFor="feedback-message" className="block text-sm font-semibold text-text mb-2">
                Your Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feedback-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full rounded-2xl border border-border bg-background/60 p-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            {/* Anonymous option */}
            <div className="flex items-center gap-3 pt-1">
              <input
                id="is-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <label htmlFor="is-anonymous" className="text-sm font-medium text-text cursor-pointer select-none">
                Submit feedback anonymously
                <span className="block text-xs text-text-muted font-normal">Your user account won&apos;t be linked to this submission, and your feedback won&apos;t be made public</span>

              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !message.trim() || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <Cardio size="35" color="currentColor" speed="1.5" stroke="3" bgOpacity="0.1" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </motion.form>
        )}
      </div>

      <Footer />
    </main>
  );
}
