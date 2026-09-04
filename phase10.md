Yes. At this point, you should treat **Logged as a real npm package**, not just a local SDK.

Your goal is:

```bash
npm install @logged/sdk
```

and a developer can immediately use it.

## Phase 10 — Public npm Release

### 1. Decide the package name

I'd recommend:

```text
@logged/sdk
```

So installation becomes:

```bash
npm install @logged/sdk
```

Before building around it, check that the package name is available on npm.

---

## 2. Package structure

Your repository should roughly become:

```text
logged/
├── apps/
│   └── web/
│       └── ...          # Logged dashboard
│
├── packages/
│   └── sdk/
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── logger.ts
│       │   ├── transport.ts
│       │   ├── types.ts
│       │   ├── errors.ts
│       │   ├── browser/
│       │   │   ├── auto.ts
│       │   │   ├── console.ts
│       │   │   ├── context.ts
│       │   │   └── normalize-error.ts
│       │   └── utils/
│       │       ├── serialize.ts
│       │       └── fingerprint.ts
│       │
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       └── LICENSE
│
├── package.json
└── ...
```

I'd keep the **dashboard and SDK separate packages** even if they're in the same repository.

---

# 3. Create the SDK `package.json`

Something along these lines:

```json
{
  "name": "@logged/sdk",
  "version": "0.1.0",
  "description": "Simple application logging and error monitoring SDK",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "logging",
    "logger",
    "error-monitoring",
    "javascript",
    "typescript",
    "nextjs"
  ]
}
```

The exact build configuration can change depending on how you've currently structured the SDK.

---

# 4. Your public API

Make sure `src/index.ts` exposes what users actually need.

For example:

```ts
export { Logged } from "./client";

export type {
  LoggedOptions,
  LogLevel,
  LogMetadata
} from "./types";
```

Then developers can simply do:

```ts
import { Logged } from "@logged/sdk";
```

Not:

```ts
import { Logged } from "@logged/sdk/dist/client";
```

The latter is something you want to prevent.

---

# 5. Test the package locally

Before publishing, don't immediately publish it.

Build:

```bash
npm run build
```

Then inspect:

```text
packages/sdk/
└── dist/
    ├── index.js
    └── index.d.ts
```

You want the package to contain only what consumers need.

---

# 6. Test the actual npm package

A very useful step is:

```bash
npm pack
```

This creates something like:

```text
logged-sdk-0.1.0.tgz
```

Create a separate test application:

```bash
mkdir logged-test
cd logged-test
npm init -y
```

Then:

```bash
npm install ../path/to/logged-sdk-0.1.0.tgz
```

Now test:

```ts
import { Logged } from "@logged/sdk";
```

and:

```ts
const logger = new Logged({
  apiKey: "...",
  environment: "development"
});

logger.info("Hello from Logged");
```

Also test:

```ts
logger.auto();
logger.interceptConsole();
```

This is important because **something can work inside your monorepo but fail once packaged**.

---

# 7. Test Next.js

Create a completely separate Next.js test application.

```bash
npx create-next-app@latest logged-test
```

Install the local package:

```bash
npm install ../logged-sdk-0.1.0.tgz
```

Then test:

```ts
import { Logged } from "@logged/sdk";
```

Verify:

* [ ] Import works
* [ ] TypeScript types work
* [ ] SDK initializes
* [ ] `logger.info()` works
* [ ] `logger.error()` works
* [ ] `logger.capture()` works
* [ ] `logger.auto()` works
* [ ] `logger.interceptConsole()` works
* [ ] Next.js production build works

---

# 8. Environment Variables

For a browser SDK, you need to be careful here.

A developer might use:

```env
NEXT_PUBLIC_LOGGED_API_KEY=...
```

because the browser needs access to it.

That means the key is **publicly exposed**.

Therefore, before publishing, make sure your API-key architecture is intentional.

You don't want developers accidentally exposing a credential that gives someone permission to:

```text
read logs
delete logs
modify projects
```

The browser credential should only have the permissions required to **submit logs**.

---

# 9. Production API URL

Don't make developers configure your API URL unless necessary.

The SDK should have a sensible default:

```ts
const logger = new Logged({
  apiKey: "..."
});
```

Internally:

```text
DEFAULT_API_URL
        ↓
https://your-logged-domain/api/v1
```

Then optionally allow:

```ts
const logger = new Logged({
  apiKey: "...",
  baseUrl: "..."
});
```

This is useful for development/self-hosting later.

---

# 10. Publish to npm

You'll need an npm account.

Log in:

```bash
npm login
```

Check:

```bash
npm whoami
```

Then from the SDK package:

```bash
npm publish --access public
```

For a scoped public package such as:

```text
@logged/sdk
```

`--access public` is important for the initial public publication.

---

# 11. Versioning

Start with:

```text
0.1.0
```

because Logged is still an early product.

Then:

```text
0.1.1
0.1.2
0.2.0
...
1.0.0
```

A simple rule:

### Patch

Bug fix:

```text
0.1.0 → 0.1.1
```

### Minor

New backwards-compatible functionality:

```text
0.1.0 → 0.2.0
```

### Major

Breaking API change:

```text
0.9.0 → 1.0.0
```

---

# 12. README

Your npm page should immediately show something like:

```text
@logged/sdk

Simple logging and error monitoring for JavaScript applications.

Installation

npm install @logged/sdk

Quick Start

import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: "YOUR_API_KEY",
  environment: "production"
});

logger.info("Application started");

logger.error("Something went wrong");

logger.auto();

logger.interceptConsole();
```

Then:

```text
Documentation
Getting Started
API Reference
Next.js
React
REST API
```

Your README is effectively the **landing page for the npm package**.

---

# 13. GitHub Release

I'd also create a GitHub repository structure like:

```text
Logged
│
├── apps
│   └── dashboard
│
├── packages
│   └── sdk
│
├── README.md
├── LICENSE
└── package.json
```

Then create a release:

```text
v0.1.0
```

with:

```text
Initial public release of @logged/sdk.

Features:
- Structured logging
- Error capture
- Browser auto capture
- Console interception
- Browser context
- TypeScript support
```

---

# 14. Important: Don't Publish Until These Work

Before you run `npm publish`, verify this exact flow:

```text
                    Logged
                      │
                      ▼
              npm install @logged/sdk
                      │
                      ▼
                Developer App
                      │
              ┌───────┴────────┐
              ▼                ▼
        logger.info()     logger.auto()
              │                │
              └───────┬────────┘
                      ▼
                Logged API
                      │
                      ▼
                   Neon
                      │
                      ▼
                 Dashboard
```

If that works from a **completely separate test application**, you're ready.

---

# 15. After Publishing

A developer should be able to do:

```bash
npm install @logged/sdk
```

then:

```ts
import { Logged } from "@logged/sdk";

const logger = new Logged({
  apiKey: process.env.LOGGED_API_KEY!,
  environment: "production",
});

logger.info("Application started");

logger.auto();

logger.interceptConsole();
```

And see:

```text
Application started
       │
       ▼
    Logged
       │
       ▼
  Dashboard
```

### Your immediate priority

Don't start Phase 11 yet.

First get **`@logged/sdk@0.1.0` published and successfully tested from a completely separate Next.js application**. That gives you the first real external-consumer version of Logged.
