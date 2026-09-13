# JobTrack

A production-quality job search & career management SaaS. JobTrack is **not** a job board — you find jobs on LinkedIn, Naukri, Indeed, or wherever, apply externally, then track the entire lifecycle (recruiter contact, interviews, offers, follow-ups) here.

## Product overview

- **Users** manually log applications they made elsewhere and manage everything downstream: a 15-stage Kanban pipeline, recruiter/company CRM, interview scheduling and prep, follow-up and task reminders, a resume vault, and real analytics computed from their own data.
- **Admins** manage the platform only — user accounts, platform-wide analytics, and an audit log. Admins never see or post job listings; there is no admin-created content in a user's job search data.
- Every piece of user data is isolated per-account and enforced server-side on every request, not just hidden in the UI.

## Features

- Auth: email/password (bcrypt-hashed), forgot/reset password, optional Google OAuth, JWT sessions
- RBAC enforced at three layers: Edge middleware (coarse), server layout (DB-verified `isActive`/role), and every API route (`requireUser`/`requireAdmin`)
- Applications: full CRUD, 15-stage Kanban with drag-and-drop, status history, activity timeline, notes
- Companies & Contacts CRM, linked to applications, interviews, and communications
- Interviews: scheduling, preparation notes, a personal question bank, structured post-interview feedback
- Calendar: month/week/day views aggregating interviews, follow-ups, tasks, and application deadlines
- Follow-ups & Tasks with due-today/overdue/upcoming grouping
- Resume vault with secure, ownership-checked file upload/download (Cloudinary-backed, private delivery type with short-lived signed URLs — nothing is served from a public path)
- Analytics: conversion funnel, source performance, salary stats, top roles/locations — all computed from real data, nothing hardcoded
- Admin dashboard: platform overview, user management (activate/deactivate, change role, delete), platform-wide analytics, audit log
- Dark/light/system theme, command palette (`Ctrl+K`), notifications, responsive down to phone width

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (`base-nova` style, built on `@base-ui/react`) |
| Forms/validation | React Hook Form + Zod v4 |
| Data fetching | TanStack Query (client), Server Components (server) |
| Charts | Recharts |
| Database | MySQL (tested against Aiven) |
| ORM | Prisma 7 (driver-adapter architecture, `@prisma/adapter-mariadb`) |
| Auth | Auth.js (next-auth) v5, Credentials + optional Google provider, JWT sessions |

## Architecture

```text
src/
  app/
    (auth)/          — login, register, forgot/reset password (shared centered layout)
    (dashboard)/     — every authenticated user page, behind one sidebar/topbar layout
    admin/           — platform admin pages, behind a separate admin layout, ADMIN-only
    api/             — Route Handlers; every handler re-verifies the session + ownership itself
  components/
    ui/              — shadcn/ui primitives (generated, base-ui powered)
    dashboard/, applications/, interviews/, companies/, contacts/,
    calendar/, analytics/, admin/, settings/, resumes/, tasks/, auth/, shared/
  lib/
    auth/            — password hashing, Auth.js edge-safe config
    db/              — Prisma Client singleton + MySQL driver-adapter setup
    services/        — all business logic and Prisma queries live here, never in route handlers
    validations/     — Zod schemas, one per domain
    constants/       — shared label/color maps for enums
  hooks/
  types/
prisma/
  schema.prisma
  seed.ts            — creates the initial admin from ADMIN_EMAIL / ADMIN_PASSWORD
```

Business logic lives in `src/lib/services/*`, never inline in a route handler or a page — route handlers parse/validate input, call a service, and shape the response.

## Database architecture

24 Prisma models covering: `User`, `Company`, `JobApplication`, `ApplicationStatusHistory`, `Contact`, `Communication`, `Interview`, `InterviewQuestion`, `InterviewFeedback`, `FollowUp`, `Task`, `Note`, `Document`, `Resume`, `CoverLetter`, `Tag`/`ApplicationTag`, `Notification`, `Goal`, `Activity`, `AuditLog`, plus Auth.js's `Account`/`Session`/`VerificationToken`/`PasswordResetToken`.

