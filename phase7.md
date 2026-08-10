# Phase 7 — Browser Auto Capture

Phase 7 builds on `@logged/sdk` and adds **automatic browser error detection**.

The goal is:

> **A developer shouldn't have to manually catch every browser error. Logged should automatically capture important runtime failures.**

The developer experience becomes:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.NEXT_PUBLIC_LOGGED_API_KEY!,
});

logger.auto();
```

After that, Logged automatically captures:

```text
Browser application
       │
       ├── Uncaught error
       │
       ├── Unhandled Promise rejection
       │
       └── Runtime failure
              │
              ▼
        @logged/sdk
              │
              ▼
       POST /api/v1/logs
              │
              ▼
       Logged Dashboard
```

---

# 1. Scope

Phase 7 should implement:

* [ ] `logger.auto()`
* [ ] `window.onerror`
* [ ] `unhandledrejection`
* [ ] Error normalization
* [ ] Browser context collection
* [ ] Current URL collection
* [ ] Browser information
* [ ] Device information
* [ ] OS information
* [ ] Stack extraction
* [ ] Duplicate protection
* [ ] Safe SDK behavior

Do **not** implement console interception yet.

That's Phase 8.

---

# 2. `logger.auto()`

The API should be extremely simple:

```ts
logger.auto();
```

Once called, the SDK registers its browser listeners.

Example:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: "...",
});

logger.auto();
```

That's it.

---

# 3. Browser Detection

Because `window` doesn't exist in Node.js/server environments, the SDK must detect whether it's running in a browser.

Conceptually:

```ts
if (typeof window !== "undefined") {
  // browser
}
```

This is especially important for Next.js.

You don't want this:

```text
Next.js server
      ↓
import @logged/sdk
      ↓
window.onerror
      ↓
💥 ReferenceError
```

Instead:

```text
Next.js server
      ↓
SDK imported
      ↓
Browser APIs unavailable
      ↓
No browser listeners registered
```

---

# 4. `window.onerror`

Register:

```ts
window.onerror = ...
```

This captures uncaught JavaScript errors.

For example, if the application encounters:

```ts
throw new Error("Something broke");
```

Logged should receive something similar to:

```json
{
  "level": "error",
  "message": "Something broke",
  "stack": "Error: Something broke\n...",
  "url": "https://example.com/dashboard",
  "pathname": "/dashboard",
  "environment": "production"
}
```

---

# 5. Use `addEventListener`

Prefer event listeners instead of replacing existing handlers.

Use:

```ts
window.addEventListener("error", handler);
```

rather than:

```ts
window.onerror = handler;
```

This is safer because another library or framework may already have an error listener.

Logged should coexist with the application.

---

# 6. Unhandled Promise Rejections

Capture:

```ts
window.addEventListener(
  "unhandledrejection",
  handler
);
```

For example:

```ts
Promise.reject(new Error("Request failed"));
```

should produce an error log.

The SDK should handle different rejection values.

Possible cases:

```ts
Promise.reject(new Error("Failed"));
```

or:

```ts
Promise.reject("Something failed");
```

or:

```ts
Promise.reject({
  reason: "Something failed",
});
```

Don't assume the rejection is always an `Error`.

---

# 7. Error Normalization

Create a utility:

```text
src/utils/normalize-error.ts
```

Its job is to convert different browser error shapes into a consistent format.

For example:

```ts
interface NormalizedError {
  message: string;
  stack?: string;
  name?: string;
}
```

### Error

```ts
new Error("Database failed")
```

becomes:

```json
{
  "message": "Database failed",
  "stack": "...",
  "name": "Error"
}
```

### String

```ts
"Something failed"
```

becomes:

```json
{
  "message": "Something failed"
}
```

---

# 8. Browser Context

This is one of the most valuable parts of Phase 7.

When an automatic error occurs, collect context.

### URL

```ts
window.location.href
```

### Pathname

```ts
window.location.pathname
```

### Browser

Extract from:

```ts
navigator.userAgent
```

### OS

Extract the operating system where reasonably possible.

### Device

Determine whether it's broadly:

```text
Desktop
Tablet
Mobile
```

Don't try to build an enormous device-detection system yet.

---

# 9. User Agent

Store:

```text
userAgent
```

in the log.

Example:

```text
Mozilla/5.0 (...)
```

