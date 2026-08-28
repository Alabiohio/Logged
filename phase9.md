# Phase 9 — Documentation

Phase 9 is about making **Logged usable by someone who didn't build it**.

The goal is:

> **A developer should be able to discover Logged, create a project, install the SDK, send their first log, and understand the REST API without needing your help.**

At this stage, the product itself is largely functional. Documentation becomes the bridge between **"Logged works"** and **"developers can actually use Logged."**

---

# 1. Documentation Structure

Create:

```text
/docs
```

Recommended pages:

```text
/docs
├── page.tsx
│
├── installation
│   └── page.tsx
│
├── quick-start
│   └── page.tsx
│
├── sdk
│   ├── page.tsx
│   ├── logger-log
│   ├── logger-info
│   ├── logger-success
│   ├── logger-warn
│   ├── logger-error
│   ├── logger-debug
│   ├── capture
│   ├── auto
│   └── console
│
├── rest-api
│   ├── page.tsx
│   └── logs
│
└── examples
    ├── nextjs
    ├── react
    └── javascript
```

Don't make the documentation enormous.

The MVP only needs to answer the questions developers actually have.

---

# 2. Documentation Homepage

### Route

```text
/docs
```

Hero:

```text
Build with Logged

Monitor and debug your applications
with simple, structured logging.

[Quick Start] [API Reference]
```

Then:

```text
Documentation

Getting Started
├── Installation
└── Quick Start

SDK
├── Logger
├── Capture Errors
├── Browser Auto Capture
└── Console Capture

REST API
└── Logs

Examples
├── Next.js
├── React
└── JavaScript
```

---

# 3. Installation

### Route

```text
/docs/installation
```

Show:

```bash
npm install @logged/sdk
```

Then:

```ts
import { Logged } from "@logged/sdk";
```

Explain:

* What the SDK is
* Where to get the API key
* Where the API key should be stored
* Basic initialization

---

# 4. Quick Start

This is the **most important documentation page**.

### Route

```text
/docs/quick-start
```

The user should be able to complete the entire process in a few minutes.

---

## Step 1 — Create a Project

```text
Dashboard
   ↓
Create Project
   ↓
My Application
   ↓
Create
```

Explain that each project receives an API key.

---

## Step 2 — Install SDK

```bash
npm install @logged/sdk
```

---

## Step 3 — Initialize

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});
```

---

## Step 4 — Send a Log

```ts
logger.info("Application started");
```

---

## Step 5 — Open Dashboard

```text
Application
     ↓
Logged API
     ↓
Dashboard
```

Tell the developer where to find the log.

---

# 5. SDK Documentation

### Route

```text
/docs/sdk
```

Introduce the SDK.

```text
@logged/sdk
```

Explain:

* Initialization
* Configuration
* Log levels
* Error capture
* Browser capture
* Console interception

---

# 6. Configuration

Document:

```ts
const logger = new Logged({
  apiKey: "...",
  baseUrl: "https://localhost:3000",
});
```

Explain each property:

| Property      | Required | Description             |
| ------------- | -------- | ----------------------- |
| `apiKey`      | Yes      | Project API key         |
| `environment` | No       | Application environment |
| `baseUrl`     | No       | Logged API URL          |

If you add `debug`, document it too.

---

# 7. Logger Methods

Document each method.

### `logger.log()`

```ts
logger.log("Application started");
```

### `logger.info()`

```ts
logger.info("User logged in");
```

### `logger.success()`

```ts
logger.success("Payment completed");
```

### `logger.warn()`

```ts
logger.warn("API response is slow");
```

### `logger.error()`

```ts
logger.error("Database connection failed");
```

### `logger.debug()`

```ts
logger.debug("Request details", {
  method: "GET",
  pathname: "/api/users",
});
```

---

# 8. Metadata

Explain structured metadata clearly.

Example:

```ts
logger.info("User logged in", {
  userId: "123",
  role: "admin",
});
```

Dashboard:

```text
Message
User logged in

Metadata

userId: 123
role: admin
```

Explain that metadata is intended for additional debugging context.

---

# 9. Error Capture

### Route

```text
/docs/sdk/capture
```

Document:

```ts
try {
  await processPayment();
} catch (error) {
  logger.capture(error);
}
```

Explain that Logged extracts:

```text
message
stack
name
```

You can also show:

```ts
logger.capture(error, {
  orderId: "ORD-123",
});
```

---

# 10. Browser Auto Capture

### Route

```text
/docs/sdk/auto
```

Document:

```ts
logger.auto();
```

Explain that this captures:

```text
Uncaught browser errors
Unhandled Promise rejections
```

Example:

```ts
logger.auto();
```

Then:

```ts
throw new Error("Something went wrong");
```

Logged automatically receives the error.

---

# 11. Console Capture

### Route

```text
/docs/sdk/console
```

Document:

```ts
logger.interceptConsole();
```

Explain:

```text
console.log    → log
console.info   → info
console.warn   → warn
console.error  → error
```

Also explain that Logged preserves the normal browser console behavior.

---

# 12. Next.js Guide

Because you're building Logged with Next.js and your first likely users will use modern JavaScript frameworks, give Next.js its own example.

### Route

```text
/docs/examples/nextjs
```

Example:

```tsx
"use client";

