For **Logged**, I'd keep the MVP focused on one promise:

> **"Receive logs from your applications and debug them from one dashboard."**

Everything else (analytics, AI, alerts, teams) can come later.

---

# Logged MVP Roadmap

## Phase 1 — Foundation

### Objective

Set up the project and authentication.

### Tasks

* [x] Create Next.js project
* [x] Configure Tailwind CSS
* [x] PostgreSQL database (Neon + Drizzle)
* [x] Authentication (Better Auth)

  * [x] Register
  * [x] Login
  * [x] Logout
* [x] Dashboard layout (sidebar)
* [ ] Settings page

---

# Phase 2 — Project Management

Developers need a project before sending logs.

## Tasks

* [x] Create Project
* [x] Edit Project
* [x] Delete Project
* [x] Generate API Key
* [x] Regenerate API Key
* [x] Project Settings

Each project should have:

```text
id
name
description
apiKey
environment
createdAt
```

---

# Phase 3 — Log Ingestion

The core of Logged.

## API

```http
POST /api/v1/logs
```

Headers

```text
Authorization: Bearer API_KEY
```

Body

```json
{
  "level": "error",
  "message": "Database timeout",
  "metadata": {},
  "environment": "production"
}
```

---

## Validation

* [x] API key exists
* [x] API key belongs to project
* [x] Required fields
* [x] Rate limit

---

## Store

Each log should contain

```text
id
projectId

level

message

metadata

environment

url

pathname

browser

device

os

ip

userAgent

stack

timestamp
```

---

# Phase 4 — SDK

Build

```text
@logged/sdk
```

Methods

```ts
logger.log()

logger.info()

logger.success()

logger.warn()

logger.error()

logger.debug()
```

Extra

```ts
logger.capture(error)

logger.auto()

logger.interceptConsole()
```

---

# Phase 5 — Dashboard

## Dashboard Home

Cards

```
Projects

Logs Today

Errors Today

Warnings

```

Recent Logs

Latest Errors

---

## Project Page

```
Overview

Logs

Settings

API Key
```

---

## Logs Page

Features

* Search

* Filter

* Pagination

Columns

```
Time

Level

Message

Environment
```

Clicking a row opens

```
Message

Metadata

Stack

URL

Browser

Device

Timestamp
```

---

# Phase 6 — Search

Search by

* Message

* Level

* Date

* URL

---

# Phase 7 — Browser Auto Capture

SDK

```ts
logger.auto();
```

Automatically capture

* window.onerror

* Promise Rejections

---

# Phase 8 — Console Capture

```ts
logger.interceptConsole();
```

Automatically send

```
console.log

console.info

console.warn

console.error
```

---

# Phase 9 — Documentation

Pages

```
Installation

Quick Start

SDK

REST API

Examples
```

---

# Database

## users

```text
id
name
email
password
createdAt
```

---

## projects

```text
id
userId
name
description
apiKey
createdAt
```

---

## logs

```text
id
projectId

level

message

metadata

stack

url

pathname

browser

device

os

environment

createdAt
```

---

# MVP Pages

```
/

Landing

/login

/register

/dashboard

/projects

/projects/[id]

/projects/[id]/logs

/projects/[id]/settings

/docs
```

---

# Nice-to-Have (After MVP)

These can wait until after you've validated the product:

* Team workspaces
* Email alerts
* Slack/Discord notifications
* Source map support
* AI error summaries
* Log exports (CSV/JSON)
* Analytics dashboards
* Release tracking
* Webhooks
* Billing
* Dark mode
* SDKs for Python, PHP, Go, Java, .NET

---

# Recommended Development Order

1. Authentication
2. Database schema
3. Project management
4. Log ingestion API
5. Dashboard layout
6. Logs table
7. Log details drawer
8. JavaScript SDK
9. Browser auto-capture
10. Console interception
11. Documentation
12. Landing page polish

---

## Definition of Done (MVP)

Your MVP is complete when a developer can:

1. Sign up and log in.
2. Create a project.
3. Receive an API key.
4. Install the SDK.
5. Send logs from an application.
6. See those logs appear in the dashboard.
7. Search and inspect logs with relevant metadata.

Once those seven steps work reliably, you've delivered the core value of Logged. Everything else should be treated as enhancements rather than prerequisites.
