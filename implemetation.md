That's completely fine. You can build **Logged** without either of them.

Here's an updated stack I'd recommend based on your preferences.

## Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Native React components (your own design system)

### Backend

* Next.js Route Handlers (`app/api`)
* JWT authentication
* Zod for validation

### Database

Instead of Prisma, use one of these:

* **Drizzle ORM** (my recommendation)
* Raw SQL with the `pg` package
* Supabase JS (if using Supabase)

### Authentication

* Better Auth
* Auth.js
* Clerk
* Or build your own JWT auth

### Other Packages

```bash
bcryptjs
jsonwebtoken
zod
axios
react-hook-form
```

---

# Folder Structure

```text
app/
│
├── (auth)/
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
├── dashboard/
│   ├── page.tsx
│   ├── projects/
│   └── settings/
│
├── api/
│   ├── auth/
│   ├── logs/
│   ├── projects/
│   └── sdk/
│
├── docs/
│
├── pricing/
│
└── page.tsx

components/
│
├── ui/
├── layout/
├── dashboard/
├── charts/
└── logs/

lib/
│
├── db.ts
├── auth.ts
├── jwt.ts
├── rate-limit.ts
└── utils.ts

sdk/

types/

styles/
```

---

# Development Roadmap

## Sprint 1

* Landing page
* Authentication
* Dashboard layout

## Sprint 2

* Create Project
* Generate API Key
* Project Settings

## Sprint 3

* Log ingestion endpoint
* Database
* SDK

## Sprint 4

* Logs table
* Search
* Filters

## Sprint 5

* Real-time updates
* Analytics
* Charts

## Sprint 6

* Alerts
* Teams
* Billing

---

# Suggested Database Tables

## users

```text
id
name
email
password
created_at
```

## projects

```text
id
user_id
name
api_key
secret_key
environment
created_at
```

## logs

```text
id
project_id
level
message
metadata
url
pathname
browser
os
device
ip
stack
created_at
```

---

# Future Features

### SDK

```ts
logged.info()
logged.warn()
logged.error()
logged.debug()
logged.capture()
logged.interceptConsole()
logged.auto()
```

### Dashboard

* Live logs
* Search
* Filters
* Log details
* Charts
* Export
* Team members

### Analytics

* Error rate
* Warning rate
* Browser usage
* Device breakdown
* Top pages with errors
* Most common exceptions

---

One recommendation I'd make is to use **Drizzle ORM** instead of raw SQL. It's lightweight, type-safe, and integrates exceptionally well with Next.js while avoiding much of the complexity that some developers find with Prisma. If you prefer full control, though, the `pg` package with handwritten SQL queries is also a solid choice.
