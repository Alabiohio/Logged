# Phase 2 — Project Management

## Goal

Allow users to create and manage projects. Every project represents an application (website, API, mobile app, etc.) and receives a unique API key that can be used to send logs to Logged.

---

# User Flow

```text
Login
   │
   ▼
Dashboard
   │
   ▼
Projects
   │
   ▼
Create Project
   │
   ▼
Generate API Key
   │
   ▼
Project Overview
```

---

# Features

## 1. Projects List

### Route

```text
/dashboard/projects
```

### Display

Each project card should show:

* Project Name
* Description (optional)
* Environment
* Total Logs
* Last Activity
* Date Created

### Actions

* Open
* Edit
* Delete
* Copy API Key
* Regenerate API Key

---

## 2. Create Project

### Route

```text
/dashboard/projects/new
```

### Form Fields

| Field        | Required | Notes                            |
| ------------ | -------- | -------------------------------- |
| Project Name | ✅        | Max 50 characters                |
| Description  | ❌        | Optional                         |
| Environment  | ✅        | Development, Staging, Production |
| Website URL  | ❌        | Optional                         |

### Validation

* Name is required.
* Name must be unique per user.
* Environment is required.

### On Submit

1. Generate a unique Project ID.
2. Generate a secure API Key.
3. Save to the database.
4. Redirect to the project overview page.

---

## 3. API Key Generation

Each project receives a unique key.

Example:

```text
lg_live_4HjK9P2LmX7Qv8NfR3Ta
```

### Requirements

* Cryptographically secure.
* Unique.
* Not guessable.
* Stored securely.

### Actions

* Copy API Key
* Reveal/Hide API Key
* Regenerate API Key (with confirmation)

---

## 4. Project Overview

### Route

```text
/dashboard/projects/[projectId]
```

### Layout

#### Header

* Project Name
* Environment badge
* Created date
* Last activity

#### Quick Stats

* Total Logs
* Errors
* Warnings
* Info Logs

#### Quick Actions

* Copy API Key
* View Logs
* Project Settings

---

## 5. Edit Project

### Editable Fields

* Project Name
* Description
* Website URL
* Environment

### Non-editable

* Project ID
* Creation Date

---

## 6. Delete Project

### Flow

Click **Delete Project**

↓

Confirmation modal

↓

Type the project name

↓

Delete

### Delete Effects

* Delete project
* Delete associated logs (or archive them if you prefer)
* Revoke API key

---

# Database Design

## Projects Table

```text
id (UUID)

userId

name

description

website

environment

apiKey

createdAt

updatedAt
```

---

# API Routes

## Get Projects

```http
GET /api/projects
```

Returns all projects belonging to the authenticated user.

---

## Get Single Project

```http
GET /api/projects/:id
```

---

## Create Project

```http
POST /api/projects
```

Body

```json
{
  "name": "Portfolio",
  "description": "Personal website",
  "environment": "production",
  "website": "https://example.com"
}
```

---

## Update Project

```http
PATCH /api/projects/:id
```

---

## Delete Project

```http
DELETE /api/projects/:id
```

---

## Regenerate API Key

```http
POST /api/projects/:id/regenerate-key
```

---

# UI Components

## Projects Page

* Page Header
* Search Input
* Environment Filter
* New Project Button
* Project Cards
* Empty State

---

## Project Card

Displays:

* Project Name
* Environment Badge
* Log Count
* Last Activity
* Quick Actions

---

## Create Project Modal/Page

Components:

* Text Input
* Textarea
* Select Dropdown
* Submit Button
* Cancel Button

---

## API Key Card

Shows:

* Hidden API Key
* Copy Button
* Reveal Button
* Regenerate Button

---

# Validation Rules

| Rule                               | Behavior   |
| ---------------------------------- | ---------- |
| Empty name                         | Reject     |
| Duplicate project name (same user) | Reject     |
| Invalid environment                | Reject     |
| Missing authentication             | Return 401 |
| Project not owned by user          | Return 403 |

---

# Success Criteria

Phase 2 is complete when a user can:

* ✅ View all their projects.
* ✅ Create a new project.
* ✅ Automatically receive an API key.
* ✅ Edit project details.
* ✅ Copy or regenerate the API key.
* ✅ Delete a project safely.
* ✅ Navigate to the project's overview page.

At that point, Logged is ready for **Phase 3: Log Ingestion**, where external applications begin sending logs using the generated API keys.
