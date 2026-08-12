Absolutely. We'll use the roadmap you provided as the source of truth. **Phase 4 = JavaScript/TypeScript SDK**, with browser auto-capture and console interception intentionally left for Phases 7 and 8.

# Phase 4 — `@logged/sdk`

## Objective

Create a small, reliable SDK that lets developers send structured logs to Logged without manually making HTTP requests.

The target experience:

```bash
npm install @logged/sdk
```

Then:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY,
});

logger.info("Server started");

logger.warn("API response is slow");

logger.error("Database connection failed");
```

The SDK handles the HTTP communication with your Phase 3 API.

---

# 1. SDK Architecture

Recommended structure:

```text
packages/
└── sdk/
    ├── src/
    │   ├── index.ts
    │   ├── client.ts
    │   ├── logger.ts
    │   ├── transport.ts
    │   ├── types.ts
    │   └── errors.ts
    │
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    └── .gitignore
```

Keep the SDK independent from your Next.js dashboard.

---

# 2. SDK Initialization

The developer should initialize Logged once:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: "lg_live_xxxxxxxxx",
});
```

Support configuration such as:

```ts
const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  environment: "production",
});
```

### Configuration

```ts
interface LoggedConfig {
  apiKey: string;
  environment?: "development" | "staging" | "production";
  baseUrl?: string;
}
```

`baseUrl` is particularly useful during development:

```ts
baseUrl: "http://localhost:3000"
```

Production can default to your real API.

---

# 3. Logger Methods

Implement the six methods from the MVP roadmap:

```ts
logger.log();

logger.info();

logger.success();

logger.warn();

logger.error();

logger.debug();
```

All should ultimately use the same internal logging mechanism.

For example:

```ts
logger.info("User logged in");
```

internally becomes something equivalent to:

```ts
send({
  level: "info",
  message: "User logged in",
});
```

Don't duplicate the HTTP logic across every method.

---

# 4. Log Method Signature

I'd support:

```ts
logger.info(message, metadata);
```

Example:

```ts
logger.info("User logged in", {
  userId: "123",
  plan: "pro",
});
```

And:

```ts
logger.error("Payment failed", {
  orderId: "ORD-123",
  amount: 5000,
});
```

This maps directly to your Phase 3 API:

```json
{
  "level": "error",
  "message": "Payment failed",
  "metadata": {
    "orderId": "ORD-123",
    "amount": 5000
  },
  "environment": "production"
}
```

---

# 5. `logger.capture()`

Implement:

```ts
logger.capture(error);
```

Example:

```ts
try {
  await processPayment();
} catch (error) {
  logger.capture(error);
}
```

The SDK should extract useful information from an `Error`:

```text
message
stack
name
```

and send it as an error log.

For example:

```json
{
  "level": "error",
  "message": "Database connection failed",
  "stack": "Error: Database connection failed\n..."
}
```

Also support optional metadata:

```ts
logger.capture(error, {
  userId: "123",
  operation: "payment",
});
```

---

# 6. Internal Transport Layer

Don't let the logger methods directly call `fetch()`.

Instead:

```text
logger.info()
      │
      ▼
logger.ts
      │
      ▼
transport.ts
      │
      ▼
POST /api/v1/logs
```

Example internal interface:

```ts
interface LogPayload {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  environment?: string;
  stack?: string;
}
```

Then:

```ts
transport.send(payload);
```

This makes the SDK easier to extend later.

---

# 7. API Request

The SDK should send:

```http
POST /api/v1/logs
Authorization: Bearer lg_live_xxxxx
Content-Type: application/json
```

Body:

```json
{
  "level": "info",
  "message": "Server started",
  "metadata": {
    "port": 3000
  },
  "environment": "production"
}
```

---

# 8. API URL

Use a production default:

```ts
const DEFAULT_BASE_URL = "https://localhost:3000";
```

Then construct:

```text
https://localhost:3000/api/v1/logs
```

During development:

```ts
const logger = new Logged({
  apiKey: "...",
  baseUrl: "http://localhost:3000",
});
```

This will make local SDK testing much easier.

---

# 9. Authentication

The SDK automatically handles:

```http
Authorization: Bearer API_KEY
```

The developer shouldn't have to manually add the header.

So:

```ts
logger.info("Hello");
```

is all they need.

---

# 10. Error Handling

The SDK shouldn't crash the developer's application just because Logged is temporarily unavailable.

For example:

```text
Developer App
     │
     ├── logger.info()
     │
     ▼
 Logged API
     │
     X
  Network failure
```

You don't want:

```text
Logged error → Application crashes
```

Instead:

```text
Logged error → SDK handles failure
             → Application continues
```

Provide an optional debug mode for SDK errors.

Example:

```ts
const logger = new Logged({
  apiKey: "...",
  debug: true,
});
```

Then SDK problems can be surfaced during development.

---

# 11. TypeScript Types

The SDK should be strongly typed.

```ts
export type LogLevel =
  | "log"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "debug";
```

And:

```ts
export interface LogMetadata {
  [key: string]: unknown;
}
```

