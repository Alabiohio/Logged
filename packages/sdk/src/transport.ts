import { LogPayload, LoggedConfig } from "./types";

const LOGGED_ENDPOINT = "https://logged.oheo.site/api/v1/logs";

export class Transport {
  private config: LoggedConfig;

  constructor(config: LoggedConfig) {
    this.config = config;
  }

  async send(payload: LogPayload): Promise<void> {
    try {
      const response = await fetch(LOGGED_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (this.config.debug) {
          let text = await response.text();
          if (text.trim().startsWith("<")) {
            text = "[HTML Response / Not Found]";
          } else if (text.length > 300) {
            text = text.slice(0, 300) + "...";
          }
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

