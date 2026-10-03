# Foundation decisions and implementation boundaries

The four original V1 documents remain unchanged and authoritative. This file records conflicts discovered during scaffolding; it does not resolve or override them.

## Conflicts requiring clarification

| Area | Conflicting sources | Clarification required / scaffold boundary |
| --- | --- | --- |
| Public website passwords | PRD FR-17/18, 14.4 and acceptance criteria require passwords; SYSTEM_DESIGN §15 excludes them; DATABASE_DESIGN has no password field. | Decide whether password protection belongs in V1. No password gate or password field is implemented. |
| Households | PRD FR-10/11/15 and acceptance criteria require household records/RSVP; DATABASE_DESIGN §5.5/12 and API_DESIGN §12 use individual guests and exclude a households collection. | Confirm individual guests plus optional familyName versus household entities. No household architecture is implemented. |
| Receipts/documents | PRD FR-09/24 includes attachments; SYSTEM_DESIGN §10/15, DATABASE_DESIGN §12 and API_DESIGN §24 exclude them. | Confirm the narrowed image-only scope. No attachment architecture is implemented. |
| Internal notifications | PRD FR-22 requires read/unread notifications; SYSTEM_DESIGN §3 specifies email only; DATABASE_DESIGN §12 excludes notifications. | Confirm email plus activities versus a notification center. No notification center/collection is implemented. |
| Registration/onboarding | API_DESIGN §6 allows users without weddingId and §8 creates a wedding after authentication; DATABASE_DESIGN §5.1 requires weddingId and §9.1 creates the wedding and OWNER together. | Choose atomic wedding/owner onboarding or amend the user schema. The model follows the exact DB contract; no registration persistence is implemented. |
| Invitations | API_DESIGN §6 requires signed invitation tokens; SYSTEM_DESIGN §15 excludes invitation tokens. | Clarify whether stateless signed family invitations are allowed or all invitation tokens are excluded. No token mechanism is chosen. |
| Authentication scope | PRD FR-01/§20 leaves providers TBD; SYSTEM_DESIGN §3/15 and API_DESIGN §5 require email/password and exclude Google/OTP. | The user's scaffold request explicitly authorizes email/password utilities only. Alternative providers are not implemented. |
| Cron HTTP method | API_DESIGN §16 specifies POST; Vercel Cron invokes GET (https://vercel.com/docs/cron-jobs). | Approve a GET trigger or a supported integration. Only secret checking/service contracts are prepared; no live endpoint/schedule is installed. |
| Event link naming | DB illustration uses activities.eventId; DATABASE_DESIGN §5.8 and API_DESIGN §11 use relatedEventId. | Confirm the illustration correction. The model follows the detailed collection table; no deletion workflow is implemented. |
| Additional profile/event/website fields | PRD FR-02/04/26/27 and SYSTEM_DESIGN §10 discuss profile images, event covers, contact/theme/status fields not present in DATABASE_DESIGN. | Confirm additions before storing these fields. Models contain only the DB document's fields. |

## Open foundation decisions

- Session persistence: API_DESIGN requires a server-side cookie with HttpOnly, Secure in production, and SameSite. Storage, expiry, revocation, reset state and exact strategy are not defined. A SessionService contract and fail-closed adapter are provided. No JWT, authentication framework, cookie format or sessions collection is chosen.
- Password strength: the credential foundation enforces non-empty passwords and bcrypt's 72-byte UTF-8 limit only. Approve the registration/reset minimum-strength policy before enabling account creation; these helpers are not a completed signup workflow.
- Durable rate limits: API_DESIGN §19 permits MongoDB counters but DATABASE_DESIGN §2/3 permits only eight collections. Decide where atomic counters/TTL expiry belong before enabling sensitive endpoints. An interface and unavailable adapter are provided; no in-memory production limiter or ninth collection is created.
- Email: provider, launch notification scope, delivery retry/idempotency policy remain open. A development adapter reports `not-sent`; production defaults to unavailable.
- Uploads: maximum file size, allowed image formats and per-wedding storage quotas need approval. The S3 utility requires an explicit policy from its caller. No presign/complete endpoint is enabled. Completion must verify object ownership, MIME type and size using S3 before inserting metadata, never trust a client-reported successful upload.
- Reminders: cadence, event reminder deduplication/state (not in events schema), retry and delivery policy remain open. Task reminderSentAt is retained exactly as documented. No schedule is installed.

## Dependency compatibility and audit

During the scaffold review follow-up, the user explicitly approved Zod solely as a transitive dependency of Next.js lint tooling. Application dependencies/imports of Zod remain prohibited. This exception does not select an application validation framework or change the database/API contracts.

The baseline was generated with create-next-app 16.3.8 (Next.js 16.3.8 / React 19.2.8). Node types match the Node 22 runtime. Next's bundled React/import/accessibility lint plugins require ESLint 9 peer ranges; ESLint 10 was checked and is incompatible with those ranges, so the scaffold uses the latest compatible ESLint 9 release (currently marked deprecated by npm).

The full npm audit reports five high findings in the development-only Next lint dependency chain: braces -> micromatch -> fast-glob -> @next/eslint-plugin-next -> eslint-config-next. The current braces release is 3.0.3 and is affected; no patched release was available during scaffolding. npm audit's suggested downgrade of eslint-config-next to 14.2.35 would break the approved current Next baseline and was not applied. Runtime-only audit (npm audit --omit=dev) reports zero vulnerabilities. Revisit the lint chain when upstream publishes a compatible fix; this is an unresolved tooling limitation.

Rechecked on 2026-10-03 during the review fixes: `npm view braces version` still reports 3.0.3 and the full audit still reports the same five findings. No compatible patched braces release is available, so no dependency downgrade or forced audit fix is applied.

## Safe foundation behavior

Marketing, auth and public wedding routes are static placeholders with no domain data. Dashboard routes use the server-side current-user boundary and redirect unauthenticated visitors to login. The session adapter returns no user until a strategy is integrated; there is no mock login or authorization bypass.

The only active APIs are `/api/v1/health` (no service connection) and `/api/v1/auth/me` (protected, safe DTO). Other API paths stay documented in API_DESIGN rather than becoming misleading CRUD stubs.

Models express field validation, references, exact enums, indexes and timestamp policies. ObjectId references do not enforce referential integrity: future services must verify same-wedding relationships. Deletion services must clear eventId on tasks/expenses/photos and relatedEventId on activities, preserve child records, delete photos in both stores, and coordinate an OWNER-only wedding cascade. No destructive workflows are scaffolded as working features.