And:

```ts
export interface LogPayload {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  environment?: string;
  stack?: string;
}
```

This is especially important because you're targeting developers.

---

# 12. Message Normalization

Make the SDK predictable.

Support:

```ts
logger.info("Hello");
```

and:

```ts
logger.info("User logged in", {
  userId: "123",
});
```

For the MVP, keep the first argument a string.

Don't try to automatically serialize arbitrary objects as messages yet.

---

# 13. Environment

If supplied during initialization:

```ts
const logger = new Logged({
  apiKey: "...",
  environment: "production",
});
```

every log can automatically include:

```json
{
  "environment": "production"
}
```

The developer shouldn't have to repeat it:

```ts
logger.info("Server started");
logger.error("Database failed");
logger.warn("Slow request");
```

All three inherit the configured environment.

---

# 14. Browser + Server Compatibility

Because Logged will eventually support Next.js applications, don't make the basic SDK dependent on browser-only APIs.

Avoid relying on:

```ts
window
document
localStorage
```

inside the core SDK.

The basic logger should work in:

```text
Node.js
Next.js server
Next.js client
React
Browser applications
```

Browser-specific functionality belongs to **Phase 7**.

---

# 15. API Response Handling

Your Phase 3 API returns something like:

```json
{
  "success": true,
  "id": "log_123"
}
```

The SDK doesn't necessarily need to expose this ID for every logging call.

For example:

```ts
logger.info("Server started");
```

should remain simple.

Internally:

```text
POST
 ↓
201
 ↓
Done
```

If you later need advanced behavior, you can introduce promises or callbacks.

---

# 16. Package Build

The package should compile into usable JavaScript.

Recommended output:

```text
dist/
├── index.js
├── index.mjs
├── index.d.ts
└── ...
```

Support:

```ts
import { Logged } from "@logged/sdk";
```

Don't force users to import internal files.

---

# 17. Package Configuration

Your package should eventually have something like:

```json
{
  "name": "@logged/sdk",
  "version": "0.1.0",
  "description": "Logging SDK for Logged",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

You can refine the exact package configuration once we decide whether the SDK will live in the same repository as Logged or in its own repository.

---

# 18. Testing

Before publishing anything, test against your actual Phase 3 API.

### Basic logging

* [ ] `logger.log()`
* [ ] `logger.info()`
* [ ] `logger.success()`
* [ ] `logger.warn()`
* [ ] `logger.error()`
* [ ] `logger.debug()`

### Metadata

* [ ] String values
* [ ] Numbers
* [ ] Booleans
* [ ] Nested objects
* [ ] Arrays

### Errors

* [ ] `logger.capture(new Error(...))`
* [ ] Stack extraction
* [ ] Error metadata

### Configuration

* [ ] Valid API key
* [ ] Missing API key
* [ ] Custom environment
* [ ] Custom base URL

### Network

* [ ] Successful request
* [ ] Invalid API key
* [ ] API unavailable
* [ ] Timeout/network failure
* [ ] Invalid response

---

# 19. Test With a Real Next.js App

Create a small test application:

```text
sdk-test/
```

Install the local SDK:

```bash
npm install @logged/sdk
```

Then:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  environment: "development",
});

logger.info("Test application started");

logger.warn("This is a warning");

logger.error("Something went wrong", {
  test: true,
});
```

Then verify:

```text
Next.js Test App
       ↓
@logged/sdk
       ↓
Logged API
       ↓
Neon PostgreSQL
       ↓
logs table
```

---

# 20. Don't Build These Yet

Keep these out of Phase 4.

### ❌ Automatic errors

```ts
logger.auto();
```

That's **Phase 7**.

### ❌ Console interception

```ts
logger.interceptConsole();
```

That's **Phase 8**.

### ❌ Analytics

Phase 5+.

### ❌ Alerts

Post-MVP.

### ❌ AI

Post-MVP.

### ❌ Multiple language SDKs

Post-MVP.

The Phase 4 SDK should do one thing extremely well:

> **Send structured logs to Logged with minimal developer effort.**

---

# Phase 4 Definition of Done

You should be able to install the SDK into a completely separate application:

```bash
npm install @logged/sdk
```

Initialize it:

```ts
const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});
```

Then:

```ts
logger.info("Application started");

logger.success("Payment completed");

logger.warn("API is slow");

logger.error("Database failed");

logger.debug("Request details");

logger.capture(error);
```

And every call should reliably produce a corresponding record in your Logged database.

### Final Phase 4 flow

```text
┌──────────────────────┐
│ Developer's App      │
│                      │
│ logger.error(...)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ @logged/sdk          │
│                      │
│ Normalize             │
│ Add environment       │
│ Attach API key        │
└──────────┬───────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────┐
│ POST /api/v1/logs    │
│                      │
│ Authenticate         │
│ Validate             │
│ Rate limit           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Neon PostgreSQL      │
│                      │
│ logs                 │
└──────────────────────┘
```

Once this works reliably, **Phase 5 — Dashboard** can consume those real logs and turn Logged into a usable product.
