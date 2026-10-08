# Dashboard overview

The approved dashboard connects the saved wedding, Tasks, Events, Budget & Expenses and private Guest Management. Public guest RSVP/invitation sending, gallery, activities and wedding website remain `Coming soon`, without sample records or actions.

`GET /api/v1/dashboard` returns independent `tasks`, `events`, `budget` and `guests` results, each `{ status: "ready", data }` or `{ status: "error", data: null }`. Authentication errors fail the entire request. `?section=tasks`, `?section=events`, `?section=budget` or `?section=guests` returns just that section in the standard API envelope; section errors use the normal non-success HTTP response. The UI loads and retries the sections separately.

Guests uses the shared wedding-global record summary: total, pending, attending and not attending, independent of directory filters and optional people counts. View guests opens the private directory; owner/admin Add guest opens the form. Loading/errors never show invented zero counts. See ../guests/README.md for its contract.

Budget uses the shared wedding-global expense summary. It displays saved budget, expense/paid/outstanding/remaining amounts and actual utilization; unset/zero budget utilization is unavailable. Over-budget amounts are positive with an explicit label. Owner/admin actions open the budget/expense forms, while family access is view-only. No fabricated amounts appear during loading or failures. See ../expenses/README.md for the calculation and mutation contract.

Task progress uses all tasks in the authenticated wedding, independent of the bounded preview. Attention includes unfinished deadlines overdue or within the next seven rolling days, ordered earliest first and limited to three. Linked event names are resolved only within the same wedding. Counts and preview come from one aggregation. Completion uses the existing protected status mutation and reloads Tasks on success.

The next five upcoming/ongoing events use existing Events semantics and chronological ordering. Past-only weddings receive a distinct empty state. Wedding countdown compares the UTC-stored wedding calendar date with today's India calendar date; task and event instants display IST. The monogram uses groom-first initials; uploading/displaying couple photos is outside this milestone.