Notes specific to this schema:
- Soft delete (`deletedAt`) on `JobApplication`, `Company`, `Contact`, `Resume`, `CoverLetter` — service functions always filter `deletedAt: null`.
- `ApplicationStatusHistory` + `Activity` are both written automatically whenever `changeApplicationStatus()` runs, so the timeline never has to be reconstructed after the fact.
- `Interview.startTime`/`endTime` are plain `String` (e.g. `"14:30"`), not `DateTime` — they're display-only times entered via `<input type="date">`/`<input type="time">`, not a real combined timestamp.

## Environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="mysql://user:password@host:3306/jobtracker?ssl-mode=REQUIRED"

AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

ADMIN_EMAIL="admin@jobtrack.local"
ADMIN_PASSWORD="ChangeMe123!"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

- `AUTH_SECRET` — generate with `openssl rand -base64 32`.
- `CLOUDINARY_*` — from your [Cloudinary console](https://cloudinary.com/console); used by `src/lib/services/file-storage.ts` for resume uploads (private delivery type, signed download URLs — see Security below).
- `ssl-mode` on `DATABASE_URL` follows MySQL's standard enum (`DISABLED`/`PREFERRED`/`REQUIRED`/`VERIFY_CA`/`VERIFY_IDENTITY`) — the app maps this itself in `src/lib/db/index.ts`, no extra config needed.
- Google OAuth is optional; leaving both blank simply omits the provider.
- `ADMIN_EMAIL`/`ADMIN_PASSWORD` are only used by `prisma/seed.ts` to create (or promote) the initial admin. Change the password immediately in a real deployment.

## Local setup

Prerequisites: Node.js 20+, npm, a MySQL 8+ compatible database (Aiven, PlanetScale, RDS, or local MySQL/MariaDB all work — anything Prisma's `adapter-mariadb` can reach over TCP).

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma generate
npx prisma db push          # creates all tables from schema.prisma
npx prisma db seed          # creates the initial admin user
npm run dev
```

Open http://localhost:3000. Register a normal account, or sign in with the seeded admin credentials to see `/admin`.

### MySQL setup

Any managed MySQL works. If you don't have one:
- **Aiven** (used to build this project): create a MySQL service, copy its connection string as-is into `DATABASE_URL` — it already includes `?ssl-mode=REQUIRED`.
- **Local MySQL**: `DATABASE_URL="mysql://root:password@localhost:3306/jobtracker"` (no `ssl-mode` needed for local).
- **Docker**: see the Docker section below.

### Prisma workflow

This project uses Prisma 7's config-file architecture — the datasource URL lives in `prisma.config.ts`, **not** in `schema.prisma`, and `PrismaClient` requires an explicit driver adapter (already wired up in `src/lib/db/index.ts`). Day to day:

```bash
npx prisma studio           # browse data
npx prisma db push          # push schema changes to the DB (dev)
npx prisma migrate dev      # generate a real migration (once you want migration history)
npx prisma generate         # regenerate the client after any schema.prisma change
```

### Seeding

```bash
npx prisma db seed
```

Creates/promotes the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Safe to re-run — it's idempotent.

## Development

```bash
npm run dev          # Turbopack dev server
npm run lint          # ESLint
npx tsc --noEmit      # type check
```

> **Windows note:** `lsof -ti:PORT | xargs kill` does not reliably kill Windows `node.exe` processes. Use `tasklist //FI "IMAGENAME eq node.exe"` then `taskkill //PID <pid> //F`. This matters specifically after editing `src/proxy.ts`, `src/auth.ts`, or `src/auth.config.ts` — middleware/auth-config changes need a full process restart, Turbopack's HMR does not reliably pick them up.

## Production build

```bash
npm run build
npm run start
```

## Docker

```bash
docker build -t jobtrack .
docker run -p 3000:3000 --env-file .env jobtrack
```

Or with a local MySQL alongside it:

```bash
docker compose up --build
```

## Deployment (AWS EC2 + Nginx + PM2)

1. Provision an EC2 instance (or any Linux VM), install Node.js 20+ and MySQL (or point at RDS/Aurora).
2. Clone the repo, `npm ci`, copy `.env` with production values, `npx prisma generate && npx prisma db push`.
3. `npm run build`.
4. Run under PM2 so it survives reboots and restarts on crash:
   ```bash
   npm install -g pm2
   pm2 start npm --name jobtrack -- start
   pm2 save
   pm2 startup   # follow the printed instructions to enable on boot
   ```
5. Put Nginx in front as a reverse proxy (TLS termination + gzip):
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
   Then run `certbot --nginx` for a free TLS cert.

### Vercel

Works as-is, including resume uploads — file storage is Cloudinary (not the local filesystem), so it isn't affected by Vercel's ephemeral/multi-instance filesystem. Just set the `CLOUDINARY_*` env vars in the Vercel project settings the same way as any other env var.

## CI/CD

Minimal GitHub Actions workflow (`.github/workflows/ci.yml`) runs typecheck, lint, and build on every push/PR — see that file. Extend it with a deploy step (SSH + PM2 reload, or a Vercel/Docker deploy action) once you've picked a host.

## Security

- Passwords hashed with bcrypt (12 rounds), never logged or returned by any API response.
- Every API route re-verifies the session against the database (not just the JWT) so a deactivated account or role change takes effect immediately, not after token expiry.
- Zod validates every write at the API boundary; service functions never trust client-supplied ownership — every query is scoped by the authenticated `userId`.
- Resumes are stored in Cloudinary with `type: "private"` (not the default public delivery type). Downloads check record ownership in the database first, then the server generates a signed URL with a 60-second expiry and streams the bytes back through our own API route — the raw Cloudinary URL is never exposed to the browser.
- Password-reset requests respond identically whether or not the email exists, to avoid account enumeration.
- `.env` is git-ignored; never commit real credentials. Rotate `AUTH_SECRET` and the admin password before any real deployment.

## API reference (selected)

All responses follow `{ success: true, data }` or `{ success: false, error: { message } }`. Every route below requires an authenticated session; `/api/admin/*` additionally requires `role: ADMIN`.

```text
POST   /api/applications                 GET  /api/applications
GET    /api/applications/:id             PATCH /api/applications/:id            DELETE /api/applications/:id
PATCH  /api/applications/:id/status
POST   /api/applications/:id/activities
POST   /api/applications/:id/notes

POST   /api/companies                    GET  /api/companies
GET    /api/companies/:id                PATCH /api/companies/:id               DELETE /api/companies/:id

POST   /api/contacts                     GET  /api/contacts
GET    /api/contacts/:id                 PATCH /api/contacts/:id                DELETE /api/contacts/:id

POST   /api/interviews                   GET  /api/interviews
GET    /api/interviews/:id               PATCH /api/interviews/:id              DELETE /api/interviews/:id
POST   /api/interviews/:id/feedback
POST   /api/interviews/:id/questions

GET    /api/calendar?start=&end=

POST   /api/followups                    GET  /api/followups                    PATCH/DELETE /api/followups/:id
POST   /api/tasks                        GET  /api/tasks                        PATCH/DELETE /api/tasks/:id

POST   /api/resumes (multipart)          GET  /api/resumes
POST   /api/resumes/:id/default          GET  /api/resumes/:id/download         DELETE /api/resumes/:id

GET    /api/notifications                POST /api/notifications/mark-all-read  PATCH /api/notifications/:id

PATCH  /api/settings/profile             POST /api/settings/password            POST /api/goals

GET    /api/admin/users                  PATCH/DELETE /api/admin/users/:id
GET    /api/admin/analytics
```

## Known limitations / next steps

- Google OAuth is wired up but untested without real credentials.
- AI-adjacent features described in the original spec (job description parsing, resume match scoring, AI-generated interview prep) are intentionally not implemented — no fake AI. The service-layer pattern (`src/lib/services/*`) is ready to host a real provider call behind a clean function boundary whenever one is added.
