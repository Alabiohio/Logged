# Logged

[![npm version](https://img.shields.io/npm/v/@oheoco/logged?logo=npm)](https://www.npmjs.com/package/@oheoco/logged)
[![npm downloads](https://img.shields.io/npm/dm/@oheoco/logged?logo=npm)](https://www.npmjs.com/package/@oheoco/logged)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](packages/sdk/LICENSE)

Logged is an application logging and error-monitoring platform for modern web applications. It gives each project environment-specific API keys, accepts structured logs through an HTTP API or JavaScript/TypeScript SDK, and provides an authenticated dashboard for searching and investigating application activity.

Hosted instance: [logged.oheo.site](https://logged.oheo.site) · [Sign in](https://logged.oheo.site/login) · [Create an account](https://logged.oheo.site/register)

Useful links: [Dashboard](https://logged.oheo.site/dashboard) · [Quick start](https://logged.oheo.site/docs/quick-start) · [SDK documentation](https://logged.oheo.site/docs/sdk) · [REST API reference](https://logged.oheo.site/docs/rest-api) · [npm package](https://www.npmjs.com/package/@oheoco/logged) · [GitHub repository](https://github.com/Alabiohio/Logged)

## What Logged provides

- Project-based log organization with separate development, staging, and production keys
- Log levels: `log`, `debug`, `info`, `success`, `warn`, and `error`
- Structured metadata, stack traces, URLs, environments, and source information
- Dashboard statistics, recent activity, project summaries, and filtered log search
- Single-event and batch ingestion through `POST /api/v1/logs`
- A JavaScript/TypeScript SDK for manual logging, error capture, browser error capture, and console interception
- Email alerts for newly ingested error logs
- Optional weekly digest emails and configurable log retention cleanup
- Email/password authentication with required email verification, plus optional Google and GitHub providers

## Quick start with the hosted service

1. Create an account at [logged.oheo.site](https://logged.oheo.site).
2. Verify your email address and open the dashboard.
3. Create a project.
4. Create or regenerate an API key for the target environment under the project settings.
5. Install the SDK:

   ```bash
   npm install @oheoco/logged
   ```

6. Initialize the SDK and send a log:

   ```typescript
   import { Logged } from "@oheoco/logged";

   const logger = new Logged({
     apiKey: process.env.LOGGED_API_KEY!,
     environment: "production",
   });

   logger.info("Application started");
   ```

Open the project logs in the dashboard to inspect the event.

## SDK

The package is published as `@oheoco/logged` and includes CommonJS, ES module, TypeScript declaration, and browser-global builds.

### Installation

```bash
npm install @oheoco/logged
```

### Manual logging

```typescript
import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  environment: "production",
  debug: false,
});

logger.log("A general application event");
logger.info("User signed in", { userId: "usr_123" });
logger.success("Payment completed", { orderId: "ord_123" });
logger.warn("Rate limit is nearly exhausted", { remaining: 5 });
logger.error("Database connection failed", { host: "db.example.com" });
logger.debug("Request details", { method: "GET", pathname: "/api/users" });
```

### Capture caught errors

`capture` sends an error-level event. For an `Error`, it includes the message, stack, and error name.

```typescript
try {
  await processPayment();
} catch (error) {
  logger.capture(error, {
    orderId: "ord_123",
    operation: "checkout",
  });
}
```

### Capture tables

Tables are sent as an `info` event with the data stored in `metadata.table`.

```typescript
logger.table("Active users", [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
]);
```

### Browser automatic capture

In a browser, `auto()` listens for uncaught errors and unhandled promise rejections. It is safe to call more than once, and `stopAutoCapture()` removes the handlers.

```typescript
logger.auto();

// Later, when the application or test lifecycle ends:
logger.stopAutoCapture();
```

### Browser console interception

`interceptConsole()` forwards `console.log`, `console.info`, `console.warn`, `console.error`, and `console.table` to Logged while preserving their normal DevTools behavior.

```typescript
logger.interceptConsole();

// Restore the original console methods:
logger.stopConsoleInterception();
```

This feature is browser-only. Server-side console methods are not modified.

### Configuration

| Option | Required | Description |
| --- | --- | --- |
| `apiKey` | Yes | Project API key used for ingestion. |
| `environment` | No | Environment label such as `development`, `staging`, or `production`. |
| `debug` | No | Prints SDK transport errors to the console when enabled. |

The SDK currently sends to `https://logged.oheo.site/api/v1/logs` and does not expose a custom `baseUrl` option.

### Browser script tag

The browser bundle is available from jsDelivr:

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

The bundle exposes `window.Logged` and `window.logged`.

## REST API

### Endpoint

```text
POST https://logged.oheo.site/api/v1/logs
```

Authenticate with the project API key as a Bearer token:

```http
Authorization: Bearer YOUR_PROJECT_API_KEY
Content-Type: application/json
```

### Send one log

```bash
curl -X POST https://logged.oheo.site/api/v1/logs \
  -H "Authorization: Bearer YOUR_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Failed to connect to database",
    "source": "server",
    "environment": "production",
    "metadata": {
      "requestId": "req_123",
      "retryCount": 3
    },
    "stack": "Error: Failed to connect to database"
  }'
```

Successful single-log responses return HTTP `201`:

```json
{
  "success": true,
  "id": "log_abc123"
}
```

### Send a batch

Send up to 100 logs in one request by providing a `logs` array:

```json
{
  "logs": [
    { "level": "info", "message": "Worker started" },
    { "level": "error", "message": "Worker failed" }
  ]
}
```

The response includes accepted and rejected counts:

```json
{
  "success": true,
  "accepted": 2,
  "rejected": 0
}
```

### Request fields

| Field | Required | Description |
| --- | --- | --- |
| `level` | Yes | `log`, `debug`, `info`, `success`, `warn`, or `error`. |
| `message` | Yes | Human-readable log message. |
| `metadata` | No | JSON object containing application-specific context. |
| `environment` | No | Environment label. The API key environment is applied during normalization. |
| `source` | No | `server`, `client`, or `edge`. |
| `url` | No | Full URL where the event originated. |
| `pathname` | No | URL pathname where the event originated. |
| `stack` | No | Error stack trace. |
| `timestamp` | No | Client-supplied event timestamp. |

### Limits and errors

- Maximum request body: 100 KB
- Maximum batch size: 100 logs
- Rate limiting is applied per API key
- CORS preflight requests are supported

Common responses:

| Status | Code or meaning |
| --- | --- |
| `201` | Log or batch accepted |
| `400` | Invalid JSON or log payload (`INVALID_JSON`, `INVALID_LOG`) |
| `401` | Missing or invalid Bearer API key (`INVALID_API_KEY`) |
| `413` | Request exceeds 100 KB (`PAYLOAD_TOO_LARGE`) |
| `429` | API key is rate limited (`RATE_LIMITED`) |
| `500` | Log storage or server failure |

## Self-hosting and local development

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- PostgreSQL-compatible database, such as Neon
- A Resend account for verification, password reset, and alert emails

### Install dependencies

From the repository root:

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the repository root. Do not commit this file.

#### Required

```dotenv
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` is used by Neon and Drizzle. `APP_URL` is used for server-generated links, while `NEXT_PUBLIC_APP_URL` is used by the Next.js metadata and client-visible configuration.

#### Optional authentication providers

Leave these unset to use email/password authentication only:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

#### Optional ingestion and maintenance settings

```dotenv
ALLOWED_LOG_ORIGINS=*
CRON_SECRET=change-me
NEXT_PUBLIC_LOGGED_BASE_URL=https://logged.oheo.site
```

`ALLOWED_LOG_ORIGINS` controls the CORS origin for the ingestion endpoint. Use a specific origin in production when possible.

#### Optional Firebase analytics settings

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### Database migrations

The Drizzle schema is in `db/schema.ts` and migration files are in `drizzle/`.

To generate a migration after changing the schema:

```bash
npx drizzle-kit generate
```

Apply migrations with:

```bash
npx drizzle-kit migrate
```

The Drizzle configuration loads `.env.local` automatically.

### Run the application

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful production commands:

```bash
npm run build
npm run start
npm run lint
```

## Deployment

The application is configured for Vercel. Set the environment variables in the Vercel project before deploying, especially `DATABASE_URL`, `RESEND_API_KEY`, `APP_URL`, and `CRON_SECRET`.

The repository defines these Vercel Cron jobs in `vercel.json`:

- `/api/cron/weekly-digest` every Monday at 08:00 UTC
- `/api/cron/purge-logs` every day at 03:00 UTC

The weekly digest only sends to users who enabled weekly digests and email notifications. Log purge uses each user's `logRetentionDays` preference. Cron endpoints must be protected with `CRON_SECRET`.

## Repository structure

```text
app/                  Next.js pages, layouts, and route handlers
app/api/v1/logs/      Public log ingestion endpoint
app/api/projects/     Authenticated project and log management endpoints
components/           Shared UI and dashboard components
db/schema.ts          Drizzle/PostgreSQL schema
drizzle/              Database migrations
lib/                  Authentication, database, email, logging, and app helpers
packages/sdk/         Published @oheoco/logged SDK package
public/               Static assets, icons, service worker, and browser bundle assets
vercel.json           Vercel Cron schedules
```

## SDK development

The SDK is an npm workspace under `packages/sdk`.

```bash
cd packages/sdk
npm run build
npm run typecheck
npm run dev
```

The package build produces:

- `dist/index.js` for CommonJS
- `dist/index.mjs` for ES modules
- `dist/index.d.ts` for TypeScript declarations
- `dist/logged.global.js` for browser script-tag usage

The SDK has no runtime dependencies. Its transport uses the platform `fetch` API and sends events asynchronously.

## Security notes

- Treat project API keys as credentials. Never commit them to source control.
- Prefer server-side environment variables for server applications.
- Browser applications require a client-visible key; use a key scoped to the appropriate project and environment, and do not treat it as a server secret.
- Use `ALLOWED_LOG_ORIGINS` to restrict browser ingestion origins in production.
- Avoid placing passwords, access tokens, or other sensitive secrets in log metadata.
- Error capture and ingestion are best-effort. Enable SDK `debug` mode while diagnosing transport failures.

## Project status

Logged is under active development. The hosted dashboard, authenticated project management, REST ingestion API, SDK, browser capture, email alerts, and scheduled maintenance flows are implemented. Planned work may include team collaboration, additional notification integrations, source-map support, release tracking, exports, webhooks, and richer analytics.

## License

The SDK package is released under the [MIT License](packages/sdk/LICENSE). See the [SDK package README](packages/sdk/README.md) for package-specific documentation.
# Logged

Logged is an application logging and error-monitoring platform for modern web applications. It gives each project environment-specific API keys, accepts structured logs through an HTTP API or JavaScript/TypeScript SDK, and provides an authenticated dashboard for searching and investigating application activity.

Hosted instance: [logged.oheo.site](https://logged.oheo.site)

## What Logged provides

- Project-based log organization with separate development, staging, and production keys
- Log levels: `log`, `debug`, `info`, `success`, `warn`, and `error`
- Structured metadata, stack traces, URLs, environments, and source information
- Dashboard statistics, recent activity, project summaries, and filtered log search
- Single-event and batch ingestion through `POST /api/v1/logs`
- A JavaScript/TypeScript SDK for manual logging, error capture, browser error capture, and console interception
- Email alerts for newly ingested error logs
- Optional weekly digest emails and configurable log retention cleanup
- Email/password authentication with required email verification, plus optional Google and GitHub providers

## Quick start with the hosted service

1. Create an account at [logged.oheo.site](https://logged.oheo.site).
2. Verify your email address and open the dashboard.
3. Create a project.
4. Create or regenerate an API key for the target environment under the project settings.
5. Install the SDK:

   ```bash
   npm install @oheoco/logged
   ```

6. Initialize the SDK and send a log:

   ```typescript
   import { Logged } from "@oheoco/logged";

   const logger = new Logged({
     apiKey: process.env.LOGGED_API_KEY!,
     environment: "production",
   });

   logger.info("Application started");
   ```

Open the project logs in the dashboard to inspect the event.

## SDK

The package is published as `@oheoco/logged` and includes CommonJS, ES module, TypeScript declaration, and browser-global builds.

### Installation

```bash
npm install @oheoco/logged
```

### Manual logging

```typescript
import { Logged } from "@oheoco/logged";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  environment: "production",
  debug: false,
});

logger.log("A general application event");
logger.info("User signed in", { userId: "usr_123" });
logger.success("Payment completed", { orderId: "ord_123" });
logger.warn("Rate limit is nearly exhausted", { remaining: 5 });
logger.error("Database connection failed", { host: "db.example.com" });
logger.debug("Request details", { method: "GET", pathname: "/api/users" });
```

### Capture caught errors

`capture` sends an error-level event. For an `Error`, it includes the message, stack, and error name.

```typescript
try {
  await processPayment();
} catch (error) {
  logger.capture(error, {
    orderId: "ord_123",
    operation: "checkout",
  });
}
```

### Capture tables

Tables are sent as an `info` event with the data stored in `metadata.table`.

```typescript
logger.table("Active users", [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
]);
```

### Browser automatic capture

In a browser, `auto()` listens for uncaught errors and unhandled promise rejections. It is safe to call more than once, and `stopAutoCapture()` removes the handlers.

```typescript
logger.auto();

// Later, when the application or test lifecycle ends:
logger.stopAutoCapture();
```

### Browser console interception

`interceptConsole()` forwards `console.log`, `console.info`, `console.warn`, `console.error`, and `console.table` to Logged while preserving their normal DevTools behavior.

```typescript
logger.interceptConsole();

// Restore the original console methods:
logger.stopConsoleInterception();
```

This feature is browser-only. Server-side console methods are not modified.

### Configuration

| Option | Required | Description |
| --- | --- | --- |
| `apiKey` | Yes | Project API key used for ingestion. |
| `environment` | No | Environment label such as `development`, `staging`, or `production`. |
| `debug` | No | Prints SDK transport errors to the console when enabled. |

The SDK currently sends to `https://logged.oheo.site/api/v1/logs` and does not expose a custom `baseUrl` option.

### Browser script tag

The browser bundle is available from jsDelivr:

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

The bundle exposes `window.Logged` and `window.logged`.

## REST API

### Endpoint

```text
POST https://logged.oheo.site/api/v1/logs
```

Authenticate with the project API key as a Bearer token:

```http
Authorization: Bearer YOUR_PROJECT_API_KEY
Content-Type: application/json
```

### Send one log

```bash
curl -X POST https://logged.oheo.site/api/v1/logs \
  -H "Authorization: Bearer YOUR_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Failed to connect to database",
    "source": "server",
    "environment": "production",
    "metadata": {
      "requestId": "req_123",
      "retryCount": 3
    },
    "stack": "Error: Failed to connect to database"
  }'
```

Successful single-log responses return HTTP `201`:

```json
{
  "success": true,
  "id": "log_abc123"
}
```

### Send a batch

Send up to 100 logs in one request by providing a `logs` array:

```json
{
  "logs": [
    { "level": "info", "message": "Worker started" },
    { "level": "error", "message": "Worker failed" }
  ]
}
```

The response includes accepted and rejected counts:

```json
{
  "success": true,
  "accepted": 2,
  "rejected": 0
}
```

### Request fields

| Field | Required | Description |
| --- | --- | --- |
| `level` | Yes | `log`, `debug`, `info`, `success`, `warn`, or `error`. |
| `message` | Yes | Human-readable log message. |
| `metadata` | No | JSON object containing application-specific context. |
| `environment` | No | Environment label. The API key environment is applied during normalization. |
| `source` | No | `server`, `client`, or `edge`. |
| `url` | No | Full URL where the event originated. |
| `pathname` | No | URL pathname where the event originated. |
| `stack` | No | Error stack trace. |
| `timestamp` | No | Client-supplied event timestamp. |

### Limits and errors

- Maximum request body: 100 KB
- Maximum batch size: 100 logs
- Rate limiting is applied per API key
- CORS preflight requests are supported

Common responses:

| Status | Code or meaning |
| --- | --- |
| `201` | Log or batch accepted |
| `400` | Invalid JSON or log payload (`INVALID_JSON`, `INVALID_LOG`) |
| `401` | Missing or invalid Bearer API key (`INVALID_API_KEY`) |
| `413` | Request exceeds 100 KB (`PAYLOAD_TOO_LARGE`) |
| `429` | API key is rate limited (`RATE_LIMITED`) |
| `500` | Log storage or server failure |

## Self-hosting and local development

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- PostgreSQL-compatible database, such as Neon
- A Resend account for verification, password reset, and alert emails

### Install dependencies

From the repository root:

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the repository root. Do not commit this file.

#### Required

```dotenv
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` is used by Neon and Drizzle. `APP_URL` is used for server-generated links, while `NEXT_PUBLIC_APP_URL` is used by the Next.js metadata and client-visible configuration.

#### Optional authentication providers

Leave these unset to use email/password authentication only:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

#### Optional ingestion and maintenance settings

```dotenv
ALLOWED_LOG_ORIGINS=*
CRON_SECRET=change-me
NEXT_PUBLIC_LOGGED_BASE_URL=https://logged.oheo.site
```

`ALLOWED_LOG_ORIGINS` controls the CORS origin for the ingestion endpoint. Use a specific origin in production when possible.

#### Optional Firebase analytics settings

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### Database migrations

The Drizzle schema is in `db/schema.ts` and migration files are in `drizzle/`.

To generate a migration after changing the schema:

```bash
npx drizzle-kit generate
```

Apply migrations with:

```bash
npx drizzle-kit migrate
```

The Drizzle configuration loads `.env.local` automatically.

### Run the application

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful production commands:

```bash
npm run build
npm run start
npm run lint
```

## Deployment

The application is configured for Vercel. Set the environment variables in the Vercel project before deploying, especially `DATABASE_URL`, `RESEND_API_KEY`, `APP_URL`, and `CRON_SECRET`.

The repository defines these Vercel Cron jobs in `vercel.json`:

- `/api/cron/weekly-digest` every Monday at 08:00 UTC
- `/api/cron/purge-logs` every day at 03:00 UTC

The weekly digest only sends to users who enabled weekly digests and email notifications. Log purge uses each user's `logRetentionDays` preference. Cron endpoints must be protected with `CRON_SECRET`.

## Repository structure

```text
app/                  Next.js pages, layouts, and route handlers
app/api/v1/logs/      Public log ingestion endpoint
app/api/projects/     Authenticated project and log management endpoints
components/           Shared UI and dashboard components
db/schema.ts          Drizzle/PostgreSQL schema
drizzle/              Database migrations
lib/                  Authentication, database, email, logging, and app helpers
packages/sdk/         Published @oheoco/logged SDK package
public/               Static assets, icons, service worker, and browser bundle assets
vercel.json           Vercel Cron schedules
```

## SDK development

The SDK is an npm workspace under `packages/sdk`.

```bash
cd packages/sdk
npm run build
npm run typecheck
npm run dev
```

The package build produces:

- `dist/index.js` for CommonJS
- `dist/index.mjs` for ES modules
- `dist/index.d.ts` for TypeScript declarations
- `dist/logged.global.js` for browser script-tag usage

The SDK has no runtime dependencies. Its transport uses the platform `fetch` API and sends events asynchronously.

## Security notes

- Treat project API keys as credentials. Never commit them to source control.
- Prefer server-side environment variables for server applications.
- Browser applications require a client-visible key; use a key scoped to the appropriate project and environment, and do not treat it as a server secret.
- Use `ALLOWED_LOG_ORIGINS` to restrict browser ingestion origins in production.
- Avoid placing passwords, access tokens, or other sensitive secrets in log metadata.
- Error capture and ingestion are best-effort. Enable SDK `debug` mode while diagnosing transport failures.

## Project status

Logged is under active development. The hosted dashboard, authenticated project management, REST ingestion API, SDK, browser capture, email alerts, and scheduled maintenance flows are implemented. Planned work may include team collaboration, additional notification integrations, source-map support, release tracking, exports, webhooks, and richer analytics.

## License

The SDK package is released under the MIT License. See `packages/sdk/LICENSE` for the package license text.