import { useEffect } from "react";
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.NEXT_PUBLIC_LOGGED_API_KEY!,
});

export function LoggedProvider() {
  useEffect(() => {
    logger.auto();
    logger.interceptConsole();
  }, []);

  return null;
}
```

Then:

```tsx
<LoggedProvider />
```

Explain why this runs on the client.

---

# 13. React Guide

### Route

```text
/docs/examples/react
```

Show basic React integration:

```tsx
const logger = new Logged({
  apiKey: import.meta.env.VITE_LOGGED_API_KEY,
});
```

Then:

```ts
logger.info("Application loaded");
```

And:

```ts
logger.auto();
```

---

# 14. Vanilla JavaScript

### Route

```text
/docs/examples/javascript
```

Example:

```html
<script type="module">
  import { Logged } from "@logged/sdk";

  const logger = new Logged({
    apiKey: "YOUR_API_KEY",
  });

  logger.auto();

  logger.info("Application started");
</script>
```

---

# 15. REST API Documentation

### Route

```text
/docs/rest-api
```

Explain:

```http
POST /api/v1/logs
```

Authentication:

```http
Authorization: Bearer API_KEY
```

Content type:

```http
Content-Type: application/json
```

---

# 16. Log Request

Document the request:

```json
{
  "level": "error",
  "message": "Database timeout",
  "metadata": {
    "query": "users"
  },
  "environment": "production"
}
```

Explain each property:

| Field         | Required | Description             |
| ------------- | -------- | ----------------------- |
| `level`       | Yes      | Log severity            |
| `message`     | Yes      | Log message             |
| `metadata`    | No       | Additional data         |
| `environment` | No       | Application environment |

Document the other optional context fields your Phase 3 API accepts as well.

---

# 17. cURL Example

Developers should be able to test Logged without installing the SDK.

Example:

```bash
curl -X POST https://localhost:3000/api/v1/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Database timeout",
    "environment": "production"
  }'
```

This is particularly useful for debugging API-key and ingestion problems.

---

# 18. API Response

Document the successful response.

For example:

```json
{
  "success": true,
  "id": "log_123"
}
```

Then document common errors:

```text
401 Unauthorized
400 Bad Request
404 Not Found
429 Too Many Requests
500 Internal Server Error
```

Explain what developers should do for each.

---

# 19. API Key Documentation

Explain where developers get their key:

```text
Dashboard
 → Project
 → Settings
 → API Key
```

Explain that API keys should be handled carefully.

For server applications:

```text
LOGGED_API_KEY
```

For browser applications, clearly explain the security model you're using.

This is especially important because a browser-side key cannot be treated like a secret server credential.

---

# 20. Documentation Navigation

Create a persistent documentation sidebar:

```text
┌──────────────────────────┐
│ Logged Docs              │
│                          │
│ GETTING STARTED          │
│  Installation            │
│  Quick Start             │
│                          │
│ SDK                      │
│  Logger                  │
│  Capture Errors          │
│  Auto Capture            │
│  Console Capture         │
│                          │
│ REST API                 │
│  Overview                │
│  Logs                    │
│                          │
│ EXAMPLES                 │
│  Next.js                 │
│  React                   │
│  JavaScript              │
└──────────────────────────┘
```

---

# 21. Code Blocks

Developer documentation lives or dies by its code examples.

Code blocks should have:

* Syntax highlighting
* Copy button
* Language label
* Good spacing
* Horizontal scrolling on mobile

Example:

```text
TypeScript                     [Copy]

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
});
```

---

# 22. "Copy" Buttons

Every important command should be copyable:

```text
npm install @logged/sdk
```

and:

```ts
logger.info("Application started");
```

A developer shouldn't have to manually select code.

---

# 23. Documentation Search

For the MVP, documentation search isn't essential.

Don't build a sophisticated search engine yet.

You can add it later if the documentation grows.

For now, the sidebar and clear page structure are enough.

---

# 24. Documentation Design

Use the same Logged visual identity:

```text
Emerald
Glass
Soft neutrals
Clean typography
Subtle borders
Minimal shadows
```

But documentation should be **more functional than decorative**.

Don't make developers scroll through giant glass cards just to find:

```bash
npm install @logged/sdk
```

Prioritize readability.

---

# 25. Documentation Components

Recommended:

```text
components/
└── docs/
    ├── docs-sidebar.tsx
    ├── docs-header.tsx
    ├── code-block.tsx
    ├── copy-button.tsx
    ├── callout.tsx
    ├── api-endpoint.tsx
    ├── parameter-table.tsx
    └── docs-navigation.tsx
