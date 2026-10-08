# Events

Event service boundary. Validate startAt/endAt ordering and wedding membership. Event deletion preserves tasks, expenses, photos and activities while clearing eventId/relatedEventId references. Livestreams are external URLs on events.

The Activities increment (2026-10-08) records an automatic event-created update atomically with event creation. Editing/deleting events does not generate another update; deletion retains the original activity and clears its link. See ../activities/README.md.

Implemented: authenticated paginated chronological lists, upcoming/past views, create/read/update/delete APIs and responsive Stitch-based forms/details. Services enforce roles and session-derived wedding scope. Updates and reference-clearing deletes use MongoDB transactions. Mutations require the configured same-origin header and share a durable 60-per-minute limit per user.

The UI uses IST and maps address/landmarks to location and description/notes to description. Optional end dates support overnight ceremonies without adding database fields. API updates preserve omitted fields and allow optional values to be cleared. Livestream URL/status remain API-supported documented fields; their UI, event images, calendar sync, autosave and related-module displays are deferred. No sample events are seeded.
