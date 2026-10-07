# Dashboard overview

The approved dashboard milestone connects the saved wedding, Tasks and Events. Future budget, guests/RSVP, gallery, activities and wedding website modules display `Coming soon`, without sample records or actions.

`GET /api/v1/dashboard` returns independent `tasks` and `events` results, each `{ status: "ready", data }` or `{ status: "error", data: null }`. Authentication errors fail the entire request. `?section=tasks` or `?section=events` returns just that section in the standard API envelope; section errors use the normal non-success HTTP response. The UI loads and retries the sections separately.

Task progress uses all tasks in the authenticated wedding, independent of the bounded preview. Attention includes unfinished deadlines overdue or within the next seven rolling days, ordered earliest first and limited to three. Linked event names are resolved only within the same wedding. Counts and preview come from one aggregation. Completion uses the existing protected status mutation and reloads Tasks on success.

The next five upcoming/ongoing events use existing Events semantics and chronological ordering. Past-only weddings receive a distinct empty state. Wedding countdown compares the UTC-stored wedding calendar date with today's India calendar date; task and event instants display IST. The monogram uses groom-first initials; uploading/displaying couple photos is outside this milestone.
