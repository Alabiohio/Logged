# Phase 8 — Console Capture

Phase 7 gave Logged **automatic browser error capture**.

Phase 8 adds the ability to capture existing browser console activity:

```ts
logger.interceptConsole();
```

The goal is:

> **Developers can see their application's console activity inside Logged without manually replacing every `console.*` call.**

---

# 1. Target Experience

A developer initializes Logged:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: "...",
  environment: "production",
});

logger.interceptConsole();
```

Now:

```ts
console.log("Application started");

console.info("User authenticated");

console.warn("API response is slow");

console.error("Payment failed");
```

automatically becomes Logged events.

```text
Browser Application
       │
       ├── console.log()
       ├── console.info()
       ├── console.warn()
       └── console.error()
                │
                ▼
        @logged/sdk
                │
                ▼
        Logged API
                │
                ▼
          PostgreSQL
                │
                ▼
          Dashboard
```

---

# 2. Console Mapping

Map the browser methods to Logged levels:

| Browser           | Logged  |
| ----------------- | ------- |
| `console.log()`   | `log`   |
| `console.info()`  | `info`  |
| `console.warn()`  | `warn`  |
| `console.error()` | `error` |

Do **not** automatically treat every `console.log()` as an error.

---

# 3. Basic Implementation

The SDK needs to temporarily wrap the original console methods.

Conceptually:

```text
Original console.log
        │
        ▼
Logged wrapper
        │
        ├── Send to Logged
        │
        └── Call original console.log
```

This last part is important.

The developer's browser console should **continue working normally**.

---

# 4. Never Break the Original Console

Bad implementation:

```text
console.log()
     ↓
Logged
     ↓
Console output disappears
```

Correct implementation:

```text
console.log()
     ↓
Logged wrapper
     ├───────────────┐
     ▼               ▼
Logged API      Original console
                    ↓
                 DevTools
```

So when the developer writes:

```ts
console.warn("Slow request");
```

they should still see:

```text
Slow request
```

in DevTools while Logged also receives it.

---

# 5. Preserve Console Context

If the application does:

```ts
console.log("User:", user);
```

don't blindly convert everything into:

```text
User: [object Object]
```

Instead, the SDK should attempt to serialize arguments intelligently.

For example:

```json
{
  "level": "log",
  "message": "User:",
  "metadata": {
    "arguments": [
      {
        "id": "123",
        "name": "John"
      }
    ]
  }
}
```

This gives developers useful information in the dashboard.

---

# 6. Multiple Arguments

Support:

```ts
console.log("User", user, "logged in");
```

The SDK should preserve the arguments as much as practical.

A useful representation could be:

```json
{
  "level": "log",
  "message": "User logged in",
  "metadata": {
    "consoleArguments": [
      "User",
      {
        "id": "123"
      },
      "logged in"
    ]
  }
}
```

Don't try to perfectly reproduce Chrome's console formatting.

The goal is **debugging information**, not recreating DevTools.

---

# 7. Objects

Handle:

```ts
console.log({
  userId: "123",
  role: "admin"
});
```

without destroying the object.

Store it as structured metadata.

Example:

```json
{
  "level": "log",
  "message": "Console log",
  "metadata": {
    "consoleArguments": [
      {
        "userId": "123",
        "role": "admin"
      }
    ]
  }
}
```

---

# 8. Arrays

Support:

```ts
console.log([
  "apple",
  "banana",
  "orange"
]);
```

and preserve the array structure where possible.

---

# 9. Error Objects

Special handling should exist for:

```ts
console.error(error);
```

If the argument is an actual `Error`, extract:

```text
message
name
stack
```

instead of simply serializing it.

Example:

```json
{
  "level": "error",
  "message": "Database connection failed",
  "stack": "Error: Database connection failed..."
}
```

This works nicely with the infrastructure created in Phase 7.

---

# 10. Console Context

Automatically attach the same browser context used by Phase 7:

```text
URL
Pathname
Browser
Device
OS
User Agent
Environment
Timestamp
```

So a console error becomes much more useful.

---

# 11. `console.error()` vs `logger.capture()`

Don't create duplicate logs.

For example:

```ts
try {
  doSomething();
} catch (error) {
  console.error(error);
  logger.capture(error);
}
```

could potentially generate two error records.

Phase 8 should introduce basic duplicate protection shared with Phase 7.

```text
console.error(error)
       │
       ▼
automatic capture

logger.capture(error)
       │
       ▼
duplicate detection
       │
       ▼
