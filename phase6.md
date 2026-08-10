# Phase 6 — Search & Filtering

Phase 5 gave Logged the dashboard and log explorer. **Phase 6 makes the log explorer genuinely useful when a project has hundreds, thousands, or millions of logs.**

The goal is simple:

> **Find the exact log you're looking for quickly.**

---

# 1. Search Experience

The main interface:

```text
Logs

┌──────────────────────────────────────────────┐
│ 🔍 Search logs...                            │
└──────────────────────────────────────────────┘

[ All Levels ] [ All Environments ] [ Date ]

───────────────────────────────────────────────

TIME       LEVEL     MESSAGE             ENV
03:42:18   ERROR     Database timeout    PROD
03:41:02   WARN      Slow API response   PROD
03:40:55   INFO      User logged in      PROD
```

Search should work without requiring developers to understand a query language.

---

# 2. Search by Message

Search:

```text
database
```

Should find logs containing:

```text
Database connection failed
Database timeout
Failed to connect to database
```

For the MVP, start with **case-insensitive message search**.

---

# 3. Search by URL

Allow searches such as:

```text
/api/payments
```

to find:

```text
/api/payments
/api/payments/create
/api/payments/confirm
```

This corresponds to the `url`/`pathname` fields already stored in your logs.

---

# 4. Filter by Level

Provide:

```text
All
Debug
Info
Success
Warning
Error
```

Example:

```text
Level: Error
```

returns only:

```text
ERROR
ERROR
ERROR
```

---

# 5. Filter by Environment

```text
All
Development
Staging
Production
```

Example:

```text
Environment: Production
```

This becomes particularly useful when the same project receives logs from multiple environments.

---

# 6. Filter by Date

MVP options:

```text
Today
Last 24 hours
Last 7 days
Last 30 days
Custom range
```

Example:

```text
Date: Last 24 hours
```

---

# 7. Combine Filters

Filters should work together.

For example:

```text
Search: database

Level: Error

Environment: Production

Date: Last 7 days
```

The resulting query means:

> Find production error logs from the last seven days containing "database".

This is much more useful than having independent filters.

---

# 8. URL Query Parameters

Keep the filters represented in the URL.

Example:

```text
/projects/project_123/logs
  ?search=database
  &level=error
  &environment=production
  &from=2026-08-03
  &to=2026-08-10
```

Benefits:

* Refreshing preserves filters.
* Browser back/forward works.
* Developers can share filtered views.
* The state is easier to debug.

---

# 9. Search API

Your existing endpoint can be extended:

```http
GET /api/projects/:id/logs
```

Parameters:

```text
search
level
environment
from
to
url
cursor
limit
```

Example:

```http
GET /api/projects/project_123/logs
  ?search=database
  &level=error
  &environment=production
  &limit=50
```

---

# 10. Query Construction

With Drizzle, construct the conditions dynamically.

Conceptually:

```text
projectId = current project
        AND
level = selected level
        AND
environment = selected environment
        AND
createdAt >= from
        AND
createdAt <= to
        AND
message contains search
```

Don't construct raw SQL strings from user input.

Use Drizzle's query helpers/parameterization.

---

# 11. Search Performance

This is important.

Your logs table could eventually contain:

```text
100,000 logs
1,000,000 logs
10,000,000+ logs
```

Don't build a search system that scans the entire table for every keystroke.

For the MVP:

### Don't search on every keystroke.

Instead:

```text
User types:

database timeout

        ↓

User presses Enter

        ↓

Request sent
```

You can also debounce the search if you want live results.

---

# 12. PostgreSQL Search

Since you're using:

```text
Neon
+
PostgreSQL
+
Drizzle
```

start with PostgreSQL rather than introducing Elasticsearch/OpenSearch.

For simple MVP search, use PostgreSQL text matching.

Later, if search becomes a bottleneck, you can move toward:

```text
PostgreSQL Full-Text Search
        ↓
Trigram indexes
        ↓
Dedicated search infrastructure
```

Don't prematurely add another database.

---

# 13. Search Indexes

Your existing indexes should cover the most common filters.

At minimum:

```text
projectId
projectId + createdAt
projectId + level
projectId + environment
```

If message search becomes important, investigate a PostgreSQL text-search/trigram index rather than blindly adding a normal B-tree index.

---

# 14. Clear Filters

Provide:

```text
Clear all
```

Example:

```text
Search: database
Level: Error
Environment: Production
Date: Last 7 days

[Clear filters]
```

Clicking it returns to:

```text
All logs
```

---

# 15. Active Filter Display

Show active filters clearly.

Example:

```text
Search: database   ×
Error              ×
Production         ×
Last 7 days        ×
```

This makes it obvious why a user isn't seeing certain logs.

---

# 16. No Results

If a search returns nothing:

```text
No logs found

We couldn't find any logs matching
your current search and filters.

[Clear filters]
```

Don't simply show an empty table.

---

# 17. Result Count

Display something like:

```text
1,284 logs
```

or:

```text
Showing 1–50 of 1,284 logs
```

For very large datasets, avoid expensive exact `COUNT(*)` queries on every request if they become a performance problem.

