const DEFAULT_APP_URL = "http://localhost:3000";

const getServerEnv = (key: string) => {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env?.[key] || undefined;
};

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  getServerEnv("APP_URL") ||
  getServerEnv("BETTER_AUTH_URL") ||
  (typeof window !== "undefined" ? window.location.origin : undefined) ||
  DEFAULT_APP_URL;

export const LOGGED_BASE_URL =
  process.env.NEXT_PUBLIC_LOGGED_BASE_URL ||
  getServerEnv("LOGGED_BASE_URL") ||
  (typeof window !== "undefined" ? window.location.origin : undefined) ||
  APP_URL;