avoid duplicate where appropriate
```

Keep this logic simple initially.

---

# 12. Don't Capture Everything

Console capture can become extremely noisy.

For example:

```ts
console.log("render");
console.log("render");
console.log("render");
console.log("render");
```

could generate thousands of logs.

Therefore Phase 8 needs **basic safeguards**.

---

# 13. Rate Limiting

The SDK should have a client-side limit.

For example:

```text
Maximum console events
per short time window
```

If the application starts flooding the console, Logged should avoid flooding its own API.

Example:

```text
Application
   │
   ├── 10,000 console.log()
   │
   ▼
Logged SDK
   │
   ├── capture reasonable amount
   └── suppress excessive events
```

Your server-side Phase 3 rate limiter remains the final protection.

---

# 14. Optional Configuration

Allow developers to control console capture.

For example:

```ts
const logger = new Logged({
  apiKey: "...",

  console: {
    log: true,
    info: true,
    warn: true,
    error: true,
  },
});
```

But keep the API simple for the first release.

An even cleaner MVP could simply support:

```ts
logger.interceptConsole();
```

and add configuration later if users need it.

---

# 15. Avoid Server-Side Console Interception

This feature is specifically for browser console capture.

Don't make:

```ts
logger.interceptConsole();
```

automatically replace Node.js server-side console methods.

That's a different problem and can cause serious side effects.

Phase 8 should target:

```text
Browser
```

while the core SDK remains usable on:

```text
Node.js
Next.js server
```

without changing their server console behavior.

---

# 16. Next.js Considerations

For Next.js App Router, console calls can happen on both:

```text
Server Components
Client Components
```

Phase 8 should only intercept browser-side calls.

For example:

```tsx
"use client";

import { useEffect } from "react";

export function LoggedProvider() {
  useEffect(() => {
    logger.interceptConsole();
  }, []);

  return null;
}
```

This prevents the SDK from attempting browser-specific behavior during server rendering.

---

# 17. Idempotency

Calling:

```ts
logger.interceptConsole();
```

multiple times must not create multiple wrappers.

Bad:

```text
interceptConsole()
interceptConsole()
interceptConsole()

console.error()
       ↓
3 Logged requests
```

Correct:

```text
interceptConsole()
       ↓
listener installed

interceptConsole()
       ↓
already installed → nothing

interceptConsole()
       ↓
already installed → nothing
```

---

# 18. Restore Console

Add:

```ts
logger.stopConsoleInterception();
```

This should restore the original methods.

Example:

```ts
logger.interceptConsole();

// Later
logger.stopConsoleInterception();
```

After that:

```text
console.log()
```

behaves exactly as it did before.

This is especially useful for testing.

---

# 19. Preserve `this`

When wrapping console methods, preserve the original context.

Conceptually:

```text
originalConsoleMethod.apply(console, args)
```

rather than simply calling the function independently.

This avoids strange browser-specific behavior.

---

# 20. Serialization Utility

Create a shared serializer.

Recommended:

```text
src/utils/serialize.ts
```

Responsibilities:

```text
Primitive
   ↓
return directly

Object
   ↓
serialize safely

Array
   ↓
serialize recursively

Error
   ↓
message + stack

Circular object
   ↓
safe representation

Undefined
   ↓
safe representation
```

This is important because:

```ts
const obj: any = {};
obj.self = obj;

console.log(obj);
```

shouldn't cause:

```text
JSON.stringify()
     ↓
💥 Circular structure error
```

and break the SDK.

---

# 21. Sensitive Data

This is especially important for a logging product.

A developer might accidentally do:

```ts
console.log({
  password: "...",
  token: "...",
  creditCard: "..."
});
```

Logged should eventually support sensitive-data redaction.

For **Phase 8 MVP**, at minimum design the serialization layer so redaction can be added cleanly.

Possible future configuration:

```ts
const logger = new Logged({
  apiKey: "...",

  redact: [
    "password",
    "token",
    "authorization"
  ]
});
```

Don't attempt a giant automatic PII detection system yet.

---

# 22. Dashboard Changes

The existing Phase 5/6 dashboard should now show console events naturally.

Example:

```text
Logs

TIME       LEVEL    MESSAGE

03:42:18   ERROR    Database failed
03:41:55   WARN     Slow API response
03:41:30   INFO     User logged in
03:41:12   LOG      Application started
```

Clicking the log opens the existing details drawer.

---

# 23. Log Details

For console logs, show:

```text
Level
Message
Timestamp
Environment
URL
Pathname
Browser
Device
OS
Console Arguments
```

Example:

```text
Console Arguments

