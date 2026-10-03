# Tasks

Task service boundary. Wedding-wide tasks can omit eventId. Validate assignee/event wedding membership. FAMILY_MEMBER may update only assigned task status; creation, editing and deletion require OWNER/ADMIN. Keep reminderSentAt for future reminder deduplication.

Implementation is deferred. Follow /docs and the pending decisions in /docs/FOUNDATION_DECISIONS.md.

