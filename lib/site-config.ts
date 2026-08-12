const DEFAULT_APP_URL = "http://localhost:3000";

const readEnv = (key: string) => {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env?.[key] || undefined;
};

export const APP_URL =
  readEnv("NEXT_PUBLIC_APP_URL") ||
  readEnv("APP_URL") ||
  readEnv("BETTER_AUTH_URL") ||
  DEFAULT_APP_URL;

export const LOGGED_BASE_URL =
  readEnv("NEXT_PUBLIC_LOGGED_BASE_URL") ||
  readEnv("LOGGED_BASE_URL") ||
  APP_URL;
