# Guests

Guest Management is implemented from the approved Stitch desktop designs (2026-10-08), with responsive layouts. Each guest is one individual record. `familyName` is an optional label; deleting a guest does not delete other records sharing that label. This increment uses the documented Guest schema without adding fields, indexes or collections. The broader PRD household conflict remains unresolved; no household workflow is implemented.

## Private routes and permissions

- `/guests`: wedding-global record totals, paginated directory, literal search across name/family/phone/email, exact family and attendance filters, and independent summary/list loading and retry.
- `/guests/new`, `/guests/[guestId]/edit`: OWNER/ADMIN creation and editing. FAMILY_MEMBER is redirected to the directory.
- `/guests/[guestId]`: contact, family label, attendance counts/status, free-text notes and IST timestamps. FAMILY_MEMBER can read, with no mutation controls.
- The dashboard guest card uses real saved totals and an independent loading/error/retry boundary. Guests is enabled in the workspace navigation.

All service operations resolve the authenticated user and central permissions. Queries, aggregation and mutations derive wedding scope from that user; supplied wedding IDs cannot override it. Private serialized responses allowlist guest fields and metadata. Guest mutations enforce same-origin requests, bounded JSON, and the existing durable MongoDB limiter (60 attempts per user per minute).

## API contract

`GET /api/v1/guests` accepts optional `search` (up to 120 characters), `rsvpStatus`, exact `familyName` or `withoutFamily=true`, `page` and `limit` (default 20, maximum 100). Combining both family selectors is invalid. It returns `{ guests, families, pagination }`; family options cover the wedding independently of filters. Results sort by createdAt and ID descending. The UI requests eight records per page. Search text is escaped before MongoDB matching.

`GET /api/v1/guests/summary` and `GET /api/v1/dashboard?section=guests` return `{ total, pending, attending, notAttending }`. These count guest **records**, not optional people counts, and remain independent of directory filters/pagination. The full dashboard response includes a separate `guests` ready/error section.

`POST /api/v1/guests`, `PUT /api/v1/guests/[guestId]`, and `DELETE /api/v1/guests/[guestId]` require OWNER/ADMIN. A private GET is also available for one guest. Mutations allowlist precisely `name`, `phone`, `email`, `familyName`, `numberInvited`, `numberAttending`, `rsvpStatus`, and `notes`; name and status are required when creating. Partial updates preserve omitted fields. Optional text/count fields can be cleared with null or empty values; counts are nonnegative safe whole numbers, blank is distinct from zero, and no count is inferred from attendance status. Bounds: name/family 120, phone 80, email 254, notes 5000 characters. Email is normalized and validated when supplied.

Creation records an initial `rsvpUpdatedAt`. Later updates change it only when saved `rsvpStatus` or `numberAttending` changes; name/contact/family/notes/invited edits and identical attendance saves preserve it. Transactions retry concurrent partial edits without dropping unrelated fields. Normal createdAt/updatedAt remain database-managed. Deletion is scoped and hard, returning 204; missing or foreign records return 404.

## Interaction and scope boundaries

Forms retain input after failed saves, focus invalid fields and lock actions during requests. Delete confirmation focuses Cancel, supports Escape when idle, returns focus, prevents duplicate requests and supports retry. Successful deletion refreshes record totals; other same-family records remain intact. Empty, no-match, loading, independent error, read-only and unavailable states use the approved design direction.

Attendance is maintained by the family. Guest self-service RSVP and invitation sending remain Coming soon. Phone/email links open default apps and do not send invitations. Public matching, collision handling, household grouping, guest accounts, imports/exports, receipts, seating, accommodation and transportation are outside this increment. Public endpoints will need their own safe DTOs and durable limits before implementation.

Validation lives in `tests/unit/guests.test.tsx`, `tests/integration/guests.test.ts` and `tests/e2e/guests-flow.spec.ts`. Integration/browser mutations use guarded disposable local databases, never Atlas. Run the browser flow with the isolated `npm run test:e2e:auth` configuration; ordinary smoke discovery excludes mutating flows.