For MVP, an exact count is acceptable if the dataset remains manageable.

---

# 18. Pagination

Continue using cursor pagination from Phase 5.

Example:

```text
← Previous       Next →
```

or:

```text
Load more
```

I'd favor **Load more / infinite loading** for a log viewer because developers often want to scan logs chronologically.

The API still uses a cursor:

```text
?cursor=eyJ0aW1lc3RhbXAiOi...
```

---

# 19. Sorting

For MVP, keep one primary sort:

```text
Newest → Oldest
```

Logs naturally work best this way.

Later you can add:

```text
Oldest → Newest
```

if users request it.

Don't add arbitrary sorting by every column.

---

# 20. Search Keyboard Shortcut

Add:

```text
Ctrl + K
```

or:

```text
/
```

to focus the log search field.

This fits a developer-oriented product nicely.

Example:

```text
Press /

       ↓

Search logs...
```

---

# 21. Search Component

Create:

```text
components/dashboard/log-search.tsx
```

Responsibilities:

* Input
* Search icon
* Clear button
* Keyboard shortcut
* URL synchronization

Keep API/database logic outside the component.

---

# 22. Filter Component

Create:

```text
components/dashboard/log-filters.tsx
```

It should contain:

```text
Level
Environment
Date
```

Potential structure:

```text
LogFilters
├── LevelFilter
├── EnvironmentFilter
└── DateFilter
```

This keeps the components manageable.

---

# 23. Search State

The URL should be the source of truth for the search page.

For example:

```text
searchParams:
{
  search,
  level,
  environment,
  from,
  to,
  cursor
}
```

Avoid maintaining multiple conflicting copies of the same state.

---

# 24. Search Flow

```text
User enters "database"
          │
          ▼
URL updated
          │
          ▼
GET /api/projects/:id/logs
          │
          ▼
Drizzle query
          │
          ▼
PostgreSQL
          │
          ▼
Filtered logs
          │
          ▼
Log table
```

---

# 25. Security

Search must respect project ownership exactly like Phase 5.

Never allow:

```text
User A
   ↓
Project A URL
   ↓
Modify project ID
   ↓
Project B logs
```

Every search request must first establish:

```text
Current user owns project
```

Then perform the search.

Also make sure search input is treated as data, not executable SQL.

---

# 26. Search API Response

Keep the response predictable:

```json
{
  "success": true,
  "logs": [
    {
      "id": "log_123",
      "level": "error",
      "message": "Database timeout",
      "environment": "production",
      "createdAt": "2026-08-10T03:42:18Z"
    }
  ],
  "pagination": {
    "nextCursor": "abc123",
    "hasMore": true
  }
}
```

You don't need to return the complete metadata for every row in the list.

Load the full log when the developer opens the details drawer.

---

# 27. Search Architecture

By the end of Phase 6:

```text
                    Log Explorer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Search           Filters        Date Range
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                 Logs API Endpoint
                         │
                         ▼
                   Authorization
                         │
                         ▼
                   Query Builder
                         │
                         ▼
                  PostgreSQL/Neon
                         │
                         ▼
                    Log Results
```

---

# 28. Development Order

### Step 1 — Search API

* [ ] Add `search`
* [ ] Add `level`
* [ ] Add `environment`
* [ ] Add `from`
* [ ] Add `to`
* [ ] Add `url`
* [ ] Validate parameters

### Step 2 — Search UI

* [ ] Search input
* [ ] Search button/Enter
* [ ] Clear button
* [ ] URL synchronization

### Step 3 — Filters

* [ ] Level filter
* [ ] Environment filter
* [ ] Date filter
* [ ] Clear filters
* [ ] Active filter badges

### Step 4 — Pagination

* [ ] Cursor handling
* [ ] Next page
* [ ] Loading state
* [ ] End-of-results state

### Step 5 — Polish

* [ ] Keyboard shortcut
* [ ] Empty state
* [ ] Error state
* [ ] Mobile filter UI
* [ ] Loading skeleton
* [ ] Preserve filters on navigation

---

# 29. Phase 6 Definition of Done

Phase 6 is complete when a developer can open:

```text
/projects/[id]/logs
```

and:

* ✅ Search log messages
* ✅ Search URLs
* ✅ Filter by level
* ✅ Filter by environment
* ✅ Filter by date
* ✅ Combine filters
* ✅ See active filters
* ✅ Clear filters
* ✅ Paginate through results
* ✅ Preserve searches in the URL
* ✅ Open matching logs in the Phase 5 details drawer
* ✅ Get useful empty states when nothing matches

### Final experience

```text
                 Logged
                   │
                   ▼
             Project Logs
                   │
          ┌────────┴────────┐
          │                 │
       Search             Filter
          │                 │
          └────────┬────────┘
                   ▼
             PostgreSQL
                   │
                   ▼
             Matching Logs
                   │
                   ▼
             Log Details
```

After this, **Phase 7 — Browser Auto Capture** can make Logged much more powerful: instead of developers manually calling `logger.error()` for every browser failure, Logged can automatically capture uncaught browser errors and rejected promises.
