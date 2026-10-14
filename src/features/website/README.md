# Wedding Website

See [approved scope](../../../docs/WEDDING_WEBSITE_DECISIONS.md) and the public APIs under `/api/v1/public/weddings/[slug]`.

`service.ts` resolves the saved slug and explicitly projects/serializes guest-safe wedding and event fields. It never resolves a private session. Lists are bounded, chronologically sorted by startAt then _id and scoped to the resolved wedding. Free-text event status does not implement publication. No public mutations or new storage are enabled.

The public server page renders identity and the first three events without login; event failures retain identity and allow client Retry. Load more preserves loaded events on failure and appends additional venue cards. Venue cards describe the loaded celebrations. Optional livestreams are defensively restricted to HTTPS without credentials; Maps links safely encode venue/address text.

The private sharing page reuses authenticated current-wedding and Events reads and the established app shell. Settings/event editing follows centralized roles. URL generation uses NEXT_PUBLIC_APP_URL's origin and the saved slug, with HTTPS required in production. Copy failure exposes a complete selectable read-only URL. The dashboard and navigation link to this sharing page.

Wedding dates retain their UTC calendar date; countdown day boundaries and event schedules use Asia/Kolkata. Overnight schedules show both full dates/years. Changes appear on page open/reload or Retry, not via live synchronization. No photos, maps embeds, account/password gate, RSVP, publish toggle, story/theme editor or slug mutation are included.
