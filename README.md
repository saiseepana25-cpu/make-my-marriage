# Make My Marriage

A responsive wedding planning and collaboration application for Indian couples and families.

This repository is a **foundation scaffold**, not a feature-complete application. It uses a Next.js full-stack modular monolith deployed to Vercel: App Router pages and Node.js Route Handlers share feature services, MongoDB Atlas stores application data, and private AWS S3 storage holds photos. Guests use /wedding/[slug] without accounts.

**/docs is the authoritative project documentation.** Read PRD.md, SYSTEM_DESIGN.md, DATABASE_DESIGN.md and API_DESIGN.md before architectural changes. Their original contents are preserved. Conflicts and pending decisions are recorded in [FOUNDATION_DECISIONS.md](docs/FOUNDATION_DECISIONS.md); this report does not amend the specifications.

## Stack

Next.js and React (current stable create-next-app baseline), TypeScript strict mode,
Tailwind CSS, npm, MongoDB Atlas/Mongoose, bcryptjs, AWS SDK v3, Vercel/Vercel Cron,
Vitest, React Testing Library, jest-dom, user-event, jsdom and Playwright.
No concrete email/auth provider or application validation framework is installed.
Zod is present only as a transitive dependency of Next.js lint tooling. That tooling-only
dependency is approved; do not add Zod as an application dependency or import it in application code.

## Structure

```text
src/
  app/
    (marketing)/              Homepage and marketing layout
    (auth)/                   Login, signup, forgot-password placeholders
    (dashboard)/              Protected planning placeholder pages
    wedding/[slug]/           Public guest placeholder
    api/v1/                   Health and protected auth/me; future API boundaries
  components/layout/          AppShell, header, sidebar and PageContainer
  components/shared/          Placeholder and protected placeholder components
  features/                   auth, weddings, events, tasks, guests, expenses,
                              photos, activities and family boundaries
  models/                     Exactly eight documented Mongoose collections
  lib/                        Cached MongoDB connection and API utilities
  services/                   storage, email, cron and rate-limit infrastructure
  config/                     Navigation and lazy server environment validation
  types/                      Shared enums, current-user DTO and API envelopes
docs/                         Authoritative V1 documents and decision register
tests/unit/                   Component, security and schema foundation tests
tests/e2e/                    Playwright routing/access smoke tests
public/                       Reviewed static assets only
```

Add UI primitives and hooks when a real feature needs them; no empty directory tree is maintained.

## Local setup

