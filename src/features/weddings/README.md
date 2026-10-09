# Weddings

The current-wedding service requires a server-resolved authenticated user and returns an explicit wedding DTO. Atomic wedding/OWNER/session creation is implemented in the auth service following docs/AUTHENTICATION_DECISIONS.md. Keep websiteSlug unique; totalBudget remains stored on weddings.

## Wedding Settings — 2026-10-08

The approved desktop Stitch references in project `9719362010133116550` are Owner/Admin `15f46a980b3c40d785e017c1df7783bb`, Family Read Only `03da18e451d14144a111bef2496fe411`, Unsaved Changes Dialog `74ca6b2ad8614cbb993b86b20a4729a4`, and the complete State Reference `95f2bb9ad62f47b39af36695e74d562f`. The incomplete historical board `75b01acecd374b1598f5ea70799e08fd` is not an implementation reference. Responsive mobile layouts are implemented in code.

`/settings` manages exactly groomName (100), brideName (100), weddingDate (date only), and location (200). All are required; past dates are permitted, stored at midnight UTC and displayed in UTC. `PUT /api/v1/weddings/current` supports partial updates, derives scope from the session, uses centralized OWNER/ADMIN permission, same-origin checks, bounded 16 KiB JSON and durable 60-per-minute user limits. Only the four fields can change. Atomic `$set` updates retain concurrent changes to unrelated fields and return the existing safe DTO. Wedding names never regenerate websiteSlug; dates/locations never reschedule events or change their venues. No automatic activity is recorded for these updates.

The prepopulated form has a live draft preview, validation/focus, pending locks, retained failed-save values, and a successful saved baseline on the same page. Refreshing server components updates the saved workspace shell only after persistence. FAMILY_MEMBER sees saved read-only details; shared V1 credentials keep their existing account/role. Loading/retry, unavailable and expired-session states contain no sample values.

Workspace links and logout participate in the unsaved-change guard. Keep editing/Escape retains drafts and returns focus; Discard and leave resets the draft to saved values and continues the requested action, so a failed logout cannot disable future protection. Browsers with the Navigation API cancel Back/Forward before prompting; older browsers restore same-document Back and use native confirmation for document exits. Reload/close uses the browser's native unsaved-change confirmation. There is no autosave or persistent browser draft. References explaining state behavior are not product pages.

Public projections and deletion are deferred. Future OWNER-only deletion must coordinate business records, related sessions and S3; do not enable it until its controlled cascade is implemented. Account settings, story, slug editing, uploads, passwords, themes, status, family management and ownership changes remain outside this increment. Follow /docs and unresolved decisions in /docs/FOUNDATION_DECISIONS.md.
