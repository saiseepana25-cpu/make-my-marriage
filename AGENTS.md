<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Make My Marriage development rules

- Before development, read docs/PROJECT_STATUS.md to understand completed milestones, current implementation limits and the latest handoff.
- After completing a major feature or making a substantial change to an existing feature, update docs/PROJECT_STATUS.md before handing work back. Keep the milestone summary current and preserve dated progress entries with implemented scope, actual validation results, remaining limitations or open decisions, and the next agreed step. Record partial or blocked work honestly; planned work is not completed work. The status file tracks implementation and does not override the specifications.
- Before architectural changes, read every relevant Markdown document in /docs completely. /docs is the primary source of truth. Read FOUNDATION_DECISIONS.md for known conflicts; it records questions, not amended specifications.
- Report conflicting sources and the clarification required. Stop the affected implementation; do not silently choose a competing requirement.
- Keep the approved V1 full-stack modular monolith: Next.js App Router, React, strict TypeScript, npm, Tailwind CSS, Node.js Next.js Route Handlers under /api/v1, MongoDB Atlas/Mongoose, AWS S3 and Vercel/Vercel Cron.
- Keep business logic in focused feature services and infrastructure in server-only modules. No database, credentials or S3 access from client components. Use "use client" only when necessary.
- Preserve the eight collections and exact fields/enums/indexes in DATABASE_DESIGN.md. No extra collection, soft delete, session store or rate-limit counter store without an approved documentation change.
- One authenticated user belongs to one wedding. Roles are OWNER, ADMIN and FAMILY_MEMBER; guests have no accounts and use /wedding/[slug].
- Derive private wedding scope from the server-resolved user, never browser-supplied weddingId. Verify every resource/reference belongs to that wedding. Enforce permissions in services/handlers; page layouts and hidden UI alone are not security.
- Centralize permissions. FAMILY_MEMBER can view finances, update assigned task status, upload photos and create manual activities. Ownership/delete-wedding operations require OWNER. SYSTEM activities are read-only through normal routes.
- Public responses must explicitly allowlist guest-safe fields and exclude private planning/financial/member information.
- Hash passwords with bcryptjs; never store/log plaintext. Finalize session persistence before enabling login. Do not invent JWT, an authentication provider, reset/invitation tokens or another collection.
- Keep images private in S3 and store s3Key/metadata in MongoDB. Authorize and rate-limit before presigning, upload directly from the browser, verify successful uploads before creating metadata. Never proxy large files through Next.js.
- Use hard deletes as documented. Event deletion clears eventId on tasks/expenses/photos and relatedEventId on activities without deleting those records. Photo deletion coordinates S3 and metadata. Wedding deletion requires a controlled OWNER-only cascade.
- Use the EmailService abstraction; no provider SDK until chosen. No successful send claims from placeholders.
- Use durable serverless rate limiting, never an in-memory-only production limiter. Resolve the counter-storage decision before enabling sensitive/public mutations.
- Keep service setup lazy: builds/tests must not need production credentials. Protect cron calls with CRON_SECRET; resolve the documented HTTP method and reminder-state questions before scheduling.
- Without approval, do not introduce Express, NestJS, Prisma, PostgreSQL, Firebase, Supabase, Zod, Auth.js/NextAuth, Clerk, Redux, Redis, BullMQ, Kafka, GraphQL, payment gateways, WhatsApp, vendor marketplace, accommodation or transportation management, native livestream infrastructure, AI functionality, multi-wedding switching, guest accounts, granular financial permissions or a native mobile app.
- Approved exception: Zod may remain solely as a transitive dependency of Next.js lint tooling. Do not add it as an application dependency or import it in application code.
- Do not implement disputed website passwords, households, notifications, receipts/documents or additional fields until their documentation conflicts are resolved.
- Keep scaffolding small; add real feature files as work requires them. No final Stitch UI redesign or full product implementation in foundation tasks. No shadcn/ui or second styling system.
- Run npm run typecheck, npm run lint, npm run test and npm run build for relevant foundation changes. Keep Playwright config loading with npm run test:e2e:list. Use meaningful tests and do not claim unrun browser tests passed.
- Keep /docs intact, commit package-lock.json, preserve .env.example and never commit secrets or build/test artifacts.