Use Node.js 22.15+ (or a compatible newer LTS), npm and the committed package-lock.json.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local`. If the local execution policy blocks npm.ps1/npx.ps1, use `npm.cmd`/`npx.cmd`.
Open http://localhost:3000. Configuration is lazy: marketing/auth/public placeholders,
unit tests and production builds do not require MongoDB, AWS or email credentials.

Dashboard pages intentionally redirect to login until a real session adapter is configured.
The login/signup/reset screens are placeholders; no mock login or signup persistence exists.

## Commands

| Command | Purpose |
| --- | --- |
| npm run dev | Next.js development server |
| npm run build | Production compilation |
| npm run start | Run the compiled production server |
| npm run lint | ESLint with no warnings allowed |
| npm run typecheck | Generate current route types, then tsc --noEmit |
| npm run test | Run Vitest once |
| npm run test:watch | Watch unit/component tests |
| npm run test:e2e:list | Load Playwright config and list smoke tests without browsers |
| npm run test:e2e | Run Playwright smoke tests (Chromium needed) |

For actual browser tests, install Chromium separately with `npx playwright install chromium`.
No browser download is needed for test discovery. CI should install Chromium before E2E.
Playwright manages a local dev server; build/start can be used for subsequent release testing.

## Environment and MongoDB

.env.example contains placeholders only; .env.local and other secret files are ignored.
Never put secrets in NEXT_PUBLIC_* variables. NEXT_PUBLIC_APP_URL is a public origin only.

Set MONGODB_URI to an Atlas connection string for a least-privilege database user.
MONGODB_DB_NAME optionally overrides the database in the URI. Configure Atlas network
access for the deployment. connectDatabase caches connection/pending promises across
development hot reload and resets failed connection attempts. Production autoIndex is
disabled: provision and verify the schema-declared unique/query indexes through a
controlled database deployment before serving traffic (unique is an index, not a validator).

Models: users, weddings, events, tasks, guests, expenses, photos and activities.
All references are ObjectIds. Tasks/expenses/photos may omit eventId; activities use
relatedEventId. Photos/activities have createdAt only; the other collections have both
timestamps. References do not enforce relationship existence or wedding membership;
future services must validate both. Models perform enum/numeric validation but do not
implement CRUD or controlled deletion.

## AWS S3

Configure AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
(and AWS_SESSION_TOKEN for temporary credentials). Use a private bucket with Block
Public Access, suitable encryption, least-privilege IAM permissions and CORS permitting
PUT from approved app origins with Content-Type. Presigned URLs expire after five minutes.

The storage utility validates raster MIME types against a caller-provided upload policy
and uses randomized weddings/{weddingId}/gallery/ keys. The browser uploads directly to
S3; files never pass through Next.js. HEAD verification checks uploaded size/type before
metadata persistence. Completion must bind the object to its issued upload authorization,
check tenant/event scope, and enforce the approved quota. No live upload endpoint exists.
Maximum image size, MIME policy and storage allowance remain pending.
Upload URLs bind Content-Type and Content-Length; send the returned headers and the
original File/Blob as the PUT body. Optional SDK checksums are disabled during presigning
because the application server does not have the file body.

## Authentication, services and APIs

Password hashing/comparison and typed credential parsers are implemented. Central
permission helpers enforce OWNER/ADMIN/FAMILY_MEMBER rules, assigned tasks, uploader
photo deletion and read-only SYSTEM activities. There is no authenticated GUEST role.

SessionService is an integration contract, with a deny-by-default adapter. Cookie
persistence, expiry, revocation and reset strategy still need approval; no JWT or
undocumented collection was selected. Registration persistence awaits the required
weddingId/onboarding conflict. Future mutations require appropriate same-origin/CSRF checks.

GET /api/v1/health reports application health only. GET /api/v1/auth/me returns a safe
DTO or 401. API helpers use the documented JSON envelope, errors, ObjectId validation
and bounded pagination. The complete intended hierarchy stays in docs/API_DESIGN.md.

EmailService is provider-neutral. Its development adapter reports not-sent without
logging message content; production has no sender until an adapter is installed.
EMAIL_FROM is reserved for that integration.

RateLimiter is a fail-closed contract. Durable MongoDB counters require an approved
storage/TTL design compatible with the eight-collection restriction. No instance-local
production limiter or extra collection is introduced.

ReminderService and CRON_SECRET checking are prepared. No Vercel schedule or cron endpoint
is enabled: the documented POST method conflicts with Vercel's GET triggers, and cadence,
event deduplication and email retry policy are pending.

## Development principles and remaining work

The GitHub Actions workflow runs typecheck, lint, unit tests, build and Playwright discovery.
The Next lint dependency tree currently has five development-only high audit findings;
no patched braces release is available. Runtime audit reports none. See the decision
register for the compatibility limitation; do not force-downgrade the Next lint config.

Keep Node-only database/storage/auth modules server-only. Keep business logic out of pages.
Derive private weddingId from the current user; explicitly allowlist public DTOs. Follow
the documented V1 scope, hard deletes and controlled cascade rules. Use npm and Tailwind
only. Report documentation conflicts and stop the affected implementation.

Feature CRUD, account/session persistence, invitation/reset workflows, public data/RSVP,
upload orchestration, real email, durable rate limits and reminders are intentionally
not implemented. The full conflict list and required clarifications are in
[FOUNDATION_DECISIONS.md](docs/FOUNDATION_DECISIONS.md).
