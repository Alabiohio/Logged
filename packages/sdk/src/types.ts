export type LogLevel =
  | "log"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "debug";

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogPayload {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  environment?: string;
  stack?: string;
  
  // Browser context fields
  url?: string;
  pathname?: string;
  browser?: string;
  device?: string;
  os?: string;
  userAgent?: string;
}

export interface LoggedConfig {
  apiKey: string;
  environment?: string;
  baseUrl?: string;
  debug?: boolean;
}