Your Phase 3 schema already has:

```text
browser
device
os
userAgent
```

So Phase 7 should populate these automatically.

---

# 10. Environment

The SDK configuration should continue to control the environment:

```ts
const logger = new Logged({
  apiKey: "...",
  environment: "production",
});
```

Automatically captured errors should become:

```json
{
  "environment": "production"
}
```

The developer shouldn't need to configure this for every error.

---

# 11. Automatic Log Payload

An automatically captured browser error should eventually resemble:

```json
{
  "level": "error",
  "message": "Cannot read properties of undefined",
  "stack": "TypeError: Cannot read properties...",
  "environment": "production",
  "url": "https://example.com/dashboard",
  "pathname": "/dashboard",
  "browser": "Chrome",
  "device": "Desktop",
  "os": "Windows",
  "userAgent": "Mozilla/5.0..."
}
```

This is where Logged starts becoming genuinely useful for debugging.

---

# 12. Don't Duplicate `logger.capture()`

Internally, `auto()` should reuse your existing capture infrastructure.

Architecture:

```text
window error
     │
     ▼
normalizeError()
     │
     ▼
logger.capture()
     │
     ▼
transport.send()
     │
     ▼
Logged API
```

Don't create a completely separate HTTP implementation for automatic errors.

---

# 13. Prevent Duplicate Errors

Browsers/frameworks can sometimes surface the same error through multiple mechanisms.

You don't want:

```text
Same error
   ↓
window error
   ↓
logger.capture()
   ↓
Duplicate log
```

Build basic duplicate protection.

For example, generate a lightweight fingerprint from:

```text
message
stack
pathname
```

Then prevent the exact same error from being submitted repeatedly within a short period.

Keep this simple for MVP.

---

# 14. Rate Protection

Your Phase 3 API already has rate limiting.

But the SDK should also avoid flooding the API.

Imagine a broken application causing:

```text
10,000 errors
     ↓
10,000 HTTP requests
```

That's undesirable.

Implement a small client-side safeguard.

For example:

```text
Same error
↓
Repeated 100 times
↓
Capture only limited occurrences
```

Don't build a sophisticated queue system yet.

---

# 15. SDK Must Never Break the App

This is critical.

If Logged itself fails:

```text
Logged API unavailable
```

the user's application should continue working.

Never allow:

```text
Logging failure
     ↓
Application failure
```

Instead:

```text
Logging failure
     ↓
Silently handled
     ↓
Application continues
```

In development, optional debug logging can expose the problem.

---

# 16. Existing Error Handlers

Don't interfere with the developer's existing listeners.

For example:

```ts
window.addEventListener("error", myHandler);
```

Then:

```ts
logger.auto();
```

Logged should add another listener rather than replacing theirs.

Same for:

```ts
unhandledrejection
```

---

# 17. Initialization Safety

Calling:

```ts
logger.auto();
```

twice shouldn't register duplicate listeners.

Bad:

```ts
logger.auto();
logger.auto();
logger.auto();
```

resulting in:

```text
3 listeners
3 API requests
```

Instead, make it idempotent:

```text
logger.auto()
   ↓
listeners registered

logger.auto()
   ↓
already registered → do nothing
```

---

# 18. Optional Disable

It can be useful to allow:

```ts
logger.stopAutoCapture();
```

This isn't explicitly required by your roadmap, but it's a small and useful addition.

For example:

```ts
logger.auto();

// later
logger.stopAutoCapture();
```

This should cleanly remove the event listeners.

---

# 19. Next.js Integration

Document the correct way to initialize browser capture.

For Next.js App Router, you'll likely create a small client component:

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
  }, []);

  return null;
}
```

Then include it in your application layout.

The exact integration should be tested against your current Next.js setup.

---

# 20. API Key Consideration

This is important for browser SDKs.

A browser application cannot keep a secret API key.

Therefore:

```text
NEXT_PUBLIC_LOGGED_API_KEY
```

is inherently exposed to the browser.

That's okay **only if your Phase 3 API is designed for browser-side ingestion and the key is scoped appropriately**.

Don't put a server-only secret key into browser code.

For the MVP, clearly distinguish:

```text
Server API key
Browser/public ingestion key
```

if your architecture requires that separation.

This is something I'd address before shipping the browser SDK publicly.

---

# 21. Files

Extend the SDK:

```text
packages/sdk/
└── src/
    ├── index.ts
    ├── client.ts
    ├── logger.ts
    ├── transport.ts
    ├── types.ts
    ├── errors.ts
    │
    ├── browser/
    │   ├── auto.ts
    │   ├── context.ts
    │   ├── handlers.ts
    │   └── normalize-error.ts
    │
    └── utils/
        ├── fingerprint.ts
        └── environment.ts
