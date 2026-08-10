Absolutely. Following the roadmap you confirmed, **Phase 5 is the Dashboard**. Phase 6 will handle advanced search separately.

# Phase 5 — Dashboard

## Objective

Build the Logged dashboard where developers can see their projects, monitor incoming logs, and inspect individual log records.

The core experience:

```text
Developer's App
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
┌─────────────────────────────┐
│       Logged Dashboard      │
│                             │
│  Overview                   │
│  Projects                   │
│  Logs                       │
│  Log Details                │
└─────────────────────────────┘
```

---

# 1. Dashboard Routes

Phase 5 should implement:

```text
/dashboard
/projects
/projects/[id]
/projects/[id]/logs
/projects/[id]/settings
```

You already have the dashboard shell/sidebar from Phase 1.

---

# 2. Dashboard Home

### Route

```text
/dashboard
```

This is the user's overall Logged overview.

### Main sections

```text
Welcome back, Ohio

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Projects   │ │ Logs Today │ │ Errors     │ │ Warnings   │
│     4      │ │   12,482   │ │     27     │ │     81     │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Then:

```text
Recent Activity
────────────────────────────────────────────

ERROR   Database timeout          2m ago
INFO    User signed in            4m ago
WARN    Slow API response         7m ago
ERROR   Payment failed            11m ago
```

And:

```text
Projects
────────────────────────────────────────────

Oheo Website       Production      2m ago
Client API         Production      8m ago
Test App           Development     1h ago
```

---

# 3. Dashboard Statistics

For MVP, keep statistics simple.

### Projects

Number of projects owned by the user.

### Logs Today

Total logs received today across the user's projects.

### Errors Today

Number of:

```text
level = error
```

today.

### Warnings

Number of:

```text
level = warn
```

today.

Don't build complicated analytics yet.

---

# 4. Projects Page

### Route

```text
/projects
```

Show all projects.

Example:

```text
Projects

                         + New Project

┌──────────────────────────────────────────────┐
│ Oheo Website                         ● LIVE │
│ Production                                  │
│                                              │
│ 12,482 logs        Last activity 2m ago      │
│                                              │
│ Open →                                      │
└──────────────────────────────────────────────┘
```

Each project should show:

* Name
* Environment
* Log count
* Last activity
* Created date
* Status

---

# 5. Project Page

### Route

```text
/projects/[id]
```

This becomes the central page for an individual application.

Header:

```text
← Projects

Oheo Website
Production

[View Logs] [Settings]
```

---

# 6. Project Overview

Display:

### Statistics

```text
Total Logs
12,482

Errors
27

Warnings
81

Info
12,374
```

### Recent Logs

```text
Recent Logs

ERROR   Database connection failed     2m
WARN    Slow response                  4m
INFO    User logged in                 5m
INFO    Request completed              6m
```

### Latest Error

Highlight the most recent error:

```text
Latest Error

Database connection failed

2 minutes ago

View details →
```

---

# 7. Logs Page

### Route

```text
/projects/[id]/logs
```

This is the main log viewer.

For Phase 5, keep filtering/search relatively basic. **Phase 6 is where search becomes a dedicated feature.**

Layout:

```text
Logs

[ Search... ]          [Filter]

─────────────────────────────────────────────

TIME        LEVEL      MESSAGE        ENV

03:42:18    ERROR      Database...     PROD
03:41:02    WARN       Slow API        PROD
03:40:55    INFO       User logged     PROD
03:39:12    INFO       Request...      PROD
```

---

# 8. Log Table

Columns:

```text
Time
Level
Message
Environment
```

Keep it compact.

Don't put every piece of metadata into the table.

The table should be scannable.

---

# 9. Log Level Badge

Create a reusable component:

```text
<LogLevelBadge level="error" />
```

Supported:

```text
debug
info
success
warn
error
```

Example:

```text
[ ERROR ]
[ WARN  ]
[ INFO  ]
```

Use your emerald/iOS glass design system without making the interface overly colorful.

---

# 10. Log Details Drawer

When the developer clicks a log, open a side drawer.

Don't navigate to another page.

Example:

```text
┌─────────────────────────────────────────┐
│ Log Details                         ×   │
│                                         │
│ [ERROR]                                 │
│ Database connection failed              │
│                                         │
│ 10 Aug 2026 • 03:42:18                  │
│                                         │
│ Environment                             │
│ production                              │
│                                         │
│ URL                                     │
│ /api/users                              │
│                                         │
│ Path                                    │
│ /api/users                              │
│                                         │
│ Metadata                                │
│ ┌─────────────────────────────────────┐ │
│ │ userId: "123"                       │ │
│ │ requestId: "req_123"                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Stack                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Error: Database connection failed   │ │
│ │ at connectDatabase(...)              │ │
│ │ at getUser(...)                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

