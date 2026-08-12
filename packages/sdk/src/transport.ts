import { LogPayload, LoggedConfig } from "./types";

const DEFAULT_BASE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOGGED_BASE_URL
    ? process.env.NEXT_PUBLIC_LOGGED_BASE_URL
    : "http://localhost:3000";

export class Transport {
  private config: LoggedConfig;
  private endpoint: string;

  constructor(config: LoggedConfig) {
    this.config = config;
    const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    // ensure no trailing slash, then append /api/v1/logs
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.endpoint = `${normalizedBase}/api/v1/logs`;
  }

  async send(payload: LogPayload): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (this.config.debug) {
          const text = await response.text();
          console.error(`[Logged SDK] Failed to send log: ${response.status} ${response.statusText} - ${text}`);
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("[Logged SDK] Network error while sending log:", error);
      }
    }
  }
}
