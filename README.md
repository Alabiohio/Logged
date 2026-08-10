# Logged

**Monitor. Debug. Ship with confidence.**

Logged is a lightweight logging platform that helps developers collect, monitor, and analyze logs from websites, APIs, and applications in one centralized dashboard. Instead of relying solely on browser consoles or server terminals, Logged stores your logs securely, making them searchable, filterable, and accessible from anywhere.

---

## Features

### Centralized Logging

Collect logs from multiple applications and view them in a single dashboard.

### Multiple Log Levels

* Info
* Success
* Warning
* Error
* Debug
* Log

### Project Management

Organize logs by project with unique API keys for secure log ingestion.

### Powerful Search & Filters

Quickly find logs by:

* Message
* Log level
* Date
* Environment
* Project
* Browser
* Device

### Rich Metadata

Every log can include useful context such as:

* Timestamp
* URL
* Browser
* Operating System
* Device
* Environment
* Custom metadata
* Stack traces

### Real-Time Dashboard

Watch logs appear instantly as they are received.

### REST API

Send logs from any application using a simple HTTP API.

### Lightweight SDK

Integrate Logged into your JavaScript or TypeScript applications with just a few lines of code.

---

## Why Logged?

Finding production issues shouldn't require SSH access, endless browser tabs, or digging through server logs.

Logged provides a clean, centralized place where developers can monitor application activity, investigate errors, and understand what's happening in real time.

Whether you're building a personal project, a startup, or a large-scale application, Logged helps you identify issues faster.

---

## Example

```javascript
import Logged from "@logged/sdk";

const logger = new Logged({
    apiKey: "YOUR_API_KEY"
});

logger.info("User signed in");

logger.warn("Payment is taking longer than expected");

logger.error("Failed to connect to database");

logger.debug({
    response
});
```

---

## Planned Features

### MVP

* User authentication
* Project management
* API keys
* Log ingestion API
* Dashboard
* Search & filtering
* SDK
* Automatic browser error capture

### Future

* Team collaboration
* Slack & Discord notifications
* Email alerts
* Source map support
* Release tracking
* Analytics dashboard
* Log exports
* Rate limiting
* Webhooks
* AI-powered error summaries
* Mobile application

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers
* REST API
* JWT Authentication

### Database

* PostgreSQL

---

## Folder Structure

```text
app/
components/
lib/
sdk/
types/
public/
```

---

## Philosophy

Logged is designed with simplicity in mind.

It should be easy to integrate, lightweight to use, and powerful enough to provide meaningful insights without unnecessary complexity.

Our goal is to help developers spend less time searching through logs and more time building great software.

---

## Status

🚧 Logged is currently under active development.

More features, integrations, and SDKs will be added over time.

---

## License

MIT License

---

Built with ❤️ for developers.
