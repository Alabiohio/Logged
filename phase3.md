# Phase 3 — Log Ingestion

This is the **core of Logged**. Phase 2 creates projects and API keys; Phase 3 makes those keys actually useful by allowing external applications to send logs into Logged.

## Goal

A developer should be able to do this:

```text
Their Application
      │
      │ POST /api/v1/logs
      │ API Key
      ▼
Logged API
      │
      ├── Authenticate
      ├── Validate
      ├── Normalize
      ├── Rate limit
      │
      ▼
Database
      │
      ▼
Logged Dashboard
```

---

# 1. Define the Log Structure

Create a consistent format for every incoming log.

### Required

```ts
{
  level: "info",
  message: "User logged in"
}
```

### Full structure

```ts
{
  level: "info",
  message: "User logged in",

  metadata: {
    userId: "123",
    plan: "pro"
  },

  environment: "production",

  source: "server",

  url: "https://example.com/login",

  pathname: "/login",

  userAgent: "...",

  stack: null,

  timestamp: "2026-08-09T12:30:00Z"
}
```

### Supported levels

```text
debug
info
success
warn
error
```

Keep the levels limited in the MVP. You can add custom levels later.

---

# 2. Create the Ingestion API

The main endpoint:

```http
POST /api/v1/logs
```

Example:

```bash
curl -X POST https://localhost:3000/api/v1/logs \
  -H "Authorization: Bearer lg_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Database connection failed"
  }'
```

Successful response:

```json
{
  "success": true,
  "id": "log_123"
}
```

---

# 3. API Key Authentication

The API key is what connects an incoming log to a project.

```text
Authorization: Bearer lg_live_xxxxx
```

Backend flow:

```text
Receive request
      ↓
Extract Bearer token
      ↓
Hash/lookup API key
      ↓
Find project
      ↓
Check project status
      ↓
Accept log
```

### Important

Don't store raw API keys if you can avoid it.

Store something like:

```text
apiKeyHash
```

The user sees the actual key only when it is generated.

---

# 4. API Key Format

Use recognizable prefixes.

For example:

```text
lg_live_xxxxxxxxxxxxxxxxx
```

For development keys:

```text
lg_test_xxxxxxxxxxxxxxxxx
```

This makes keys easy to identify.

---

# 5. Request Validation

Every request should be validated before reaching the database.

### Example

```ts
{
  level: "error",
  message: "Something went wrong"
}
```

Valid.

But:

```ts
{
  level: "banana"
}
```

Invalid.

Return:

```http
400 Bad Request
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOG",
    "message": "Invalid log level."
  }
}
```

---

# 6. Message Limits

You don't want someone accidentally sending enormous payloads.

For MVP, establish limits such as:

```text
message:       10 KB
metadata:      50 KB
stack:         50 KB
request body:  100 KB
```

These should be enforced on the server.

---

# 7. Metadata

Metadata is extremely important for debugging.

Allow developers to send arbitrary JSON:

```ts
logger.error("Payment failed", {
  userId: "123",
  orderId: "ORD-92",
  paymentMethod: "card"
});
```

Stored as:

```json
{
  "userId": "123",
  "orderId": "ORD-92",
  "paymentMethod": "card"
}
```

Don't require developers to define a schema for metadata.

---

# 8. Environment

Support:

```text
development
staging
production
```

A project can therefore distinguish:

```text
Production
   ↓
Errors: 24

Staging
   ↓
Errors: 7
```

For the MVP, the environment can either come from the request or the project configuration.

I'd recommend allowing it in the request but validating it against the supported values.

---

# 9. Automatic Server Information

Logged should enrich incoming logs where possible.

For example:

```text
IP address
User-Agent
Request timestamp
```

Don't rely on the client to provide these.

The server should determine them from the incoming request.

---

# 10. Log Database

Your `logs` table should look roughly like:

```text
logs

id
projectId

level
message

metadata

environment
source

url
pathname

userAgent
ipAddress

stack

timestamp
createdAt
```

### Relationships

```text
User
 │
 └── Projects
       │
       └── Logs
```

A user should only be able to access logs belonging to their own projects.

---

# 11. Database Indexes

This will matter a lot once Logged starts receiving thousands or millions of logs.

At minimum, index:

```text
projectId
createdAt
level
environment
```

Potential composite indexes:

```text
(projectId, createdAt)
(projectId, level)
(projectId, environment)
```

Don't over-index the table during MVP. Every index also increases write overhead and storage.

---

# 12. Rate Limiting

You don't want one API key flooding your server.

