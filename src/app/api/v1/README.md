# V1 Route Handler boundary

Use the exact paths/methods in docs/API_DESIGN.md; run every handler on Node.js.
Implemented routes:
- GET /api/v1/health: process health only, no service connectivity claim.
- GET /api/v1/auth/me: resolves a safe current-user DTO or returns 401.
- POST /api/v1/auth/register: atomically creates wedding, OWNER and session.
- POST /api/v1/auth/login: verifies credentials and replaces this browser's session.
- POST /api/v1/auth/logout: revokes the current session and expires the cookie.
- GET /api/v1/weddings/current: returns the server-resolved user's wedding details.

Future groups: auth, members, weddings/current, dashboard, budget, events, tasks,
activities, guests, expenses, photos/presign and photos/complete,
public/weddings/[slug] (including RSVP and guest photo uploads), internal/cron/reminders.

Do not generate inert CRUD files. Add concrete handlers with feature development.
Auth onboarding/session/counter decisions are approved in docs/AUTHENTICATION_DECISIONS.md.
Invitation/reset and cron contracts remain deferred or unresolved as described in
docs/FOUNDATION_DECISIONS.md.

Use handleApi/apiSuccess, validate unknown input, requireCurrentUser/requirePermission,
then derive query scope from the current user. Public mutations must consume durable
rate limits; private mutations must also enforce same-origin/CSRF protection.
Never return raw database documents from public endpoints.

Mongoose refs only validate shape, not existence or tenant scope. Services must verify
the wedding for every resource, assignee, event and photo key. API errors must not
expose secrets/stack traces. Lists use page 1/limit 20/max 100 and reject invalid filters.
No file binaries pass through Route Handlers: browsers upload to S3 directly.

handleApi accepts an optional constant operation label such as "auth.me" for safe
server diagnostics; never pass request data as that label. Mongoose validation/cast
errors return 400 and duplicate-key errors return 409 without exposing driver messages
or submitted values. Unexpected failures log an error ID, operation, error category,
and applicable numeric database code or missing configuration name, never raw errors.
