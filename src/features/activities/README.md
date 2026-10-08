# Activities

Private wedding feed implemented from the approved Stitch desktop references, with responsive layouts. The existing schema is unchanged: category maps to `activityType`, event to `relatedEventId`, and only `createdAt` is stored.

## Manual updates

`GET`/`POST /api/v1/activities` and `GET`/`PUT`/`DELETE /api/v1/activities/[activityId]` resolve wedding scope from the session. Title is required, at most 120 characters; description/category are optional, at most 5000/80 characters. An optional existing same-wedding event may be selected. Omitted update fields survive; null/empty optional fields clear. Scope, author, source and creation time are server-controlled. Editing preserves original chronology and authorship.

All roles can read/create. Central `canModifyActivity` allows OWNER/ADMIN to edit/delete any manual update and FAMILY_MEMBER only their own. SYSTEM records cannot be changed by any role through normal routes. Foreign records are unavailable, and referenced member/event names are scoped independently. Mutations require same origin, bounded 32 KiB JSON and the existing durable counters (60 per user per minute). Only the documented weddingId index is provisioned lazily.

Lists support literal title/description `search` (maximum 120), `sourceType=MANUAL|SYSTEM`, and `relatedEventId=<ObjectId>|wedding-wide`. Common pagination defaults to 20/max 100; the UI requests ten. Ordering is descending createdAt then _id. India-time Today/Yesterday grouping uses the server asOf value. Group counts describe the displayed page. No samples or historical backfill are inserted.

## Automatic recording

Planning services commit their actual mutation and SYSTEM activity in one transaction, including retries. Recording failures roll back the mutation. Supported triggers: event creation, task transitions into Completed (including creation as completed), expense creation, guest creation and real attendance/status/count changes. Identical completed/attendance saves and unrelated guest edits do not add entries. Guest entries describe organizer-maintained attendance, without claiming self-service RSVP or invitation delivery. Categories: Events, Tasks, Expenses and Guests.

Event references are locked through the existing event updatedAt, coordinating with transactional event deletion. Event deletion retains both source types and clears relatedEventId. Deleting a manual update removes only that activity. No related-task/expense/guest reference or audit fields are invented. Member names are resolved for attribution, with Former member for missing accounts.

## Dashboard and interactions

`GET /api/v1/dashboard?section=activities` returns the newest three actual updates. The aggregate dashboard response includes an independent activities ready/error section. Its card loads/retries independently, and successful dashboard task completion refreshes it. Other changes appear on navigation/reload/Retry; cross-browser live synchronization is deferred.

Overview, add/edit with unsaved preview, manual/automatic details, confirmed deletion, loading, empty/no-results, unavailable records and recoverable failures are supported. Failed saves retain all four inputs. Pending actions guard duplicate submission and closing; native deletion dialogs focus Cancel and support Escape/focus return. Reference-only state/permissions boards become product behavior, not additional pages.

Photo/public-RSVP activity, family account invitations, email, notification-center entities, historical backfill and generated entries for other mutations remain future work.
