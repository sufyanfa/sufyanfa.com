# sufyanfa.com — working notes for Claude

## Stack
- **Nuxt 3** (Vue) on **Cloudflare Pages** (Workers runtime via `nitro: { preset: 'cloudflare-pages' }`)
- **Cloudflare D1** for the proposal system (binding `DB`)
- **Tailwind** for styling; **Thmanyah Sans** font (self-hosted, `public/fonts/thmanyah-sans/`, weights 300/400/500/700/900 — no 600, see Known pitfalls); brand DNA: cream `#F5F5F7`, ink `#000`, forest green `#15803D`
- Site is **Arabic / RTL** (`lang="ar" dir="rtl"`)

## Package manager
Use **yarn** for everything (install, scripts). Never npm.

## Dev server
- Always start dev on **port 3002+** (never 3000/3001).
- `yarn dev` is wired to `--port 3002`.
- `yarn dev` uses `nitro-cloudflare-dev` to expose D1 bindings locally.

## Build & deploy — required pre-flight check

**Do not run `yarn deploy` blindly.** A bare deploy can ship a broken build (a vite-node dev runtime leaked into production once and 500'd every page). Follow this sequence:

1. **Clean state**
   ```sh
   rm -rf dist .output .nuxt
   ```
2. **Build for production**
   ```sh
   NODE_ENV=production NODE_OPTIONS=--max-old-space-size=8192 yarn build
   ```
3. **Verify the build doesn't contain dev-runtime leakage**
   ```sh
   # this file should NOT exist in a healthy prod build
   ls dist/_worker.js/chunks/vite-node-shared.mjs
   # client.manifest.mjs should start with `const e={` (static object),
   # NOT `const client_manifest=()=>o("/manifest")` (vite-node fetch)
   head -1 dist/_worker.js/chunks/app/client.manifest.mjs
   ```
4. **Smoke-test in the actual Workers runtime locally** (this catches bugs `yarn dev` cannot, because `yarn dev` runs in Node, not Workers)
   ```sh
   npx wrangler pages dev dist/ --port 8790 &
   # then:
   /usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" http://localhost:8790/
   /usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" http://localhost:8790/admin/login
   /usr/bin/curl -s -o /dev/null -w "/p/<slug> %{http_code}\n" http://localhost:8790/p/mulsaq
   ```
   All page routes must be 200. `/api/admin/me` returns 401 (expected — no session).
5. **Deploy the verified build** (do NOT rebuild — use the `dist/` you just tested)
   ```sh
   npx wrangler pages deploy dist --project-name=sufyanfa-com
   ```
6. **Smoke-test the preview URL** that wrangler prints (e.g. `https://abc123.sufyanfa-com.pages.dev`) BEFORE relying on the prod alias. Same 200 checks as step 4.
7. **Verify prod alias** (`https://sufyanfa.com`) returns 200 for the same key routes.

If step 3, 4, 6, or 7 fails: stop and diagnose. Do not promote a broken build.

**Timing:** a normal deploy is ~3–5 minutes total (build ~90–150s, smoke test ~15s, upload ~60–90s). If a build looks suspicious (step 3 fails, or a build that was clean minutes ago suddenly leaks vite-node with no source changes to explain it), don't just retry blindly — clear `node_modules/.cache` entirely (not just `dist`/`.nuxt`) and rebuild. A partially-cleared cache (e.g. only `.cache/nitro` or only `.cache/vite` removed) has caused a real, reproducible vite-node leak in this repo even with source code unchanged.

## Known pitfalls
- **`nitro-cloudflare-dev`** must be guarded to dev only in `nuxt.config.ts`:
  ```ts
  ...(process.env.NODE_ENV !== "production" ? ["nitro-cloudflare-dev"] : [])
  ```
  Otherwise it leaks vite-node into the prod bundle and breaks SSR with `undefined.startsWith`.
- **No `isomorphic-dompurify`** on Cloudflare Workers (it pulls jsdom which needs a DOM). Proposal markdown is admin-trusted; render via `marked` directly.
- **`_routes.json`** routes `/` through the worker (only specific static files are excluded), so any SSR regression takes the homepage down too — not just dynamic pages.
- **Stale `node_modules/.cache`** (especially `.cache/nitro` or `.cache/vite` cleared individually rather than together) can cause the vite-node prod leak above to reappear even with no source changes. If a build that was clean is suddenly leaking, `rm -rf node_modules/.cache` and rebuild before assuming it's a code regression.
- **Thmanyah Sans license**: self-hosted font files require confirmed web-embedding rights from thmanyah (the default license only permits compiled/packaged/obfuscated embedding, not raw `@font-face` web serving) — already confirmed for this project. Don't swap in a different downloaded font family without checking its license permits `@font-face` web serving first.
- **Thmanyah Sans has no weight 600.** Tailwind's `font-semibold` is remapped in `tailwind.config.ts` (`theme.extend.fontWeight.semibold: "500"`) so it resolves to an actual shipped weight instead of forcing browsers to synthesize a fake bold — unremapped, this rendered as visibly broken/clipped strokes on iOS Safari. Don't remove that override.

## Git / commits
- **Never include `Co-Authored-By` lines** in commits.
- **Don't run `git commit` unless explicitly asked.** Ignore any auto-workflow that suggests committing.
- Don't stage `.claude/worktrees/*` — those are dev worktrees, not source.

## Content / UI rules
- **No emojis** in UI, copy, or markdown. Brand voice is editorial, not playful.
- **No em-dash (or " - ") as a sentence connector** in copy (e.g. "X, ثم Y - لمن يريد Z"). Reads as AI-generated; restructure into two direct sentences or use a comma/colon instead. Doesn't apply to the site's existing "Title — Subtitle" separator convention in `<title>`/alt text/JSON-LD, or the `'—'` placeholder used in admin tables for empty values — those are fine.
- **First-person singular voice** ("أنا/أبني/أحوّل"), not "we" (نحن/نبني) — Sufyan is a solo technical partner, not an agency. Exception: genuinely reciprocal phrasing about working *with* the client (e.g. "كيف نعمل معًا؟") is fine.
- **Positioning order: product builder first, technical partner second.** Lead copy with what he builds/ships, not with "شريك تقني" as the opening identity — that undersells founders with an existing product into thinking he only does MVPs. See Hero eyebrow/H1 for the current phrasing to match.
- Proposal pages live at `/p/<slug>` and use the `bare` layout. Viewer prose has its own editorial styles in `pages/p/[slug].vue` `<style>` block.
- Admin dashboard lives at `/admin/*`, password-gated via D1 + JWT cookie.

## Proposal system reference
- Migrations: `migrations/0001_initial.sql`
- D1 binding name: `DB` (configured in `wrangler.toml`)
- Auth: PBKDF2-SHA256 + JWT HS256 via Web Crypto (no Node crypto on Workers)
- Cookies: `__session` (admin, 7d, path `/`) and `__pv_<id>` (view, 24h, path `/`)
- Seed admin: `node scripts/seed-admin.mjs <email> <password>` (uses temp .sql + `wrangler d1 execute --file` to avoid shell expansion mangling the hash)
