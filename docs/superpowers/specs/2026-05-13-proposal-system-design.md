# Proposal System — Design Spec

**Date:** 2026-05-13
**Status:** Approved, in implementation
**Repo:** sufyanfa.com (Nuxt 3.9.1, Cloudflare Pages)

## Goal

Replace three manually-built static proposal microsites
(`business29.sufyanfa.workers.dev`, `business-1925.pages.dev`,
`business-9b4.pages.dev`) with a single dynamic system where Sufyan can
create password-protected proposals from an admin dashboard and share
them with clients via `sufyanfa.com/p/<slug>`.

## Scope

**In scope (MVP):**
- Admin auth (email + password, stored in D1, with `is_admin` flag)
- CRUD for proposals
- Markdown body + structured header (title, client, date, optional CTA)
- Password-gated public viewer at `/p/<slug>`
- Status tracking: `draft → sent → viewed → accepted | declined` (+ `expired` computed)
- View log (timestamp + UA + hashed IP) per unlock
- Accept / Decline buttons with optional decline note
- Expiry date support
- Admin rate-limit on login + per-proposal unlock attempts

**Out of scope (future):**
- Email notifications when client opens/decides (deliberate per user)
- Multi-admin team UI
- Proposal templates / duplication
- Per-client (separate `clients` table) management
- Pricing or structured-block content (markdown only for MVP)

## Architecture

- Single Nuxt 3 app (existing `sufyanfa.com` repo) with Cloudflare Pages preset
- Cloudflare D1 binding (`DB`), local dev via `nitro-cloudflare-dev` module
- Server-side endpoints under `/server/api/admin/*` and `/server/api/proposals/*`
- Two Vue layouts: `default` (existing site shell), `bare` (no nav/footer, for `/admin/*` and `/p/<slug>`)
- Markdown rendering via `marked` + `isomorphic-dompurify`

### Why same repo

- Reuses existing Tailwind tokens (cream/ink/forest, `#15803D`), Rubik font, components
- One deploy, one domain, one wrangler.toml
- Server routes are already supported (`/api/contact` exists today)

## Data Model

D1 schema (`migrations/0001_initial.sql`):

```sql
users         (id, email UNIQUE, password_hash, is_admin, created_at)
proposals     (id, slug UNIQUE, title, client_name, client_label?,
               proposal_date, password_hash, content_md,
               cta_label?, cta_url?, status, expires_at?,
               accepted_at?, declined_at?, decline_note?,
               created_at, updated_at)
proposal_views (id, proposal_id FK, viewed_at, ip_hash?, user_agent?)
login_attempts (id, scope, key, attempted_at)  -- rate-limit ledger
```

Indexes on `slug`, `status`, `(scope, key, attempted_at)`.

`status` is a TEXT enum: `draft | sent | viewed | accepted | declined`.
`expired` is computed live from `expires_at < now()`, not stored.

## Auth

### Password hashing
- PBKDF2-SHA256, 100k iterations, 16-byte salt, 32-byte derived key
- Web Crypto API (works on Cloudflare Workers — no Node `crypto` needed)
- Storage format: `pbkdf2$<iterations>$<salt_b64url>$<hash_b64url>`
- Same scheme for both `users.password_hash` and `proposals.password_hash`

### Sessions
- JWT (HS256) signed with `SESSION_SECRET` env var
- Admin cookie `__session`: 7-day expiry, HttpOnly, Secure (prod), SameSite=Lax, path `/`
- View cookie `__pv_<id>`: 24-hour expiry, scoped to `/p/<slug>`
- Verified via Web Crypto HMAC; no DB session table

### Authorization
- Server middleware on `/api/admin/*` (skips `/api/admin/login`) checks JWT + loads user
- Endpoints additionally assert `is_admin = 1`
- Public proposal endpoints require valid view cookie *except* for `meta` and `unlock`

### Rate limiting
- 5 failed admin logins per IP per 10 minutes → 429
- 8 wrong unlock attempts per (slug + IP) per 10 minutes → 429
- Backed by `login_attempts` table; old rows can be pruned later

### Seeding the first admin
- `scripts/seed-admin.mjs <email> <password> [--local]` — hashes locally
  and calls `wrangler d1 execute` to insert. Sets `is_admin = 1`.

## API Surface

### Admin (cookie-protected)
```
POST   /api/admin/login              { email, password }
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/proposals
POST   /api/admin/proposals          { slug, title, client_name, ..., password }
GET    /api/admin/proposals/:id      → proposal + views + stats
PATCH  /api/admin/proposals/:id      { ...partial }
DELETE /api/admin/proposals/:id
POST   /api/admin/proposals/:id/send → status: draft → sent
```

### Public
```
GET    /api/proposals/:slug/meta     → title, client labels, expired? (no body)
POST   /api/proposals/:slug/unlock   { password } → sets view cookie + logs view
GET    /api/proposals/:slug          (requires view cookie) → full proposal
POST   /api/proposals/:slug/accept   → status: accepted
POST   /api/proposals/:slug/decline  { note? } → status: declined
```

## Pages

- `/admin/login` — email + password form
- `/admin/proposals` — list with status filter pills + table
- `/admin/proposals/new` — form + live markdown preview
- `/admin/proposals/:id` — share box (URL + password reveal), stats, view log, inline edit, send/delete
- `/p/:slug` — 4 states: loading → notfound | expired | locked (password gate) | unlocked (header + markdown body + CTA + decision card)

Admin pages use the `bare` layout (no site nav/footer); the proposal viewer also uses `bare` but renders its own header + footer.

## Style

Reuses site DNA:
- Cream/ink palette + `#15803D` accent
- Rubik font (already loaded)
- Green-dot eyebrow pattern, rounded-3xl cards, ink-filled primary CTAs
- Tailwind `proposal-prose` class with custom styles for `<h1>–<h4>`, links, lists, tables, blockquotes

Proposal viewer is `<meta name="robots" content="noindex, nofollow">`
and not crawled (`/p/**` is in `prerender.ignore`).

## Edge cases handled

- Draft proposals return 404 to the public (never expose unsent state)
- Expired proposals return 410 + show a friendly state with mailto fallback
- Accept/decline locked after first decision (no take-backs)
- Wrong password is generically "invalid" — same response whether slug or password is wrong
- Slug validated: lowercase letters/numbers/hyphens only

## Setup (operator)

```bash
# 1. Create D1 database (one-time, requires `wrangler login`)
yarn dlx wrangler d1 create sufyanfa-proposals
#   → copy the returned database_id into wrangler.toml

# 2. Apply migration
yarn db:migrate:local   # for nuxt dev
yarn db:migrate:remote  # for production

# 3. Seed an admin
node scripts/seed-admin.mjs admin@sufyanfa.com 'my-strong-pw' --local
node scripts/seed-admin.mjs admin@sufyanfa.com 'my-strong-pw'  # remote

# 4. Set the SESSION_SECRET env var (Cloudflare Pages dashboard)
openssl rand -base64 32  # → paste as SESSION_SECRET production env var

# 5. Run / deploy
yarn dev                                    # local
yarn deploy                                 # production
```

## Open questions deferred to future iterations

- Migration of the 3 existing static proposals: content will be re-typed
  into the admin dashboard after launch; the legacy URLs can stay live
  until each client confirms receipt of the new link.
- Whether to add a dedicated `clients` table once a third repeat client appears.
- Whether to add a "duplicate proposal" button after templates start
  repeating (e.g., 3+ proposals share the same intro + CTA).
