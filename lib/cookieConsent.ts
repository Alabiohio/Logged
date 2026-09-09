/**
 * Utility functions for managing user cookie consent state
 * and syncing with Google Analytics (gtag).
 */

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean; // Controls Google Analytics tracking
  marketing: boolean; // Marketing / third-party tracking
  timestamp: string;
}

export const COOKIE_CONSENT_KEY = "logged_cookie_consent";

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: false,
  timestamp: new Date().toISOString(),
};

/**
 * Retrieves stored cookie preferences from localStorage.
 * Returns null if no preferences have been saved yet.
 */
export function getStoredCookieConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const item = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!item) return null;
    return JSON.parse(item) as CookiePreferences;
  } catch (error) {
    console.error("Failed to read cookie consent from localStorage:", error);
    return null;
  }
}

/**
 * Saves cookie preferences to localStorage and updates gtag consent mode.
 */
export function saveCookieConsent(prefs: Partial<CookiePreferences>): CookiePreferences {
  const fullPreferences: CookiePreferences = {
    essential: true,
    analytics: true, // Google Analytics is compulsory
    marketing: prefs.marketing ?? false,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullPreferences));
      document.cookie = `${COOKIE_CONSENT_KEY}=${JSON.stringify(fullPreferences)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }

    updateGtagConsent(fullPreferences);
  }

  return fullPreferences;
}

/**
 * Updates Google Analytics consent status based on user preferences.
 */
export function updateGtagConsent(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      analytics_storage: "granted", // Compulsory analytics
      ad_storage: prefs.marketing ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
    });
  }
}

/**
 * Checks if user has given consent for analytics tracking.
 */
export function hasAnalyticsConsent(): boolean {
  return true; // Compulsory analytics tracking
}

/**
 * Clears stored cookie consent (forces banner to reappear).
 */
export function resetCookieConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    document.cookie = `${COOKIE_CONSENT_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to reset cookie consent:", error);
  }
}
