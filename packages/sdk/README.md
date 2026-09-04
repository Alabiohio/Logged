# @oheoco/logged

> Simple, lightweight application logging and error monitoring SDK for JavaScript, TypeScript, React, and Next.js applications.

## Installation

```bash
npm install @oheoco/logged
```

or with yarn / pnpm / bun:

```bash
yarn add @oheoco/logged
pnpm add @oheoco/logged
bun add @oheoco/logged
```

---

## Quickstart

### Initialize the SDK

```typescript
import { Logged } from "@oheoco/logged";



const logger = new Logged({
  apiKey: "YOUR_PROJECT_API_KEY",
  environment: "production",
});
```

---

## Usage

### 1. Manual Logging

Log messages across standard log levels (`log`, `info`, `success`, `warn`, `error`, `debug`):

```typescript
// Basic log messages
logger.info("User completed onboarding process");
logger.success("Payment verified successfully", { amount: 49.99, currency: "USD" });
logger.warn("Rate limit approaching", { remaining: 5 });
logger.error("Failed to connect to database", { dbHost: "db.example.com" });
```

### 2. Manual Error Capture

Capture caught exceptions or custom error objects with stack trace formatting:

```typescript
try {
  throw new Error("Payment processing failed");
} catch (err) {
  logger.capture(err, { userId: "usr_123" });
}
```

### 3. Automatic Browser Error Capture

Automatically catch unhandled promise rejections and global browser uncaught errors:

```typescript
// Enable auto capture for window.onerror and unhandledrejection
logger.auto();

// To stop auto capture later:
// logger.stopAutoCapture();
```

### 4. Console Interception

Interceptors for standard `console.log`, `console.warn`, `console.error`, and `console.info` calls:

```typescript
// Intercept all native console calls and route them to Logged
logger.interceptConsole();

// To stop console interception later:
// logger.stopConsoleInterception();
```

---

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | **Required** | Your Logged Project API Key. |
| `environment` | `string` | `"development"` | Application environment tag (e.g. `production`, `staging`, `development`). |
| `baseUrl` | `string` | `"http://localhost:3000"` | Optional custom backend ingestion API base URL. |
| `debug` | `boolean` | `false` | Enable SDK debug logging to console. |

---

## TypeScript Support

Full TypeScript definitions are bundled out of the box:

```typescript
import type { LoggedConfig, LogLevel, LogMetadata, LogPayload } from "@oheoco/logged";
```

---

## License

[MIT](LICENSE)
