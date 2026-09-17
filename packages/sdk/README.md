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

The SDK sends logs to the Logged ingestion endpoint at:

```bash
https://logged.oheo.site/api/v1/logs
```

It does not currently expose a custom `baseUrl` constructor option.

### Initialize the SDK

```typescript
import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: "YOUR_PROJECT_API_KEY",
  environment: "production",
});
```

### Browser script tag usage

```html
<script src="https://cdn.jsdelivr.net/npm/@oheoco/logged/dist/logged.global.js"></script>
<script>
  const logger = new Logged({
    apiKey: "YOUR_PROJECT_API_KEY",
    environment: "production",
  });

  logger.info("Page loaded");
</script>
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

// Tabular data
logger.table("Users", [
  { name: "Alice", active: true, revenue: 1200 },
  { name: "Bob", active: false, revenue: 980 },
]);
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
| `apiKey` | `string` | **Required** | Your Logged project API key. |
| `environment` | `string` | `undefined` | Adds a project environment label such as `development`, `staging`, or `production`. |
| `debug` | `boolean` | `false` | Enables extra SDK logging for failed requests and internal capture errors. |

> The SDK currently sends logs to the default Logged ingestion endpoint and does not expose a custom `baseUrl` constructor option.

### Browser globals and script tag usage

```html
<script src="https://cdn.jsdelivr.net/npm/@oheoco/logged/dist/logged.global.js"></script>
<script>
  const logger = new Logged({
    apiKey: "YOUR_PROJECT_API_KEY",
    environment: "production",
  });

  logger.auto();
  logger.interceptConsole();
</script>
```

The browser build also exposes `window.Logged` and `window.logged`. If a script tag includes `data-api-key`, the SDK auto-creates a logger and enables auto capture and console capture unless you disable them with `data-auto="false"` or `data-console="false"`.

### Debugging

```typescript
const logger = new Logged({
  apiKey: "YOUR_PROJECT_API_KEY",
  debug: true,
});
```

With `debug: true`, the SDK logs failed transport requests and any internal capture exceptions to the console.

---

## TypeScript Support

Full TypeScript definitions are bundled out of the box:

```typescript
import type { LoggedConfig, LogLevel, LogMetadata, LogPayload } from "@oheoco/logged";
```

---

## License

[MIT](LICENSE)