# 11. Log Details

Display whatever information exists.

### Core

```text
Message
Level
Timestamp
```

### Environment

```text
Environment
```

### Request

```text
URL
Pathname
```

### Client

```text
Browser
Device
OS
User Agent
IP
```

### Error

```text
Stack
```

### Additional

```text
Metadata
```

Don't show empty fields.

---

# 12. Metadata Viewer

Create a reusable component:

```text
MetadataViewer
```

Given:

```json
{
  "userId": "123",
  "plan": "pro",
  "requestId": "abc123"
}
```

Render it in a readable JSON-style format.

Add:

```text
Copy
```

so developers can copy the metadata.

---

# 13. Stack Trace Viewer

For errors:

```text
Stack Trace

Error: Database connection failed

at connectDatabase
database.ts:42

at getUser
users.ts:18

at GET
route.ts:12
```

Add:

```text
Copy Stack
```

Don't implement source-map resolution yet. That's a post-MVP enhancement.

---

# 14. Pagination

Never load the entire logs table.

Start with:

```text
50 logs
```

per request.

For example:

```http
GET /api/projects/:id/logs?limit=50
```

Use **cursor pagination** if your Phase 3 API/data layer already supports it.

Example:

```text
/api/projects/project_123/logs?cursor=abc123
```

This will scale better as logs accumulate.

---

# 15. Dashboard API

Create internal authenticated API routes for the dashboard.

### Projects

```http
GET /api/projects
```

### Project

```http
GET /api/projects/:id
```

### Project stats

```http
GET /api/projects/:id/stats
```

### Logs

```http
GET /api/projects/:id/logs
```

### Individual log

```http
GET /api/projects/:id/logs/:logId
```

---

# 16. Authorization

Every dashboard API request must verify ownership.

```text
Authenticated User
       │
       ▼
Find Project
       │
       ▼
Does project.userId === currentUser.id?
       │
    ┌──┴──┐
   YES    NO
    │      │
    ▼      ▼
 Allow    403
```

This is critical.

Never do:

```ts
db.query.logs.findMany({
  where: eq(logs.projectId, projectId),
});
```

without first establishing that the current user owns that project.

---

# 17. Database Queries

With Drizzle + Neon, keep the dashboard queries targeted.

For project statistics, you'll need counts grouped by level.

Conceptually:

```text
Total
Error
Warning
Info
Success
Debug
```

For recent logs:

```text
WHERE projectId = ?
ORDER BY createdAt DESC
LIMIT 10
```

For the logs page:

```text
WHERE projectId = ?
ORDER BY createdAt DESC
LIMIT 50
```

Add the indexes required by your actual query patterns.

---

# 18. Loading States

Don't leave blank screens while data loads.

Use skeletons:

```text
┌────────────┐ ┌────────────┐
│ ▬▬▬▬▬      │ │ ▬▬▬▬▬      │
│ ▬▬▬        │ │ ▬▬▬        │
└────────────┘ └────────────┘
```

For logs:

```text
────────  ─────  ───────────────
────────  ─────  ───────────────
────────  ─────  ───────────────
```

---

# 19. Empty States

### Dashboard

If the user has no projects:

```text
No projects yet

Create your first project and start
monitoring your application.

[Create Project]
```

### Project

If the project has no logs:

```text
No logs yet

Send your first log using @logged/sdk.

[View Documentation]
```

### Logs

```text
No logs found

Logs sent to this project will appear here.
```

