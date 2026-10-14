# Wedding Website — approved increment

Approved in the project discussion and finalized for implementation on **2026-10-09**, after review of the four Stitch Wedding Website screens in project `9719362010133116550`.

## Access decision and specification alignment

The user explicitly chose **“Open through the shareable link”** for V1. `/wedding/[slug]` is public: no guest account, wedding password, invitation token or publish toggle. This resolves the password conflict between PRD FR-17/18/§14.4/acceptance criteria and SYSTEM_DESIGN §15 for this increment. It does not add a password field or amend the business schemas. Anyone who has the link can view the allowlisted wedding/event information.

## Implemented scope contract

- Protected `/wedding-website` displays the full stable share URL, Copy, Open in a new tab, saved identity, a bounded event summary, guest identity preview and truthful Coming soon modules. Reuse the existing workspace shell.
- The URL uses the configured application's origin and the saved `websiteSlug`; never regenerate it after Settings updates. Production requires a configured HTTPS origin. Copy failure provides the complete read-only selectable URL and retry.
- OWNER/ADMIN have links to existing Settings and Events. FAMILY_MEMBER can read/share the link and view events, without management actions. V1 shared credentials remain unchanged.
- Public `/wedding/[slug]` displays groom first, saved names, calendar wedding date, primary location, a generic invitation and days-only countdown using India's calendar day. Today and post-wedding messages replace the countdown when appropriate.
- Read saved events in chronological `startAt`/`_id` order, including past events. Use bounded page/limit pagination (default 20, maximum 100); the guest page initially shows three and loads more on demand. Failure/loading preserves previously loaded events and venue cards.
- Guest-safe event fields are `id`, `name`, `startAt`, optional `endAt`, `venue`, optional `location`, optional `description` and a validated HTTPS `livestreamUrl`. Times are explicitly IST; overnight ranges include both dates and years. All saved events are included; the free-text `status` field is not a publishing policy.
- Text-only venue cards follow the loaded celebrations. External Google Maps search links derive from saved venue/location text. No embedded maps or static map images.
- Public wedding fields are exactly `groomName`, `brideName`, `weddingDate`, `location`, `websiteSlug`. Exclude finances, tasks, guests/contact data, members, accounts, authors, storage keys and internal activity. Never send a raw document or private DTO to the public page.
- Independent wedding/event reads support partial schedule failure, safe generic errors, unavailable links, empty schedules and optional/long content. Private reads additionally handle expired sessions. No failure is presented as a successful empty result.
- Refresh/open reads saved data. No cross-browser live synchronization, guaranteed cache-delay claims or browser draft persistence.
- Online RSVP and Gallery remain inactive Coming soon. No stock couple photo, cover upload, story/theme editor, photo infrastructure, guest mutations, custom slug editing or website publication lifecycle in this increment.
- Desktop Stitch references drive responsive implementation; separate mobile Stitch designs are not required.

## API contract

- `GET /api/v1/public/weddings/{slug}` returns the five wedding fields above in the standard envelope.
- `GET /api/v1/public/weddings/{slug}/events` returns `{ events, pagination: { page, limit, total, pages } }` using the event field allowlist above. Resolve wedding scope from the slug, regardless of authentication cookies or query-supplied wedding IDs.
- Malformed/missing slugs return 404; invalid pagination returns 400. Reads use `Cache-Control: no-store`. Public mutations are deferred, so no new rate-limit policy is enabled.
- Private sharing reuses protected current-wedding and Events APIs, whose session-derived scope and permissions remain unchanged.

No collection, field, enum, index or dependency is added. Remaining Foundation conflicts (households, invitations, notification center, receipts, email/reminders, extra fields) are unchanged.