```

---

# 26. Callouts

Create reusable informational blocks.

Example:

```text
┌────────────────────────────────────────────┐
│ 💡 Tip                                      │
│                                             │
│ Use environment variables for your API key │
│ instead of hardcoding credentials.         │
└────────────────────────────────────────────┘
```

Also:

```text
┌────────────────────────────────────────────┐
│ ⚠ Warning                                  │
│                                             │
│ Browser-exposed API keys should not be     │
│ treated as secret credentials.             │
└────────────────────────────────────────────┘
```

---

# 27. Documentation Version

For the MVP, don't build a complicated versioning system.

But structure the documentation so you can eventually support:

```text
/docs/v1
```

or:

```text
Version 1
```

Once the SDK/API becomes public, versioning will become important.

---

# 28. README

The SDK itself needs a strong README.

At minimum:

```text
@logged/sdk

Simple logging for JavaScript applications.

Installation

npm install @logged/sdk

Quick Start

...

Documentation

...

License
```

The README should get someone from:

```text
"I found Logged"
```

to:

```text
"I sent my first log"
```

as quickly as possible.

---

# 29. Documentation Checklist

### Getting Started

* [ ] Installation
* [ ] Quick Start
* [ ] Create Project
* [ ] API Key

### SDK

* [ ] Initialization
* [ ] Configuration
* [ ] `log()`
* [ ] `info()`
* [ ] `success()`
* [ ] `warn()`
* [ ] `error()`
* [ ] `debug()`
* [ ] `capture()`
* [ ] `auto()`
* [ ] `interceptConsole()`

### REST API

* [ ] Authentication
* [ ] `POST /api/v1/logs`
* [ ] Request body
* [ ] Response
* [ ] Errors
* [ ] Rate limits

### Examples

* [ ] Next.js
* [ ] React
* [ ] Vanilla JavaScript

### SDK Package

* [ ] README
* [ ] Installation
* [ ] Usage
* [ ] API reference

---

# 30. Development Order

### Step 1 — Documentation System

* [ ] `/docs` layout
* [ ] Sidebar
* [ ] Header
* [ ] Navigation
* [ ] Mobile navigation

### Step 2 — Getting Started

* [ ] Installation
* [ ] Quick Start
* [ ] API Key guide

### Step 3 — SDK

* [ ] Logger documentation
* [ ] Metadata
* [ ] Error capture
* [ ] Auto capture
* [ ] Console capture

### Step 4 — REST API

* [ ] API overview
* [ ] Authentication
* [ ] Log endpoint
* [ ] Request examples
* [ ] Response examples
* [ ] Error responses

### Step 5 — Examples

* [ ] Next.js
* [ ] React
* [ ] JavaScript

### Step 6 — Polish

* [ ] Copy buttons
* [ ] Syntax highlighting
* [ ] Responsive design
* [ ] Previous/next navigation
* [ ] Code examples tested against the actual SDK

---

# 31. Most Important Rule

**Every code example in the documentation should actually work.**

Don't write:

```ts
logger.whatever();
```

just because it looks good in the docs.

The examples should be tested against the actual:

```text
@logged/sdk
       ↓
Logged API
       ↓
Neon
```

Otherwise documentation becomes a source of support problems.

---

# 32. Phase 9 Definition of Done

Phase 9 is complete when a developer who knows nothing about Logged can:

```text
Discover Logged
      ↓
Open Documentation
      ↓
Understand what Logged does
      ↓
Create a Project
      ↓
Get an API key
      ↓
Install @logged/sdk
      ↓
Initialize SDK
      ↓
Send first log
      ↓
Enable auto capture
      ↓
Enable console capture
      ↓
See the log in Dashboard
```

without needing to ask you how to do it.

---

# MVP Completion

At the end of Phase 9, your original promise should be fully delivered:

> **"Receive logs from your applications and debug them from one dashboard."**

The complete system is now:

```text
                         LOGGED
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
   Manual Logs        Auto Browser Errors   Console Capture
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                       @logged/sdk
                            │
                            ▼
                     POST /api/v1/logs
                            │
                            ▼
                    Validation + Auth
                            │
                            ▼
                       PostgreSQL
                            │
                            ▼
                    Logged Dashboard
                       │         │
                       ▼         ▼
                    Search    Inspect
                       │         │
                       └────┬────┘
                            ▼
                     Debug Application
```

### After Phase 9

**Do not immediately start adding every feature on the nice-to-have list.**

First, test the complete product end-to-end with real applications.

Then your next priority should be based on what users actually struggle with—likely things such as **error grouping, source maps, better SDK reliability, or alerts**, rather than automatically adding analytics/AI/billing.