---

# 20. Error States

Handle:

```text
Project not found
Unauthorized
Database error
Network error
```

Example:

```text
Something went wrong

We couldn't load this project.

[Try again]
```

Don't expose raw database errors to the user.

---

# 21. Realtime

I would **not make full realtime a hard requirement for Phase 5 MVP**.

The dashboard can initially refresh logs through normal requests.

If your database/realtime infrastructure is already ready, you can add:

```text
New log received
       ↓
Dashboard updates
       ↓
New row appears
```

But don't let realtime delay the core dashboard.

---

# 22. Component Structure

Since you're using Next.js, I'd organize the dashboard components like:

```text
components/
└── dashboard/
    ├── sidebar.tsx
    ├── topbar.tsx
    ├── stat-card.tsx
    ├── project-card.tsx
    ├── recent-logs.tsx
    ├── recent-projects.tsx
    ├── log-table.tsx
    ├── log-row.tsx
    ├── log-level-badge.tsx
    ├── log-details-drawer.tsx
    ├── metadata-viewer.tsx
    ├── stack-trace.tsx
    ├── empty-state.tsx
    └── skeleton.tsx
```

---

# 23. iOS 26 Glass Design

Keep the design consistent with the direction we already established.

### Background

Soft neutral background:

```text
#F5F7F8
```

### Primary

Emerald:

```text
#10B981
```

### Glass

Use:

```text
bg-white/50
backdrop-blur-xl
border border-white/60
```

with restrained shadows.

The important thing is **hierarchy**. Don't make every table row, button, card, and drawer look like a separate glass pane.

Use glass primarily for:

* Navigation
* Cards
* Drawers
* Floating controls

Keep the log table itself relatively clean.

---

# 24. Responsive Design

The dashboard must work on:

```text
Desktop
Tablet
Mobile
```

Desktop:

```text
Sidebar | Content
```

Mobile:

```text
Topbar
─────────────
Content
─────────────
Bottom/navigation trigger
```

The log details drawer should become a full-screen sheet on smaller screens.

---

# 25. Development Order

Build Phase 5 in this order:

### Step 1 — Dashboard Home

* [x] Dashboard data
* [x] Statistics
* [x] Recent logs
* [x] Recent projects

### Step 2 — Projects

* [x] Projects list
* [x] Project cards
* [x] Empty state

### Step 3 — Project Overview

* [x] Project header
* [x] Statistics
* [x] Recent logs
* [x] Navigation

### Step 4 — Log Explorer

* [x] Logs API
* [x] Log table
* [x] Pagination
* [x] Level badges

### Step 5 — Log Details

* [x] Drawer
* [x] Metadata viewer
* [x] Stack trace
* [x] Copy actions

### Step 6 — UX

* [x] Loading states
* [x] Error states
* [x] Empty states
* [ ] Mobile responsiveness
* [ ] Accessibility

### Step 7 — Polish

* [x] Glass effects
* [x] Animations
* [x] Transitions
* [x] Keyboard interactions

---

# Phase 5 Definition of Done

Phase 5 is complete when a developer can:

1. Log into Logged.
2. Open the dashboard.
3. See their projects.
4. See basic log statistics.
5. Open a project.
6. See recent logs.
7. Open the Logs page.
8. See logs in a table.
9. Click a log.
10. Inspect its message, metadata, stack, URL, environment, and client information.
11. Navigate comfortably on desktop and mobile.

The resulting flow should be:

```text
┌──────────────┐
│   Dashboard  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Projects   │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│  Project Overview  │
│                    │
│ Stats              │
│ Recent Logs        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│    Log Explorer    │
│                    │
│ Time Level Message │
│ ────────────────── │
│ 03:42 ERROR ...    │
│ 03:41 WARN  ...    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Log Details      │
│                    │
│ Message            │
│ Metadata           │
│ Stack               │
│ URL                 │
│ Browser             │
│ Device              │
│ Timestamp           │
└────────────────────┘
```

Then **Phase 6 — Search** can build on this foundation with proper message/URL/level/date filtering without mixing search complexity into the initial dashboard implementation.
