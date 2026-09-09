"use client";

import { useEffect, useState } from "react";
import {
  CookiePreferences,
  DEFAULT_PREFERENCES,
  getStoredCookieConsent,
  saveCookieConsent,
} from "@/lib/cookieConsent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user already saved preferences
    const stored = getStoredCookieConsent();
    if (stored) {
      setPreferences(stored);
      setIsVisible(false);
    } else {
      // Delay initial render slightly for smooth slide-in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Event listener so footer/settings links can dispatch 'open-cookie-banner'
    const handleReopen = () => {
      const stored = getStoredCookieConsent();
      if (stored) setPreferences(stored);
      setIsVisible(true);
      setIsCustomizeOpen(true);
    };

    window.addEventListener("open-cookie-banner", handleReopen);
    return () => window.removeEventListener("open-cookie-banner", handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const updated = saveCookieConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
    setPreferences(updated);
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    const updated = saveCookieConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
    setPreferences(updated);
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const updated = saveCookieConsent(preferences);
    setPreferences(updated);
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences consent banner"
      aria-describedby="cookie-banner-description"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9999] transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 bg-slate-900/90 dark:bg-slate-950/90 p-5 md:p-6 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 text-slate-100 dark:text-slate-100">
        {/* Glow ambient background pill */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">
                cookie
              </span>
              <h3 className="font-heading font-bold text-base tracking-wide text-white">
                Cookie Preferences
              </h3>
            </div>
            <button
              onClick={handleEssentialOnly}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
              aria-label="Close and keep essential cookies only"
              title="Decline optional cookies"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                close
              </span>
            </button>
          </div>

          {/* Description */}
          <p id="cookie-banner-description" className="text-xs text-slate-300 leading-relaxed">
            We use cookies to improve your user experience, analyze website traffic, and optimize application performance. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
          </p>

          {/* Granular Customization Section */}
          {isCustomizeOpen && (
            <div className="flex flex-col gap-3 py-2 border-y border-white/10 my-1 text-xs text-slate-200">
              {/* Essential */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-slate-100">Essential Cookies</span>
                  <span className="text-[11px] text-slate-400">Required for authentication & core functionality</span>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="accent-primary cursor-not-allowed h-4 w-4 rounded"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-slate-100">Analytics & Performance</span>
                  <span className="text-[11px] text-slate-400">Required for monitoring errors & application usage</span>
                </div>
                <input
                  type="checkbox"
                  id="cookie-analytics-toggle"
                  checked={true}
                  disabled={true}
                  className="accent-primary cursor-not-allowed h-4 w-4 rounded"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-slate-100">Marketing & Insights</span>
                  <span className="text-[11px] text-slate-400">Used to measure campaign conversion rates</span>
                </div>
                <input
                  type="checkbox"
                  id="cookie-marketing-toggle"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="accent-primary cursor-pointer h-4 w-4 rounded"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isCustomizeOpen ? (
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-md shadow-primary/20 text-center"
              >
                Save Preferences
              </button>
            ) : (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-md shadow-primary/20 text-center"
                >
                  Accept All
                </button>
                <button
                  onClick={handleEssentialOnly}
                  className="py-2 px-3 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-all text-center"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setIsCustomizeOpen(true)}
                  className="py-2 px-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all text-center underline underline-offset-4"
                >
                  Customize
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to dispatch an event that opens the cookie consent banner/modal.
 */
export function openCookieBanner() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-cookie-banner"));
  }
}
