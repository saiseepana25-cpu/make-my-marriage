# Weddings

The current-wedding service requires a server-resolved authenticated user and returns an explicit wedding DTO. Atomic wedding/OWNER/session creation is implemented in the auth service following docs/AUTHENTICATION_DECISIONS.md. Keep websiteSlug unique; totalBudget remains stored on weddings.

Workspace editing, public projections and deletion are deferred. Future OWNER-only deletion must coordinate business records, related sessions and S3; do not enable it until its controlled cascade is implemented. Follow /docs and unresolved decisions in /docs/FOUNDATION_DECISIONS.md.