```

Keep browser-specific functionality isolated.

---

# 22. Testing

Test manually and automatically.

### `window.error`

* [ ] Uncaught Error captured
* [ ] Message captured
* [ ] Stack captured
* [ ] URL captured
* [ ] Browser captured
* [ ] OS captured
* [ ] Device captured

### Promise rejection

* [ ] `Error` rejection
* [ ] String rejection
* [ ] Object rejection
* [ ] Stack extraction when available

### SDK behavior

* [ ] `logger.auto()` works
* [ ] Calling it twice doesn't duplicate listeners
* [ ] `stopAutoCapture()` works
* [ ] API failures don't crash the app
* [ ] Existing application handlers continue working

### Next.js

* [ ] Client component works
* [ ] Server rendering doesn't crash
* [ ] Production build succeeds

---

# 23. Test Application

Create a browser test page with deliberate errors.

For example:

```text
/sdk-test
```

Test:

```text
[Throw Error]

[Reject Promise]

[Normal Log]

[Capture Error]
```

Click:

```text
Throw Error
```

Then verify:

```text
Browser
   ↓
@logged/sdk
   ↓
POST /api/v1/logs
   ↓
Database
   ↓
Dashboard
```

---

# 24. Dashboard Verification

Open:

```text
/projects/[id]/logs
```

You should see:

```text
ERROR
Cannot read properties of undefined
```

Open the details drawer:

```text
Message
Stack
URL
Pathname
Browser
Device
OS
Environment
Timestamp
```

This validates the entire pipeline.

---

# 25. Development Order

### Step 1 — Browser Utilities

* [ ] Browser detection
* [ ] URL extraction
* [ ] User agent
* [ ] Browser detection
* [ ] Device detection
* [ ] OS detection

### Step 2 — Error Normalization

* [ ] Error normalization
* [ ] String handling
* [ ] Unknown values
* [ ] Stack extraction

### Step 3 — `window` Errors

* [ ] Error listener
* [ ] Capture integration
* [ ] Context attachment

### Step 4 — Promise Rejections

* [ ] `unhandledrejection`
* [ ] Normalize rejection
* [ ] Capture integration

### Step 5 — Safety

* [ ] Duplicate prevention
* [ ] Rate protection
* [ ] Idempotent initialization
* [ ] Listener cleanup
* [ ] API failure handling

### Step 6 — Next.js

* [ ] Client component
* [ ] Provider integration
* [ ] Production build test

### Step 7 — Documentation

Document:

```ts
logger.auto();
```

and explain what it captures.

---

# 26. Phase 7 Definition of Done

Phase 7 is complete when a developer can install Logged:

```bash
npm install @logged/sdk
```

initialize it:

```ts
const logger = new Logged({
  apiKey: "...",
  environment: "production",
});
```

and enable automatic capture:

```ts
logger.auto();
```

Then, without manually writing:

```ts
logger.error(...)
```

Logged automatically captures:

```text
┌───────────────────────────────┐
│ Browser Error                 │
├───────────────────────────────┤
│ Message                       │
│ Stack                         │
│ URL                           │
│ Pathname                      │
│ Browser                       │
│ Device                        │
│ OS                            │
│ User Agent                    │
│ Environment                   │
│ Timestamp                     │
└───────────────────────────────┘
```

and sends it to:

```text
Browser
   ↓
@logged/sdk
   ↓
POST /api/v1/logs
   ↓
Logged
   ↓
Neon PostgreSQL
   ↓
Dashboard
```

### What Phase 7 does NOT include

Keep these for later phases:

```text
❌ console.log interception → Phase 8
❌ Source maps
❌ AI error analysis
❌ Error grouping
❌ Release tracking
❌ Alerts
❌ Performance monitoring
```

The next step is **Phase 8 — Console Capture**, where `logger.interceptConsole()` will turn `console.log`, `console.info`, `console.warn`, and `console.error` into Logged events.