For example, start with a reasonable limit such as:

```text
100 requests / minute / API key
```

The exact limit can change later.

When exceeded:

```http
429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests."
  }
}
```

Return appropriate rate-limit headers where practical.

---

# 13. Error Handling

Standardize your API responses.

### Unauthorized

```http
401 Unauthorized
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid or missing API key."
  }
}
```

### Forbidden

```http
403 Forbidden
```

### Invalid request

```http
400 Bad Request
```

### Rate limited

```http
429 Too Many Requests
```

### Server error

```http
500 Internal Server Error
```

Don't expose internal database errors to developers.

---

# 14. Security

This phase needs serious attention because you're accepting arbitrary data from the internet.

Implement:

* HTTPS
* API-key authentication
* Request validation
* Payload-size limits
* Rate limiting
* Input sanitization where applicable
* Authorization checks
* Safe error responses
* CORS policy
* No secrets in logs
* No raw API keys stored in logs

Also avoid automatically collecting sensitive information that isn't needed.

---

# 15. CORS

Since browser applications will eventually send logs directly to Logged, configure CORS carefully.

Don't simply use:

```text
Access-Control-Allow-Origin: *
```

for authenticated browser ingestion without thinking through the security model.

For the MVP, you can support a configurable allowed-origin list per project, or initially make browser logging go through the SDK's designed ingestion mechanism.

---

# 16. Batch Logging

Don't make the MVP depend on one request per log.

Support:

```http
POST /api/v1/logs
```

and eventually:

```http
POST /api/v1/logs/batch
```

Example:

```json
{
  "logs": [
    {
      "level": "info",
      "message": "User logged in"
    },
    {
      "level": "error",
      "message": "Payment failed"
    }
  ]
}
```

### Recommendation

**Implement batch ingestion in Phase 3**, even if the SDK doesn't use it immediately.

It becomes important when an application generates many logs.

---

# 17. Idempotency

For batch requests or retries, consider an optional:

```http
Idempotency-Key: <unique-key>
```

This prevents a network retry from creating duplicate logs.

You don't need a sophisticated implementation for MVP, but designing the API so this can be added later is worthwhile.

---

# 18. API Response

Keep responses lightweight.

For a single log:

```json
{
  "success": true,
  "id": "log_01J..."
}
```

For a batch:

```json
{
  "success": true,
  "accepted": 25,
  "rejected": 0
}
```

Don't return the entire stored log unless there's a reason.

---

# 19. Next.js Structure

Since you're using Next.js, I'd organize the ingestion API roughly like:

```text
app/
└── api/
    └── v1/
        └── logs/
            └── route.ts
```

Then separate the actual logic:

```text
lib/
├── auth/
│   └── api-key.ts
│
├── logs/
│   ├── validate.ts
│   ├── normalize.ts
│   └── ingest.ts
│
└── rate-limit/
    └── index.ts
```

This prevents `route.ts` from becoming a giant file.

---

# 20. Testing

Before moving to Phase 4, test:

### Authentication

* [ ] Missing API key
* [ ] Invalid API key
* [ ] Valid API key
* [ ] Revoked API key

### Validation

* [ ] Missing message
* [ ] Invalid level
* [ ] Oversized message
* [ ] Invalid metadata
* [ ] Invalid environment

### Ingestion

* [ ] Single log
* [ ] Multiple logs
* [ ] Batch logs
* [ ] Metadata
* [ ] Stack traces

### Security

* [ ] Project A cannot write to Project B
* [ ] Rate limiting works
* [ ] Malformed requests don't crash API
* [ ] Internal errors aren't exposed

---

# Phase 3 Definition of Done

Phase 3 is complete when you can take a completely separate application and run:

```ts
fetch("https://localhost:3000/api/v1/logs", {
  method: "POST",

  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    level: "error",
    message: "Database connection failed",
    metadata: {
      userId: "123",
    },
    environment: "production",
  }),
});
```

And Logged can:

```text
Receive
   ↓
Authenticate
   ↓
Validate
   ↓
Rate-limit
   ↓
Normalize
   ↓
Store
   ↓
Return log ID
```

At that point, **Logged actually has its core ingestion engine**.

### Phase 3 → Phase 4

The next phase should be **Dashboard & Log Explorer**:

```text
Incoming Log
     ↓
Database
     ↓
Dashboard
     ↓
Search
     ↓
Filters
     ↓
Log Details
     ↓
Metadata / Stack Trace
```

That is where you'll finally be able to see the logs you're sending through the API.
