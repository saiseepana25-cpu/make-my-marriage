# Make My Marriage

A responsive wedding planning and collaboration application for Indian couples and families.

The foundation, homepage, account/wedding onboarding, Events, Tasks, Dashboard, Budget & Expenses, private Guest Management and Activities are implemented. Photo uploads and public wedding functionality remain future features. The architecture is a Next.js full-stack modular monolith intended for Vercel: App Router pages and Node.js Route Handlers share feature services, MongoDB Atlas stores application data, and private AWS S3 storage is prepared for photos. Guests use /wedding/[slug] without accounts.

**/docs is the authoritative project documentation.** Read PRD.md, SYSTEM_DESIGN.md, DATABASE_DESIGN.md and API_DESIGN.md before architectural changes. The approved [authentication amendment](docs/AUTHENTICATION_DECISIONS.md) resolves onboarding, sessions, password policy and auth counter storage. Other conflicts remain in [FOUNDATION_DECISIONS.md](docs/FOUNDATION_DECISIONS.md). Read [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for the current handoff.

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
    (auth)/                   Login and two-step signup; password recovery deferred
    (dashboard)/              Dashboard and private planning pages; deferred placeholders
    wedding/[slug]/           Public guest placeholder
    api/v1/                   Health, auth, wedding and private planning APIs
  components/layout/          AppShell, header, sidebar and PageContainer
  components/shared/          Placeholder and protected placeholder components
  features/                   auth, weddings, events, tasks, guests, expenses,
                              photos, activities and family boundaries
  models/                     Eight business collections plus sessions/rate_limits
  lib/                        Cached MongoDB connection and API utilities
  services/                   storage, email, cron and rate-limit infrastructure
  config/                     Navigation and lazy server environment validation
  types/                      Shared enums, current-user DTO and API envelopes
docs/                         Authoritative V1 documents and decision register
tests/unit/                   Component, security and schema foundation tests
tests/integration/            Isolated MongoDB transaction/session/rate-limit tests
tests/e2e/                    Playwright smoke and isolated auth/planning journeys
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
Open http://localhost:3000. Configuration is lazy: marketing/auth screens,
unit tests and production builds do not require MongoDB, AWS or email credentials.

Set MONGODB_URI, MONGODB_DB_NAME and AUTH_RATE_LIMIT_SECRET in .env.local before submitting signup/login. Generate a random secret of at least 32 characters for each environment. Configure NEXT_PUBLIC_APP_URL to the exact origin used in the browser (HTTPS in production). Dashboard access requires a real, unexpired database session. There is no mock login or memory-only production database.

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
| npm run test:integration | Test auth against an isolated local MongoDB replica set |
| npm run test:e2e:list | Load Playwright config and list smoke tests without browsers |
| npm run test:e2e | Run Playwright smoke tests (Chromium needed) |
| npm run test:e2e:auth | Run all browser tests with an isolated MongoDB/server |

For actual browser tests, install Chromium separately with `npx playwright install chromium`.
No browser download is needed for test discovery. CI should install Chromium before E2E.
Playwright manages a local dev server; build/start can be used for subsequent release testing.

Integration/auth browser tests use mongodb-memory-server-core (development only) to start a real, temporary MongoDB replica set. The first run downloads an official MongoDB binary; it is cached outside source control. These tests need no Atlas credentials and do not touch existing app data. The auth browser server uses localhost:3100, ignored .next-auth-e2e output and an ignored TypeScript configuration copy so the normal local server can remain running.

Auth browser setup rejects an occupied port 3100 before allocating a test database. It also verifies a random per-run header on the health response before starting tests, so an existing application or a previous test server cannot satisfy readiness. Stop any existing server on port 3100 before running this suite.

## Environment and MongoDB

.env.example contains placeholders only; .env.local and other secret files are ignored.
Never put secrets in NEXT_PUBLIC_* variables. NEXT_PUBLIC_APP_URL is a public origin only.

Set MONGODB_URI to an Atlas connection string for a least-privilege database user.
MONGODB_DB_NAME optionally overrides the database in the URI. Configure Atlas network
access for the deployment. connectDatabase caches connection/pending promises across
development hot reload and resets failed connection attempts. Production autoIndex is
disabled. Authentication explicitly provisions its user-email, wedding-slug, session and
counter indexes lazily on the first operation. The database user must permit index creation
and transactions. Provision other feature indexes as those features are implemented.

Business models: users, weddings, events, tasks, guests, expenses, photos and activities.
Approved infrastructure models: sessions and rate_limits; see the authentication amendment.
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

Signup accepts account and wedding details and creates the wedding, OWNER and session
atomically. Passwords require at least 8 characters and at most 72 UTF-8 bytes. Sessions
use opaque random cookies, hashed tokens in MongoDB and fixed 30-day expiry. Logout
revokes the current database session. Auth mutations enforce same-origin checks,
bounded JSON and durable request limits. Email verification and password recovery are deferred.

GET /api/v1/health reports application health only. GET /api/v1/auth/me returns a safe
DTO or 401. API helpers use the documented JSON envelope, errors, ObjectId validation
and bounded pagination. The complete intended hierarchy stays in docs/API_DESIGN.md.
POST /api/v1/auth/register, /login and /logout implement account access. Protected
GET /api/v1/weddings/current derives wedding scope from the current user and ignores
browser-supplied wedding identifiers.

EmailService is provider-neutral. Its development adapter reports not-sent without
logging message content; production has no sender until an adapter is installed.
EMAIL_FROM is reserved for that integration.

RateLimiter uses atomic MongoDB counters with HMAC-protected keys and TTL cleanup.
Login limits apply to IP and IP/email pairs; signup has an IP limit. Production reads
the Vercel-provided trusted IP header; local development uses one shared local bucket.
Rate-limit configuration/storage failure rejects the operation rather than bypassing protection.

ReminderService and CRON_SECRET checking are prepared. No Vercel schedule or cron endpoint
is enabled: the documented POST method conflicts with Vercel's GET triggers, and cadence,
event deduplication and email retry policy are pending.

## Development principles and remaining work

The GitHub Actions workflow runs typecheck, lint, unit tests, isolated integration tests,
build and Playwright discovery.
The Next lint dependency tree currently has five development-only high audit findings;
no patched braces release is available. Runtime audit reports none. See the decision
register for the compatibility limitation; do not force-downgrade the Next lint config.

Keep Node-only database/storage/auth modules server-only. Keep business logic out of pages.
Derive private weddingId from the current user; explicitly allowlist public DTOs. Follow
the documented V1 scope, hard deletes and controlled cascade rules. Use npm and Tailwind
only. Report documentation conflicts and stop the affected implementation.

Planning CRUD, invitation/reset workflows, public data/RSVP, upload orchestration,
real email and reminders remain unimplemented. The full conflict list and required clarifications are in
[FOUNDATION_DECISIONS.md](docs/FOUNDATION_DECISIONS.md).
