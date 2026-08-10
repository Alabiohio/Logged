type LogLevel = "log" | "info" | "success" | "warn" | "error" | "debug";
interface LogMetadata {
    [key: string]: unknown;
}
interface LogPayload {
    level: LogLevel;
    message: string;
    metadata?: LogMetadata;
    environment?: string;
    stack?: string;
    url?: string;
    pathname?: string;
    browser?: string;
    device?: string;
    os?: string;
    userAgent?: string;
}
interface LoggedConfig {
    apiKey: string;
    environment?: string;
    baseUrl?: string;
    debug?: boolean;
}

declare class Logged {
    private config;
    private transport;
    private cleanupAutoCapture?;
    constructor(config: LoggedConfig);
    private send;
    log(message: string, metadata?: LogMetadata): void;
    info(message: string, metadata?: LogMetadata): void;
    success(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    error(message: string, metadata?: LogMetadata): void;
    debug(message: string, metadata?: LogMetadata): void;
    capture(error: unknown, metadata?: LogMetadata): void;
    auto(): void;
    stopAutoCapture(): void;
}

export { type LogLevel, type LogMetadata, type LogPayload, Logged, type LoggedConfig };
