# Make My Marriage — Project Status

Last updated: **2026-10-03**

This is the living implementation log for Make My Marriage. Read it before starting development and update it after each major feature or substantial feature change. It records what exists, what was verified, and what remains to be built.

The product and technical specifications remain in [PRD.md](PRD.md), [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [API_DESIGN.md](API_DESIGN.md), and [DATABASE_DESIGN.md](DATABASE_DESIGN.md). Known conflicts and unresolved decisions are recorded in [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md). This progress log does not resolve or override those specifications.

## Current state

The foundation scaffold and the approved Stitch homepage are implemented. The app runs locally at `http://localhost:3000/`. The homepage is ready for local review; the wedding planning product still needs its functional features.

Authentication, dashboard feature pages, and the public wedding route currently contain scaffolding or placeholders. Homepage product previews use illustrative sample data. Signup and login links lead to existing scaffold pages; account creation and login are not enabled.

## Milestone summary

| Milestone | Status | Progress entry |
| --- | --- | --- |
| Foundation scaffold | Completed within foundation scope | Recorded 2026-10-03; original completion date was not tracked here |
| Landing page / homepage | Implemented and verified locally | 2026-10-03 |
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

## Next handoff

The next feature will be agreed with the user before implementation, continuing development in small increments. Consult [FOUNDATION_DECISIONS.md](FOUNDATION_DECISIONS.md) when the chosen feature touches unresolved specifications, authentication, rate limiting, email, uploads, or reminders.

## How to maintain this file

1. Update the last-updated date and milestone summary after a major feature or substantial feature change.
2. Append a dated progress entry describing what was implemented and the relevant files or routes.
3. Record only checks actually run, with their results. Distinguish historical verification from new checks.
4. Record remaining limitations, partial work, unresolved decisions, and the next agreed step.
5. Preserve earlier milestone entries. Do not mark planned features, placeholders, or unverified integrations as complete.
