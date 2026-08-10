For the **Logged MVP, I would not add organisations yet**.

Your current model can simply be:

```text
User
 └── Projects
      ├── Project A
      ├── Project B
      └── Project C
```

So your database stays simple:

```text
users
  id
  name
  email
  ...

projects
  id
  userId
  name
  description
  apiKey
  environment
  createdAt

logs
  id
  projectId
  ...
```

### Why skip organisations?

Your MVP promise is:

> **Receive logs from your applications and debug them from one dashboard.**

You don't need:

* Teams
* Invitations
* Roles
* Permissions
* Organisation switching
* Members
* Ownership transfer
* Team billing

Those add a lot of complexity before you've validated Logged.

### But design for it later

I'd structure your code so organisations can be introduced without rebuilding everything.

Later:

```text
Organization
 ├── Members
 │    ├── Owner
 │    ├── Admin
 │    └── Member
 │
 └── Projects
      ├── Website
      ├── API
      └── Mobile App
```

Then your schema could evolve toward:

```text
users
organizations
organization_members
projects
logs
```

Instead of:

```text
projects.userId
```

you'd eventually have:

```text
projects.organizationId
```

### One thing I'd change now

Even though you don't need organisations, I'd avoid tightly coupling your **entire application architecture** to `userId`.

Keep project ownership in one clear place so you can migrate later.

For example:

```ts
projects
  id
  userId
  name
  ...
```

is perfectly fine for MVP.

Just don't spread assumptions like:

```ts
if (project.userId === user.id) ...
```

through 50 different files. Put authorization/ownership checks behind reusable functions.

---

### My recommendation for Logged

**Phase 1–9:**

```text
User
 ↓
Projects
 ↓
Logs
```

**After MVP validation:**

```text
User
 ↓
Organization
 ↓
Projects
 ↓
Logs
```

I'd make **Organizations + Teams** one of your first post-MVP features, especially if you discover that developers want to invite coworkers.

So: **No organisation table for the MVP. Keep Logged single-user for now.**
