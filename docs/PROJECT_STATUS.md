# Make My Marriage — Project Status

Last updated: **2026-10-05**

This is the living implementation log for Make My Marriage. Read it before starting development and update it after each major feature or substantial feature change. It records what exists, what was verified, and what remains to be built.

The product and technical specifications remain in [PRD.md](PRD.md), [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [API_DESIGN.md](API_DESIGN.md), and [DATABASE_DESIGN.md](DATABASE_DESIGN.md). Known conflicts and unresolved decisions are recorded in [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md). This progress log does not resolve or override those specifications.

## Current state

The foundation scaffold, approved Stitch homepage, and authentication with wedding onboarding are implemented. The local preview uses `http://localhost:3000/`. Authentication has been verified with isolated MongoDB replica sets and manual browser signup, login, and logout against the configured Atlas database `make-my-marriage`.

Signup creates an OWNER account and wedding together, then opens a protected welcome dashboard. Login and logout use persisted 30-day sessions. Dashboard planning feature pages and the public wedding route remain scaffolding or placeholders. Homepage product previews use illustrative sample data.

Wedding setup, dashboard couple headings, and newly generated slugs use groom-first name order. The latest recorded regression results are 46 unit tests across 11 files, 8 isolated integration tests, and 9 isolated browser tests, all passing. Typecheck, lint, build, and standard browser-test discovery passed during the implementation checks recorded below; they were not rerun for the later manual review or this documentation update. Production deployment remains unverified.

## Milestone summary

| Milestone | Status | Progress entry |
| --- | --- | --- |
| Foundation scaffold | Completed within foundation scope | Recorded 2026-10-03; original completion date was not tracked here |
| Landing page / homepage | Implemented and verified locally | 2026-10-03 |
| Authentication and wedding onboarding | Verified with isolated databases and manual Atlas-backed auth flows | 2026-10-05 |
| Auth browser server isolation | Startup race reproduced and fixed; regression and browser checks passed | 2026-10-05 |
| Groom-first couple name order | Implemented; unit and desktop/mobile authentication checks passed | 2026-10-05 |
| Manual Atlas authentication and navigation review | Completed locally; QA account retained and browser signed out | 2026-10-05 |
| Functional wedding planning features | Pending | Next feature has not yet been selected |

## Progress history

### 2026-10-03 — Foundation scaffold recorded

The scaffold was already built before this tracking file was introduced. This entry records its current scope, not a new implementation on this date.

Implemented:

- Next.js App Router, React, strict TypeScript, npm, and Tailwind CSS foundation.
- Marketing, authentication, dashboard, and public wedding route structure, including a dashboard shell.
- Eight Mongoose collection schemas with documented fields, enums, and indexes.
- Lazy server configuration and MongoDB connection utilities, API response/error helpers, validation, and pagination utilities.
- Password hashing with bcryptjs, centralized permissions, and a fail-closed authentication/session contract.
- Private S3 upload helpers and abstractions for email, durable rate limiting, and reminders.
- Health endpoint and protected current-user endpoint.
- Unit/component test setup, Playwright smoke tests, and CI checks.

Implementation limits:

- Authentication session persistence is unresolved; the current-user lookup does not establish a logged-in session.
- Wedding setup, member management, events, tasks, guests/RSVPs, expenses, photos, activities, and guest website functionality still require implementation.
- Infrastructure helpers and service contracts do not establish working uploads, email delivery, production rate limiting, or scheduled reminders.
- Documentation conflicts and infrastructure decisions must be resolved before implementing the affected features.

Verification: the current foundation was covered by the checks recorded under the homepage milestone below. This file does not reconstruct an earlier scaffold-only test run.

### 2026-10-03 — Landing page / homepage implemented

Built the homepage from the approved Stitch design, **Make My Marriage — Landing Page (V1 Scope Updated)**, preserving its section order and visual direction.

Implemented:

- All 15 homepage sections: hero, product promise, scattered planning, family preview, activity preview, budget preview, guest preview, dashboard preview, wedding journey, wedding memories, how it works, planning privacy, wedding suite, FAQs, and final invitation.
- Fixed responsive header, mobile navigation, footer, section anchors, and signup/login links.
- Keyboard-accessible FAQ accordions, mobile menu controls, focus treatment, skip navigation, and reduced-motion support.
- Homepage metadata, scoped styling, self-hosted fonts with licenses, and reviewed design images.
- Illustrative product previews with sample wedding data and copy aligned with the approved V1 scope.

Key implementation locations:

- [Homepage](../src/app/(marketing)/page.tsx) and [marketing layout](../src/app/(marketing)/layout.tsx).
- [Marketing components](../src/components/marketing/).
- [Landing images](../public/images/landing/) and [local fonts](../src/assets/fonts/).
- [Browser smoke tests](../tests/e2e/smoke.spec.ts).

Validation completed during homepage implementation:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test` | Passed: 8 test files, 31 tests |
| `npm run build` | Passed |
| `npm run test:e2e:list` | Passed: 7 browser tests discovered |
| `npm run test:e2e` | Passed: 7 browser tests |
| Desktop and mobile visual review | Completed locally |
| Responsive overflow and image checks | Passed at widths 320, 390, 768, 1024, and 1440 pixels |

Implementation limits: the homepage is a marketing page. Its planning previews are static; they do not add dashboard business functionality. Signup and login destinations remain scaffold pages. Production deployment is not recorded as completed.

### 2026-10-03 — Project progress tracking introduced

Added this file and development rules in [AGENTS.md](../AGENTS.md) requiring future major feature work to read and update it. Validation for this documentation change: `git diff --check`.

### 2026-10-05 — Authentication and wedding onboarding implemented

Implemented the approved two-step signup and login/logout milestone. The approved amendment in [AUTHENTICATION_DECISIONS.md](AUTHENTICATION_DECISIONS.md) defines session persistence, rate-limit storage, and the onboarding contract; the four specifications and development rules now reference it.

Implemented:

- Signup collects account details, then wedding details. A MongoDB transaction creates the wedding, OWNER account, and session together; failed writes roll back and duplicate emails do not create another wedding.
- Passwords require at least eight characters, respect bcrypt's 72-byte input limit, and are stored as bcrypt hashes. No email verification or password recovery is included in this milestone.
- Login and logout use opaque, HttpOnly cookies backed by hashed tokens in the approved `sessions` infrastructure collection. Sessions expire after 30 days; logout revokes the current session server-side.
- Authentication mutations enforce same-origin requests, bounded request bodies, and atomic, durable MongoDB rate limits in the approved `rate_limits` infrastructure collection. Production client-IP handling uses the Vercel-provided header.
- Protected current-user and current-wedding responses allowlist fields and derive wedding scope from the authenticated user. Missing, expired, forged, or revoked sessions fail closed.
- Signup, login, and the saved-wedding welcome dashboard share the homepage fonts, colors, and styling. Forms include accessible errors, password visibility controls, responsive layouts, and back-navigation input retention.
- Infrastructure setup remains lazy. Builds and unit tests do not connect to production services. Integration and browser suites use isolated temporary MongoDB replica sets, separate database names, and separate browser-test build output.

Key implementation locations:

- [Authentication services](../src/features/auth/) and [authentication API handlers](../src/app/api/v1/auth/).
- [Authentication forms](../src/components/auth/), [signup page](../src/app/(auth)/signup/page.tsx), and [login page](../src/app/(auth)/login/page.tsx).
- [Wedding service](../src/features/weddings/service.ts) and [welcome dashboard](../src/app/(dashboard)/dashboard/page.tsx).
- [Integration tests](../tests/integration/auth.test.ts) and [browser authentication tests](../tests/e2e/auth-flow.spec.ts).

Validation completed:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test` | Passed: 10 test files, 41 tests |
| `npm run test:integration` | Passed: 8 tests against an isolated MongoDB replica set |
| `npm run build` | Passed |
| `npm run test:e2e:list` | Passed: 7 standard smoke tests discovered |
| `npm run test:e2e:auth` | Passed: 9 browser tests, including the 7 smoke tests and desktop/mobile authentication flows |
| Desktop and mobile visual review | Completed; corrected header spacing at 320 pixels |
| Normal local preview | Restarted successfully; homepage, signup, login, and health endpoint returned HTTP 200 |
| `npm audit --omit=dev` | Passed: zero production dependency vulnerabilities |

Operational limitation at the time of this implementation check: Atlas was reachable but rejected the supplied database credentials with error code 8000. The connection string is stored only in ignored `.env.local`; no secret is recorded here. Credential correction and a successful Atlas ping were subsequently recorded under the server-readiness entry, and successful Atlas-backed account creation was recorded under the manual review below. Production deployment remains unverified.

Remaining scope: dashboard planning CRUD, family invitations, public guest functionality, uploads, email delivery, reminders, and the other unresolved documentation decisions are not implemented by this milestone.

### 2026-10-05 — Auth browser server readiness isolated

Verified the review finding with regression tests: the previous setup accepted a healthy response from another application or an earlier test run before its own child reported a bind failure. It also accepted a matching response after the child exited.

Implemented:

- Browser setup checks that port 3100 is available before allocating a temporary database or starting Next.js. It does not terminate an existing server.
- Each isolated server receives a fresh random run identifier. Test-only Next.js configuration adds that identifier to the health response header; setup requires an exact match and rechecks child liveness before starting browser tests.
- Missing or stale identifiers fail setup and clean up its temporary server/database. The header is absent from normal application configuration.
- Added five setup regression tests covering a foreign healthy server, an occupied port, an earlier run, successful startup/cleanup, and child exit during readiness. Documented the startup requirements in README.md.

Validation completed:

| Check | Result |
| --- | --- |
| Regression verification before the fix | Four failure-path tests reproduced the unsafe acceptance; successful-startup case passed |
| Real occupied-port verification | Setup rejected an existing HTTP listener on port 3100; zero requests reached that listener |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test` | Passed: 11 test files, 46 tests, including all five new regression tests |
| `npm run test:e2e:list` | Passed: 7 standard smoke tests discovered |
| `npm run test:e2e:auth` | Passed: 9 browser tests against an isolated temporary MongoDB replica set |
| `npm run build` | Passed |

Separate operational verification earlier in this session: after the Atlas database-user password was saved and `.env.local` corrected, a read-only Mongoose connection to `make-my-marriage` returned `ping.ok = 1`. No existing database records were changed. This verifies connectivity and authentication, not Atlas-backed registration, transaction/index permissions, or deployment.

Remaining limitations at this validation stage: authentication/browser mutations used only the temporary test database. Atlas-backed onboarding was subsequently reviewed in the manual authentication entry below; the deferred planning features remain unimplemented.

### 2026-10-05 — Groom-first couple name order

At the user's request, wedding setup now asks for the groom's name before the bride's name and focuses the groom field when opening that step. Dashboard couple headings and newly generated wedding slugs use groom-first order, such as Sai & Adya. Validation checks the name fields in that order. Existing database fields and saved slugs remain unchanged.

Validation: typecheck and lint passed; the unit suite passed 46 tests across 11 files; both existing desktop and mobile authentication browser tests passed with the updated focus and dashboard-heading expectations. `git diff --check` passed. Successful Atlas connectivity is recorded above; subsequent manual Atlas-backed onboarding validation is recorded below.

### 2026-10-05 — Manual authentication and navigation review

At the user's request, manually exercised the existing local preview at `http://localhost:3000/`, using a new account named **Manual QA Tester** and wedding **QA Groom & QA Bride**. The preview uses the configured Atlas database `make-my-marriage`; no existing user records were edited or deleted.

Manual validation completed:

- Signed-out dashboard access redirects to login.
- Signup rejects missing required fields, an invalid email, a seven-character password, and mismatched confirmation. Password show/hide works.
- Wedding setup focuses the groom field, rejects missing required details, and retains account/wedding inputs through the form's back navigation.
- Final signup creates a working account and opens the dashboard with the saved names, 28 February 2027 date, and QA location.
- Dashboard refresh preserves authentication; opening login or signup while authenticated redirects to the dashboard.
- Events, Tasks, Guests, Budget, Gallery, Family, Activities, Wedding website, and Settings navigation loads the expected placeholder page.
- Logout returns to login. Browser back, refresh, and direct dashboard navigation after logout do not display private workspace content.
- Incorrect passwords and unknown accounts show the same generic error. Valid login succeeds with uppercase email and subsequently with the original email.
- Duplicate-email signup is rejected; a subsequent login still displays the original saved wedding details.
- Desktop dashboard at 1440 pixels and mobile dashboard/signup at 320 pixels were inspected; checked pages have no horizontal overflow. Narrow login copy wraps its signup link; keyboard activation works.
- No browser console warning/error entries were returned during the reviewed flows.

Additional validation: `npm run test` passed **46 tests across 11 files**; `npm run test:integration` passed **8 tests**; `npm run test:e2e:auth` passed **9 browser tests**. Integration/browser regression suites used isolated temporary databases, covering session expiration/revocation, transaction rollback, duplicate-registration concurrency, wedding isolation, durable throttling, and homepage navigation/accessibility. These server-side checks were not destructive tests against Atlas.

No blocking issue was found in the implemented authentication flow. The QA account and wedding remain in Atlas, and the browser was signed out after testing. Screenshot evidence was saved outside the repository. No application code was changed, and typecheck/lint/build were not rerun for this testing/documentation-only review.

Remaining limitations: this was local development testing, not deployed-production validation. Planning CRUD, family invitations, public guest features, uploads, email, and reminders remain deferred. Atlas session expiry, concurrent writes, and rate-limit exhaustion were not forced; those checks ran against isolated databases. The in-app browser blocked direct API-page navigation, so authenticated response/cookie assertions rely on the successful isolated browser suite.

### 2026-10-05 — Project status reconciled before commit

Checked this log against the current authentication/onboarding implementation, groom-first naming, browser-server isolation, and recorded manual validation. Updated the current-state summary and milestone table, and clarified that earlier Atlas credential/onboarding limitations were superseded by the successful connectivity and manual reviews. Preserved the dated implementation history and deferred scope.

This is a documentation-only update. Validation: `git diff --check` passed for this file. No application tests were rerun, no database records were changed, and no commit or push was performed during this update.

## Next handoff

Manual signup, login, logout, and welcome dashboard review against the configured Atlas database is complete. The current changes remain uncommitted. The next step is to commit and push the approved work, then agree the next planning feature with the user, continuing development in small increments. Consult [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md) before implementing features that touch unresolved specifications, email, uploads, or reminders.

## How to maintain this file

1. Update the last-updated date and milestone summary after a major feature or substantial feature change.
2. Append a dated progress entry describing what was implemented and the relevant files or routes.
3. Record only checks actually run, with their results. Distinguish historical verification from new checks.
4. Record remaining limitations, partial work, unresolved decisions, and the next agreed step.
5. Preserve earlier milestone entries. Do not mark planned features, placeholders, or unverified integrations as complete.
