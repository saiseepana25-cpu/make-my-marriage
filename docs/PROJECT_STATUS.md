# Make My Marriage — Project Status

Last updated: **2026-10-05**

This is the living implementation log for Make My Marriage. Read it before starting development and update it after each major feature or substantial feature change. It records what exists, what was verified, and what remains to be built.

The product and technical specifications remain in [PRD.md](PRD.md), [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [API_DESIGN.md](API_DESIGN.md), and [DATABASE_DESIGN.md](DATABASE_DESIGN.md). Known conflicts and unresolved decisions are recorded in [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md). This progress log does not resolve or override those specifications.

## Current state

The foundation scaffold, approved Stitch homepage, authentication with wedding onboarding, and the first planning feature, Events management, are implemented. The local preview uses `http://localhost:3000/`. Authentication has been verified with isolated MongoDB replica sets and manual browser signup, login, and logout against the configured Atlas database `make-my-marriage`. Events has been verified against isolated replica sets and desktop/mobile browser flows, plus manual Atlas-backed creation, editing, persistence, and upcoming/past filtering in a separate QA wedding. No Atlas event records were deleted during validation.

Signup creates an OWNER account and wedding together, then opens a protected welcome dashboard. Login and logout use persisted 30-day sessions. Events now supports persisted creation, chronological upcoming/past lists, details, editing, and transactional deletion. Other planning modules, dashboard aggregates, and the public wedding route remain scaffolding or placeholders. Homepage product previews use illustrative sample data; Events never seeds those samples into a wedding.

Wedding setup, dashboard couple headings, workspace navigation, and newly generated slugs use groom-first name order. The latest regression results are 59 unit tests across 13 files, 15 isolated integration tests, and 11 isolated browser tests, all passing. Typecheck, lint, build, and standard browser-test discovery also passed during the Events milestone. Production deployment remains unverified.

## Milestone summary

| Milestone | Status | Progress entry |
| --- | --- | --- |
| Foundation scaffold | Completed within foundation scope | Recorded 2026-10-03; original completion date was not tracked here |
| Landing page / homepage | Implemented and verified locally | 2026-10-03 |
| Authentication and wedding onboarding | Verified with isolated databases and manual Atlas-backed auth flows | 2026-10-05 |
| Auth browser server isolation | Startup race reproduced and fixed; regression and browser checks passed | 2026-10-05 |
| Groom-first couple name order | Implemented; unit and desktop/mobile authentication checks passed | 2026-10-05 |
| Manual Atlas authentication and navigation review | Completed locally; QA account retained and browser signed out | 2026-10-05 |
| Events management | Implemented; isolated regressions and manual Atlas create/edit/read flows passed | 2026-10-05 |
| Manual review after Events code-review changes | Completed; no blocking issue found in checked flows, QA records retained, browser signed out | 2026-10-05 |
| Other wedding planning features | Pending | Select the next feature and its designs after committing and pushing Events |

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

### 2026-10-05 — Events management implemented from approved Stitch designs

The user finalized the six Events screens in Stitch and their mobile counterparts: **Events — Overview**, **Empty State**, **Add Event**, **Edit Event**, **Details**, and **Delete Confirmation**, in project `9719362010133116550`. Built the agreed Events scope using those layouts, existing Manrope/Playfair fonts, burgundy colors, rounded cards, and responsive navigation.

Implemented:

- `/events`, `/events/new`, `/events/[eventId]`, and `/events/[eventId]/edit`, with loading, retry, unavailable-event, empty, inline validation, saving, and success states.
- Chronological, paginated upcoming/past views with real counts. Events with an end time remain upcoming while in progress; events without an end time use their start for classification.
- Required event name, date, start time, and venue; optional end time/date, address/landmarks, and description/notes. IST is explicit throughout the UI, with overnight events supported through existing `startAt`/`endAt` DateTime fields. Address and notes map to the documented `location` and `description` fields. No collection or schema field was added.
- Authenticated `GET`/`POST /api/v1/events` and `GET`/`PUT`/`DELETE /api/v1/events/[eventId]`. Services derive wedding scope and authorship from the session and enforce centralized OWNER/ADMIN management and FAMILY_MEMBER read permissions. Optional documented API fields `status` and `livestreamUrl` are validated/preserved; unknown ownership/scope fields cannot alter access.
- Same-origin mutation checks, bounded 32 KiB event JSON bodies, and a durable per-user limit of 60 event mutations per minute using the existing approved `rate_limits` collection. Authentication JSON limits remain 16 KiB.
- Transactional updates validate the resulting start/end ordering. Transactional event deletion clears `eventId` on tasks/expenses/photos and `relatedEventId` on activities, preserving those records and their photo storage metadata. Failures roll back event deletion and earlier unlink writes.
- Stitch-based shared desktop sidebar with active navigation and wedding/account context, plus a mobile menu supporting Escape and focus return. Forms preserve inputs on failed saves; the native modal delete dialog focuses Cancel, traps modal focus, and protects against duplicate submission.

Validation:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test -- --maxWorkers=2` | Passed: 59 tests across 13 files |
| `npm run test:integration` | Passed: 15 tests across 2 files |
| `npm run build` | Passed, including all new Events pages and API routes |
| `npm run test:e2e:list` | Passed: 7 non-mutating smoke tests discovered |
| `npm run test:e2e:auth` | Passed: 11 isolated browser tests, including Events desktop/mobile flows and existing auth/homepage regressions |
| Desktop/mobile visual review | Reviewed all six implemented views in both sizes; screenshots in ignored `test-results/events-*.png` |
| Responsive overflow | Event details passed at 320, 390, 768, 1024, and 1440 pixels; event form passed at 320, 390, and 768 pixels |
| Local preview health | `http://localhost:3000/api/v1/health` returned 200 |

Integration tests cover CRUD persistence, session-derived scope, forged IDs/ownership fields, role restrictions, chronological pagination, ongoing/past classification, partial update date validation, optional-field clearing, all four reference types, transaction rollback, origin checks, body bounds including Telugu text, and durable mutation limits. Browser tests cover create/edit/reload/delete/cancel, midnight timing persistence, past-event views, mobile validation, failed-save input retention and retry, menu Escape, modal Escape, and responsive layout.

Validation recovery: an initial isolated development-server cache returned health-route 404s; a fresh test cache restored readiness. Browser selectors were scoped to main content after the sidebar repeated the wedding date and Next's route announcer added another alert. A run with concurrent compilation/test jobs exceeded unit and browser timeouts; the final browser suite ran without competing jobs, browser allowances now cover cold route compilation, and the final unit run limited workers to two. Final checks above are successful reruns, not claims that the earlier runs passed.

Remaining scope: generated mockups also contained calendar sync, draft autosave/offline persistence, event/decoration images, guest-capacity information, notification/search widgets, and related-module data displays. These are outside the agreed Events increment or touch unresolved specifications and were not implemented. Livestream/status editing UI, system activity generation for event mutations, dashboard aggregates, and public event publishing remain deferred. Other navigation destinations remain placeholders. At this milestone's validation stage, Atlas event CRUD and deployed-production validation had not been completed. Subsequent manual Atlas creation, editing, and reading are recorded below; Atlas deletion and deployed-production validation remain unverified. No commit or push was performed for this milestone.

### 2026-10-05 — Manual review after Events code-review changes

At the user's request, tested the current working tree in the local browser with a separate **Review QA Tester** account and **Review Groom & Review Bride** wedding. Existing wedding/account data was not edited or deleted.

Manual checks passed:

- Anonymous Events access redirects to login; signup rejects missing required fields and short passwords, retains account/wedding inputs on back navigation, and opens the dashboard with the saved wedding. Refresh preserves the session.
- A fresh wedding shows the Events empty state. Quick ceremony names populate the form; required-field errors appear and invalid end-before-start timing is rejected.
- Created **QA Review — Sangeet** for 28 February 2027, 8:00 pm through 1 March, 1:00 am IST. Details correctly displayed the overnight end date, venue, address, and Telugu notes, and persisted after reload.
- Editing prepopulates saved overnight values. An end date without an end time is rejected. Renamed the event to **QA Review — Sangeet & Dinner**, updated its venue, and cleared the optional end/address/notes fields; the resulting detail page persisted those changes after reload.
- Delete confirmation initially focuses Cancel. Cancel and Escape close the dialog and retain the event. Permanent deletion was verified only by the isolated regression suites.
- At 320 pixels, event details and the add form have no horizontal overflow. The mobile workspace menu opens, closes with Escape, and restores focus to its trigger.
- Created **QA Review — Past Ceremony** on 27 February 2020. Its details identify it as a past event, the view counts show one upcoming and one past event, and the past view displays only that past ceremony.
- Opening login while authenticated redirects to the dashboard. Logout blocks subsequent direct Events access. Incorrect credentials show the generic error; valid login with uppercase email succeeds, and the saved event and counts remain available after that fresh login.
- No console warning/error entries were returned during the reviewed flows.

Fresh automated validation also passed: **59 unit/component tests across 13 files**, **15 integration tests across 2 files**, and **11 isolated browser tests**. These cover event deletion, reference preservation/rollback, role and wedding isolation, retry after failed saves, chronology, authentication expiration/revocation, and homepage regressions.

No blocking issue was found in the checked implemented flows. The separate QA account/wedding and two QA events remain in Atlas; the browser was signed out after testing. Screenshot evidence is saved outside the repository. Application code was not changed; typecheck, lint, and build were not rerun for this testing/documentation-only review.

Limitations: this validates the local development app, not a deployed production environment. Final deletion, failure injection, permissions for other roles, and transaction rollback were exercised in isolated tests rather than by modifying Atlas records. Other planning modules, public guest functionality, uploads, email, and reminders retain the implementation limits recorded above.

### 2026-10-05 — Events status checked before commit and push

Reconciled the current-state summary, milestone table, and next handoff with the completed manual review and latest regression results. Clarified that the earlier Atlas CRUD limitation was superseded for creation, editing, and reading, while Atlas deletion and production deployment remain unverified. Recorded successful fresh-login persistence and the final signed-out browser state. Preserved the dated implementation history and remaining feature limits.

This check changed only this status file. Validation: `git diff --check -- docs/PROJECT_STATUS.md` passed. No application tests were rerun and no commit or push was performed during this documentation check.

## Next handoff

Manual review of authentication and Events against the local application is complete, with no blocking issue found in the checked flows. The user has authorized committing and pushing the validated Events changes and this status update. After repository synchronization, agree the next feature and its designs before implementation. Task management is a possible next increment, not approved implementation scope yet. Consult [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md) before implementing features that touch unresolved specifications, email, uploads, or reminders.

## How to maintain this file

1. Update the last-updated date and milestone summary after a major feature or substantial feature change.
2. Append a dated progress entry describing what was implemented and the relevant files or routes.
3. Record only checks actually run, with their results. Distinguish historical verification from new checks.
4. Record remaining limitations, partial work, unresolved decisions, and the next agreed step.
5. Preserve earlier milestone entries. Do not mark planned features, placeholders, or unverified integrations as complete.
