import { LogPayload, LoggedConfig } from "./types";
import { redactLogPayload } from "./utils/redact";

const LOGGED_ENDPOINT = "https://logged.oheo.site/api/v1/logs";

export class Transport {
  private config: LoggedConfig;
  private queue: LogPayload[] = [];
  private flushTimer?: ReturnType<typeof setTimeout>;
  private flushing = false;

  private static readonly BATCH_SIZE = 100;
  private static readonly FLUSH_DELAY_MS = 100;

  constructor(config: LoggedConfig) {
    this.config = config;
  }

  send(payload: LogPayload): void {
    const sanitized = redactLogPayload(payload);
    this.queue.push(sanitized);

    if (this.queue.length >= Transport.BATCH_SIZE) {
      if (this.flushTimer) clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
      void this.flush();
      return;
    }

    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer || this.queue.length === 0) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = undefined;
      void this.flush();
    }, Transport.FLUSH_DELAY_MS);
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;

    this.flushing = true;
    const batch = this.queue.splice(0, Transport.BATCH_SIZE);

    try {
      const response = await fetch(LOGGED_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ logs: batch }),
      });

      if (!response.ok && this.config.debug) {
        let text = await response.text();
        if (text.trim().startsWith("<")) {
          text = "[HTML Response / Not Found]";
        } else if (text.length > 300) {
          text = text.slice(0, 300) + "...";
        }
        console.error(`[Logged SDK] Failed to send log batch: ${response.status} ${response.statusText} - ${text}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("[Logged SDK] Network error while sending log batch:", error);
      }
    } finally {
      this.flushing = false;
      if (this.queue.length >= Transport.BATCH_SIZE) {
        void this.flush();
      } else {
        this.scheduleFlush();
      }
    }
  }
}

