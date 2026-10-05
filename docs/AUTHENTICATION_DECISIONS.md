# Authentication and wedding onboarding — approved milestone

Approved on **2026-10-05** in the project discussion. This document amends only the authentication/onboarding decisions described below; unrelated specification conflicts remain unresolved.

## Product scope

- Email/password signup, login, and logout. Signup has two screens: account details, then wedding details. Nothing is persisted until the final submission.
- Match the homepage's Manrope and Playfair Display fonts, burgundy palette, and visual style across the implemented pages.
- Create the wedding, its OWNER, and the initial session in one MongoDB transaction. Every persisted user retains the required weddingId.
- Enter the private dashboard immediately after signup. Email verification, password recovery, family invitation acceptance, and profile editing are deferred from this milestone.
- Account fields: name, email, password, relationshipType from the existing controlled values. Wedding fields: brideName, groomName, weddingDate, location. OWNER is assigned on the server, never accepted from the browser.
- Display the groom's name first and the bride's name second in wedding setup and couple headings (for example, Sai & Adya). Newly generated wedding slugs follow the same order; existing slugs remain stable. Approved on 2026-10-05.
- Generate websiteSlug from couple names with a unique suffix; public wedding functionality remains a separate milestone. Optional story, cover image, and budget can be supplied in later features.
- Wedding dates are entered as calendar dates and stored at midnight UTC; display them in UTC to preserve the selected day.

## Passwords

- Approved minimum: **8 Unicode characters**. Maximum: **72 UTF-8 bytes** because the approved bcryptjs implementation must not silently truncate passwords.
- Spaces and Unicode are allowed. No mandatory character-class rules. Never trim, log, or persist plaintext passwords.
- Existing bcrypt cost 12 is retained. Login accepts existing valid password lengths; registration enforces the new minimum.

## Sessions

- Use a cryptographically random 32-byte opaque token in an HttpOnly cookie. Store only its SHA-256 hash in MongoDB.
- Fixed expiry: **30 days from login/signup**, including across browser restarts. Requests do not extend expiry.
- Cookie: `mmm_session` locally, `__Host-mmm_session` in production; Path=/, SameSite=Lax, Secure in production, no Domain, Max-Age=2592000.
- Check expiry server-side on every session resolution, independently of TTL cleanup. Resolve current user, wedding membership, and permissions from persisted records.
- Logout hard-deletes the current session and expires its cookie. New login replaces/revokes any previous session in that browser. Separate browsers may have independent sessions.
- Missing/deleted users or weddings do not grant access. Database failure cannot silently authenticate a request.

## Approved database amendment

Preserve the eight business collections and their existing fields/enums/indexes. Add exactly two infrastructure collections to the same database:

### sessions

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| _id | ObjectId | Yes | Primary key |
| userId | ObjectId | Yes | Reference to users._id |
| tokenHash | String | Yes | SHA-256 hash of token; never raw token |
| expiresAt | DateTime | Yes | Fixed server-enforced expiration |
| createdAt | DateTime | Yes | Creation timestamp |

Indexes: unique tokenHash; userId; TTL expiresAt with expireAfterSeconds=0. No updatedAt or soft-delete fields.

### rate_limits

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| _id | String | Yes | HMAC-SHA-256 of scope, identifier, and window start |
| count | Number | Yes | Atomic consumed-request counter |
| expiresAt | DateTime | Yes | End of fixed window |

Indexes: primary-key uniqueness; TTL expiresAt with expireAfterSeconds=0. Raw email/IP and credentials are not persisted in counters.

Atomic increment/upsert implements fixed windows; expiry is calculated into the key so delayed TTL deletion does not extend a limit. Concurrent first-request duplicate-key races retry the increment against the existing record. No process-local fallback.

## Initial request limits and protection

- Login: 50 requests per IP per 15 minutes, plus 5 per IP/email pair per 15 minutes.
- Signup: 5 requests per IP per hour. Other scopes retain the shared limiter contract and are implemented with their future features.
- Return 429 with Retry-After. Counter storage/configuration failures reject the operation.
- Production trusts only the Vercel-provided client IP header; deployments outside Vercel need an explicit trusted-IP adapter. Local development uses one shared local bucket and ignores spoofable forwarded headers.
- AUTH_RATE_LIMIT_SECRET is a server-only random secret of at least 32 characters, used to HMAC counter identifiers.
- Require same-origin Origin on auth mutations; reject cross-site fetch metadata. Compare against configured NEXT_PUBLIC_APP_URL, not an untrusted Host header. HTTPS is required in production.
- Require JSON and bound request bodies before parsing. Verify Origin and apply the IP limit before parsing/hash work; apply the login IP/email limit after validating credentials.
- Use generic invalid-login messages and equivalent bcrypt comparison work for missing accounts. Never return password hashes or session tokens in JSON.

## APIs and implementation boundary

- POST /api/v1/auth/register accepts account fields plus a wedding object containing brideName, groomName, weddingDate, and location. Returns a safe user DTO, sets the cookie, and creates all onboarding records atomically.
- POST /api/v1/auth/login returns a safe user DTO and sets a fresh cookie.
- POST /api/v1/auth/logout revokes the current session and clears the cookie; safely repeatable when already signed out.
- GET /api/v1/auth/me remains protected. GET /api/v1/weddings/current returns only the server-resolved user's wedding.
- Separate POST /api/v1/weddings is reserved rather than enabled: authenticated users already belong to one wedding.
- The dashboard displays saved wedding identity and truthful empty states; planning CRUD is deferred.
- Index provisioning is lazy on the first auth/database operation. Builds and credential-free tests must not connect to MongoDB. Atlas must permit index creation and transactions.
- Integration/browser tests must use an isolated test database, never delete an existing application database or seed production data.

## Specification alignment

This approved amendment resolves API_DESIGN §6/§8 versus DATABASE_DESIGN §5.1/§9.1 by making registration atomic. It also resolves session storage and durable counter storage by approving the two infrastructure collections, and fixes the password policy at eight characters. Deferred password recovery remains part of the broader PRD, not this milestone. No JWT, authentication provider, reset tokens, or invitation mechanism is introduced.
