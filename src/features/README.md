# Feature modules

Keep domain services, request parsing and future domain UI in the corresponding feature.
Route handlers validate, authenticate, authorize and call services; page components render UI.
Infrastructure (MongoDB, S3, email, scheduling and rate limits) lives outside these modules.

Private queries derive weddingId from the server-resolved current user. Validate every cross-reference against the same wedding. Public DTOs must explicitly allowlist guest-safe fields and omit tasks, budget, expenses, users, guest contact data and internal activities.

Read all authoritative /docs documents and FOUNDATION_DECISIONS.md before adding behavior.
Unimplemented features are boundaries for later work, not working product functionality.