[
  "User",
  {
    "id": "123",
    "role": "admin"
  },
  "logged in"
]
```

For `console.error()` with an `Error`, show the stack as well.

---

# 24. API Changes

Good news: your existing endpoint already supports the important fields.

```http
POST /api/v1/logs
```

The SDK can continue using it.

Example:

```json
{
  "level": "warn",
  "message": "Slow API response",
  "metadata": {
    "consoleArguments": [
      "Slow API response",
      {
        "duration": 2400
      }
    ]
  },
  "environment": "production",
  "url": "https://example.com/dashboard",
  "pathname": "/dashboard"
}
```

You shouldn't need a separate console API.

---

# 25. SDK Architecture After Phase 8

Your SDK becomes:

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
    │   ├── console.ts
    │   ├── context.ts
    │   ├── handlers.ts
    │   └── normalize-error.ts
    │
    └── utils/
        ├── fingerprint.ts
        ├── serialize.ts
        └── environment.ts
```

---

# 26. Shared Capture Architecture

At this point, avoid having three completely separate logging pipelines.

Use:

```text
                  ┌───────────────┐
                  │ Logger Core   │
                  └───────┬───────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Manual logs   Auto errors   Console
             │            │            │
             └────────────┼────────────┘
                          ▼
                  Normalize payload
                          │
                          ▼
                     Transport
                          │
                          ▼
                    Logged API
```

This will make the SDK much easier to maintain.

---

# 27. Testing

### Basic

* [ ] `console.log()`
* [ ] `console.info()`
* [ ] `console.warn()`
* [ ] `console.error()`

### Arguments

* [ ] Strings
* [ ] Numbers
* [ ] Booleans
* [ ] Objects
* [ ] Arrays
* [ ] Multiple arguments
* [ ] `Error` objects
* [ ] Circular objects

### Console behavior

* [ ] Original console still works
* [ ] `console.log()` still appears in DevTools
* [ ] Existing console wrappers aren't broken
* [ ] Multiple `interceptConsole()` calls don't duplicate events
* [ ] `stopConsoleInterception()` restores original methods

### Safety

* [ ] API failure doesn't break console
* [ ] Serialization failure doesn't break console
* [ ] Excessive console output doesn't flood API
* [ ] Sensitive data architecture is ready for redaction

### Next.js

* [ ] Browser capture works
* [ ] Server rendering unaffected
* [ ] Production build works

---

# 28. Test Application

Expand your existing SDK test application.

Create:

```text
/sdk-test/console
```

with:

```text
[ console.log ]

[ console.info ]

[ console.warn ]

[ console.error ]

[ Multiple Arguments ]

[ Object ]

[ Error ]
```

Example:

```ts
console.log("Hello Logged");

console.info("User authenticated");

console.warn("Slow request");

console.error("Payment failed");

console.log("User:", {
  id: "123",
  role: "admin",
});
```

Then verify everything appears in Logged.

---

# 29. Development Order

### Step 1 — Serializer

* [ ] Primitive serialization
* [ ] Object serialization
* [ ] Array serialization
* [ ] Error serialization
* [ ] Circular-reference protection

### Step 2 — Console Wrapper

* [ ] `console.log`
* [ ] `console.info`
* [ ] `console.warn`
* [ ] `console.error`

### Step 3 — Integration

* [ ] Connect to logger core
* [ ] Add browser context
* [ ] Send through existing transport

### Step 4 — Safety

* [ ] Preserve original console
* [ ] Idempotent initialization
* [ ] Restore functionality
* [ ] Client-side rate protection
* [ ] API failure protection

### Step 5 — Dashboard

* [ ] Display console logs
* [ ] Display console arguments
* [ ] Display stack for errors

### Step 6 — Testing

* [ ] Browser tests
* [ ] Next.js tests
* [ ] Production build
* [ ] Real API integration

---

# 30. Phase 8 Definition of Done

Phase 8 is complete when a developer can do:

```ts
const logger = new Logged({
  apiKey: "...",
  environment: "production",
});

logger.interceptConsole();
```

Then their existing application code:

```ts
console.log("Application started");

console.info("User authenticated");

console.warn("Slow API response");

console.error("Payment failed");
```

automatically appears in Logged.

The original console must **still work**:

```text
console.log()
      │
      ├──────────────► Browser DevTools
      │
      └──────────────► Logged
```

And the complete Logged pipeline is now:

```text
                    @logged/sdk
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Manual logs      Auto errors       Console
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                   Logged API
                         │
                         ▼
                   PostgreSQL
                         │
                         ▼
                ┌─────────────────┐
                │ Logged Dashboard │
                │                 │
                │ Search          │
                │ Filter          │
                │ Inspect         │
                └─────────────────┘
```

At this point, **Phases 1–8 deliver the complete core logging product**. Phase 9 should then focus on **Documentation**, making this functionality easy for another developer to actually adopt.
