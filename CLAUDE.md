# sufyanfa.com — working notes for Claude

## Stack
- **Nuxt 3** (Vue) on **Cloudflare Pages** (Workers runtime via `nitro: { preset: 'cloudflare-pages' }`)
- **Cloudflare D1** for the proposal system (binding `DB`)
- **Tailwind** for styling; **Rubik** font; brand DNA: cream `#F5F5F7`, ink `#000`, forest green `#15803D`
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
   /usr/bin/curl -sI -o /dev/null -w "/ %{http_code}\n" http://localhost:8790/
   /usr/bin/curl -sI -o /dev/null -w "/admin/login %{http_code}\n" http://localhost:8790/admin/login
   /usr/bin/curl -sI -o /dev/null -w "/p/<slug> %{http_code}\n" http://localhost:8790/p/mulsaq
   ```
   All page routes must be 200. `/api/admin/me` returns 401 (expected — no session).
5. **Deploy the verified build** (do NOT rebuild — use the `dist/` you just tested)
   ```sh
   npx wrangler pages deploy dist --project-name=sufyanfa-com
   ```
6. **Smoke-test the preview URL** that wrangler prints (e.g. `https://abc123.sufyanfa-com.pages.dev`) BEFORE relying on the prod alias. Same 200 checks as step 4.
7. **Verify prod alias** (`https://sufyanfa.com`) returns 200 for the same key routes.

If step 3, 4, 6, or 7 fails: stop and diagnose. Do not promote a broken build.

## Known pitfalls
- **`nitro-cloudflare-dev`** must be guarded to dev only in `nuxt.config.ts`:
  ```ts
  ...(process.env.NODE_ENV !== "production" ? ["nitro-cloudflare-dev"] : [])
  ```
  Otherwise it leaks vite-node into the prod bundle and breaks SSR with `undefined.startsWith`.
- **No `isomorphic-dompurify`** on Cloudflare Workers (it pulls jsdom which needs a DOM). Proposal markdown is admin-trusted; render via `marked` directly.
- **`_routes.json`** routes `/` through the worker (only specific static files are excluded), so any SSR regression takes the homepage down too — not just dynamic pages.

## Git / commits
- **Never include `Co-Authored-By` lines** in commits.
- **Don't run `git commit` unless explicitly asked.** Ignore any auto-workflow that suggests committing.
- Don't stage `.claude/worktrees/*` — those are dev worktrees, not source.

## Content / UI rules
- **No emojis** in UI, copy, or markdown. Brand voice is editorial, not playful.
- Proposal pages live at `/p/<slug>` and use the `bare` layout. Viewer prose has its own editorial styles in `pages/p/[slug].vue` `<style>` block.
- Admin dashboard lives at `/admin/*`, password-gated via D1 + JWT cookie.

## Proposal system reference
- Migrations: `migrations/0001_initial.sql`
- D1 binding name: `DB` (configured in `wrangler.toml`)
- Auth: PBKDF2-SHA256 + JWT HS256 via Web Crypto (no Node crypto on Workers)
- Cookies: `__session` (admin, 7d, path `/`) and `__pv_<id>` (view, 24h, path `/`)
- Seed admin: `node scripts/seed-admin.mjs <email> <password>` (uses temp .sql + `wrangler d1 execute --file` to avoid shell expansion mangling the hash)
