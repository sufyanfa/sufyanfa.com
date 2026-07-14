# Project Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin write a freeform "project completion" document (tech stack, delivered pages, scope, support period — like the RIYAD STUDIO example) for any project in the existing project-board system, and share it with the client as a plain public link at `/done/<project-slug>`.

**Architecture:** Purely additive to the existing `projects` system (`migrations/0005_projects.sql`, `server/api/admin/projects/*`, `pages/admin/projects/[id].vue`). A single new nullable column `completion_md` on `projects` holds the admin's markdown. No new table, no draft/publish state — writing content and saving makes the public page live immediately. The public page and its rendering reuse the same `marked`-based `renderMarkdown()` composable and editorial prose styling already used by `pages/p/[slug].vue`.

**Tech Stack:** Nuxt 3 (Vue 3, `<script setup>`), Cloudflare D1 (via `useDB(event)`), Nitro server routes, Tailwind, Arabic RTL, `yarn`.

## Global Constraints

- Use **yarn** for all commands, never npm.
- Dev server runs on **port 3002** (`yarn dev`, already wired).
- **No emojis** anywhere in UI copy.
- Arabic RTL copy throughout; match the existing tone (e.g. `المشروع غير موجود`, `الصفحة غير موجودة`).
- This project has **no automated test runner**. Every task's verification step below is a concrete manual command (D1 SQL via `wrangler d1 execute`, `curl` against a running `yarn dev`, or an exact browser click-path) with an exact expected result — this replaces unit tests for this codebase, it is not a placeholder.
- **Per this repo's CLAUDE.md: do not run `git commit` automatically.** Each task below ends with a "Stage & propose commit" step showing the exact `git add` + `git commit -m "..."` command — treat it as a checkpoint to show the user and get a go-ahead, not something to execute unprompted.
- Full deploy preflight (`CLAUDE.md`) is required before any `yarn deploy` / `wrangler pages deploy` — not part of this plan's per-task verification, only if/when the user explicitly asks to deploy.
- Markdown is rendered via the existing `renderMarkdown()` in `composables/useMarkdown.ts` (backed by `marked`) — admin-authored content is trusted input, matching the proposal viewer; do not add a sanitizer (Cloudflare Workers has no DOM for `isomorphic-dompurify`, per CLAUDE.md).

---

## File Structure

New files:
- `migrations/0008_project_completion.sql` — adds `completion_md` column
- `server/api/done/[slug].get.ts` — public read endpoint
- `pages/done/[slug].vue` — public completion page

Modified files:
- `server/api/admin/projects/[id].put.ts` — accept `completion_md` in the update body
- `pages/admin/projects/[id].vue` — new "الإكمال" tab with textarea, save button, public-link display

No change needed to `server/api/admin/projects/[id].get.ts` — it already does `SELECT * FROM projects WHERE id = ?`, so `completion_md` is included automatically once the column exists.

---

### Task 1: Migration — add `completion_md` column

**Files:**
- Create: `migrations/0008_project_completion.sql`

**Interfaces:**
- Produces: `projects.completion_md` (nullable `TEXT`) — every later task reads/writes this column.

- [ ] **Step 1: Write the migration**

```sql
-- Freeform markdown "project completion" document, shown to the client at
-- /done/<project-slug> once non-empty. One optional column, not a child
-- table, since there's exactly one completion document per project.

ALTER TABLE projects ADD COLUMN completion_md TEXT;
```

- [ ] **Step 2: Apply locally**

Run: `yarn db:migrate:local`
Expected: output lists `0008_project_completion.sql` as applied, no errors.

- [ ] **Step 3: Verify the column exists**

Run:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "PRAGMA table_info(projects)"
```
Expected: the result rows include a row with `name` = `completion_md`, `type` = `TEXT`, `notnull` = `0`.

- [ ] **Step 4: Verify existing projects are unaffected**

Run:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT id, slug, completion_md FROM projects LIMIT 5"
```
Expected: existing rows show `completion_md` = `null`, all other columns unchanged.

- [ ] **Step 5: Stage & propose commit**

```bash
git add migrations/0008_project_completion.sql
git commit -m "add completion_md column to projects for project completion docs"
```

---

### Task 2: Admin write path — accept `completion_md` on project update

**Files:**
- Modify: `server/api/admin/projects/[id].put.ts:19-24`

**Interfaces:**
- Consumes: `projects.completion_md` column from Task 1.
- Produces: `PUT /api/admin/projects/{id}` accepts `{ completion_md?: string | null }` in its JSON body — Task 4's admin UI depends on this exact field name.

- [ ] **Step 1: Add the `completion_md` branch**

In `server/api/admin/projects/[id].put.ts`, add this line immediately after the existing `notes` branch (currently line 24: `if (body.notes !== undefined) { ... }`):

```ts
  if (body.completion_md !== undefined) {
    const trimmed = typeof body.completion_md === 'string' ? body.completion_md.trim() : ''
    updates.push('completion_md = ?'); values.push(trimmed || null)
  }
```

Empty/whitespace-only input is normalized to `null` on write, so Task 3's public endpoint only ever has to check for `NULL` (plus a defensive empty-string check, in case any row is set to `''` some other way).

- [ ] **Step 2: Verify the full block reads correctly**

Read back `server/api/admin/projects/[id].put.ts` and confirm the `if (body.completion_md !== undefined) { ... }` block sits between the existing `notes` branch and the `password` branch, with no syntax errors (matching brace/paren count).

- [ ] **Step 3: Start dev server and confirm an admin session**

Run: `yarn dev` (background — leave it running for the rest of this task and Task 3/4/5's verification)
Then confirm a local admin exists; if `curl -s -X POST http://localhost:3002/api/admin/login -H 'content-type: application/json' -d '{"email":"test@local.dev","password":"<known local password>"}' -c /tmp/cc.txt` returns `{"ok":true}`, you have a session cookie jar at `/tmp/cc.txt` to reuse below. If no local admin exists yet, run `yarn db:seed:local test@local.dev <password>` first.

- [ ] **Step 4: Find a project id to test against**

Run:
```bash
curl -s http://localhost:3002/api/admin/projects -b /tmp/cc.txt | head -c 500
```
Expected: JSON with a `projects` array; note one `id` and its `slug` from the output for the next steps.

- [ ] **Step 5: PUT completion_md and verify via D1**

Run (replace `<id>` with the id from Step 4):
```bash
curl -s -X PUT http://localhost:3002/api/admin/projects/<id> \
  -H 'content-type: application/json' -b /tmp/cc.txt \
  -d '{"completion_md":"# اكتمال المشروع\n\nمحتوى تجريبي."}'
```
Expected: `{"ok":true}`.

Then:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT id, completion_md FROM projects WHERE id = <id>"
```
Expected: `completion_md` shows the markdown text you sent.

- [ ] **Step 6: Verify empty string normalizes to null**

Run:
```bash
curl -s -X PUT http://localhost:3002/api/admin/projects/<id> \
  -H 'content-type: application/json' -b /tmp/cc.txt \
  -d '{"completion_md":"   "}'
```
Then:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT id, completion_md FROM projects WHERE id = <id>"
```
Expected: `completion_md` is `null` (not an empty/whitespace string).

- [ ] **Step 7: Restore test content for Task 3's verification**

Run:
```bash
curl -s -X PUT http://localhost:3002/api/admin/projects/<id> \
  -H 'content-type: application/json' -b /tmp/cc.txt \
  -d '{"completion_md":"# اكتمال المشروع — تجربة\n\nنظرة عامة تجريبية.\n\n## الميزات\n\n- ميزة أولى\n- ميزة ثانية"}'
```
Expected: `{"ok":true}`. Keep the `<id>` and its `slug` handy for Task 3.

- [ ] **Step 8: Stage & propose commit**

```bash
git add server/api/admin/projects/\[id\].put.ts
git commit -m "let admin project update set completion_md"
```

---

### Task 3: Public read endpoint — `GET /api/done/[slug]`

**Files:**
- Create: `server/api/done/[slug].get.ts`

**Interfaces:**
- Consumes: `projects` table (`slug`, `name`, `customer_id`, `completion_md`), `customers` table (`name`), `settings` table (`business_name`, `logo_url`) — same `settings` columns already selected in `server/api/i/[slug].get.ts:38-44`.
- Produces: `GET /api/done/{slug}` → `200` with `{ project: { name, slug }, customer: { name }, completion_md, settings: { business_name, logo_url } }`, or `404` with `{ statusMessage: 'الصفحة غير موجودة' }`. Task 5's public page depends on this exact response shape.

- [ ] **Step 1: Write the endpoint**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const db = useDB(event)
  const project = await db
    .prepare('SELECT id, name, slug, customer_id, completion_md FROM projects WHERE slug = ?')
    .bind(slug)
    .first<any>()

  if (!project || !project.completion_md || !String(project.completion_md).trim()) {
    throw createError({ statusCode: 404, statusMessage: 'الصفحة غير موجودة' })
  }

  const customer = await db
    .prepare('SELECT name FROM customers WHERE id = ?')
    .bind(project.customer_id)
    .first()

  const settings = await db
    .prepare('SELECT business_name, logo_url FROM settings WHERE id = 1')
    .first()

  return {
    project: { name: project.name, slug: project.slug },
    customer,
    completion_md: project.completion_md,
    settings,
  }
})
```

- [ ] **Step 2: Verify 404 for a project with no completion content**

Run (with `yarn dev` still running from Task 2):
```bash
curl -s -X PUT http://localhost:3002/api/admin/projects/<id> \
  -H 'content-type: application/json' -b /tmp/cc.txt \
  -d '{"completion_md":null}'
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/api/done/<slug>
```
Expected: `404`.

- [ ] **Step 3: Restore content and verify 200 with correct payload**

Run:
```bash
curl -s -X PUT http://localhost:3002/api/admin/projects/<id> \
  -H 'content-type: application/json' -b /tmp/cc.txt \
  -d '{"completion_md":"# اكتمال المشروع — تجربة\n\nنظرة عامة تجريبية.\n\n## الميزات\n\n- ميزة أولى\n- ميزة ثانية"}'
curl -s http://localhost:3002/api/done/<slug>
```
Expected: `200` JSON containing `"completion_md":"# اكتمال المشروع..."`, a `project.slug` matching `<slug>`, a `customer.name`, and a `settings` object.

- [ ] **Step 4: Verify a nonexistent slug 404s**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/api/done/this-slug-does-not-exist
```
Expected: `404`.

- [ ] **Step 5: Verify no auth is required**

Run the Step 3 curl again but with no `-b /tmp/cc.txt` cookie flag — confirm it still returns `200` with the same payload (this endpoint is intentionally public, no password, no admin session).

- [ ] **Step 6: Stage & propose commit**

```bash
git add server/api/done/\[slug\].get.ts
git commit -m "add public GET /api/done/[slug] for project completion docs"
```

---

### Task 4: Admin UI — "الإكمال" tab

**Files:**
- Modify: `pages/admin/projects/[id].vue`

**Interfaces:**
- Consumes: `PUT /api/admin/projects/{id}` with `{ completion_md }` from Task 2; `board.value.project.completion_md` and `board.value.project.slug` from the existing `GET /api/admin/projects/{id}` (unchanged, already `SELECT *`).
- Produces: nothing consumed by other tasks — this is a leaf UI change.

- [ ] **Step 1: Extend the `tab` type and add completion state**

In `pages/admin/projects/[id].vue`, change line 22:
```ts
const tab = ref<'board' | 'resources'>('board')
```
to:
```ts
const tab = ref<'board' | 'resources' | 'completion'>('board')
```

Then add this block immediately after the existing resources-tab state (after line 27, `const resourceErrors = ref<string | null>(null)`):

```ts
const completionMd = ref('')
const savingCompletion = ref(false)
const completionError = ref<string | null>(null)

watch(board, (v) => { completionMd.value = v?.project?.completion_md ?? '' }, { immediate: true })

const completionPublicUrl = computed(() => {
  if (!board.value?.project?.slug) return ''
  if (typeof window === 'undefined') return `/done/${board.value.project.slug}`
  return `${window.location.origin}/done/${board.value.project.slug}`
})

async function saveCompletion() {
  savingCompletion.value = true; completionError.value = null
  try {
    await $fetch(`/api/admin/projects/${id}`, { method: 'PUT', body: { completion_md: completionMd.value } })
    await refresh()
  } catch { completionError.value = 'فشل الحفظ' }
  savingCompletion.value = false
}

async function copyCompletionLink() {
  if (!completionPublicUrl.value) return
  try { await navigator.clipboard.writeText(completionPublicUrl.value) } catch {}
}
```

- [ ] **Step 2: Add the tab button**

In the `<!-- Tabs -->` block (around line 306-314), add a third button immediately after the "الموارد" button:

```html
        <button @click="tab = 'completion'" :class="['px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]', tab === 'completion' ? 'border-[#15803D] text-ink' : 'border-transparent text-ink-mute hover:text-ink']">
          الإكمال
        </button>
```

- [ ] **Step 3: Add the completion tab content**

Immediately after the closing `</div>` of the `<!-- Resources Tab -->` block (after line 527), add:

```html
      <!-- Completion Tab -->
      <div v-if="tab === 'completion'" class="max-w-5xl mx-auto">
        <div v-if="completionError" class="text-red-600 text-sm mb-3">{{ completionError }}</div>

        <textarea
          v-model="completionMd"
          rows="16"
          class="w-full border border-black/10 rounded-2xl px-4 py-3 text-sm font-mono leading-relaxed outline-none focus:border-[#15803D]"
          placeholder="# اكتمال المشروع — اسم المشروع&#10;&#10;نظرة عامة، التقنيات المستخدمة، الصفحات المكتملة، الميزات، نطاق التسليم، مدة الدعم..."
        ></textarea>

        <div class="flex items-center gap-3 mt-3">
          <button @click="saveCompletion" :disabled="savingCompletion" class="bg-ink text-white rounded-xl px-4 py-2 text-sm font-semibold">
            {{ savingCompletion ? 'جارٍ الحفظ...' : 'حفظ' }}
          </button>
        </div>

        <div v-if="board.project.completion_md" class="mt-6 bg-cream-deep rounded-2xl p-4 flex items-center justify-between gap-3">
          <a :href="`/done/${board.project.slug}`" target="_blank" class="text-sm text-ink-mute hover:text-[#15803D] transition-colors underline underline-offset-2 truncate" dir="ltr">
            {{ completionPublicUrl }}
          </a>
          <button @click="copyCompletionLink" class="text-xs text-ink-mute hover:text-ink border border-black/[0.06] rounded-full px-3 py-1.5 transition-colors flex-shrink-0">
            نسخ الرابط
          </button>
        </div>
      </div>
```

Note `board.project.completion_md` (the saved server state, refreshed after save) gates the link display — not the local `completionMd` textarea buffer, which may hold unsaved edits.

- [ ] **Step 4: Manual browser verification**

With `yarn dev` running, open `http://localhost:3002/admin/projects/<id>` (log in first if needed), click the new "الإكمال" tab, confirm:
- The textarea shows the test content from Task 2/3's curl calls (`# اكتمال المشروع — تجربة...`).
- The public-link box below the textarea shows `http://localhost:3002/done/<slug>` with a working "نسخ الرابط" button.
- Clear the textarea, click "حفظ", confirm the link box disappears (since `completion_md` is now `null`).
- Type new content, click "حفظ", confirm the link box reappears with the updated content persisted (reload the page to confirm it's not just local state).

- [ ] **Step 5: Stage & propose commit**

```bash
git add pages/admin/projects/\[id\].vue
git commit -m "add completion tab to admin project page"
```

---

### Task 5: Public page — `/done/[slug]`

**Files:**
- Create: `pages/done/[slug].vue`

**Interfaces:**
- Consumes: `GET /api/done/{slug}` from Task 3, returning `{ project: { name, slug }, customer: { name }, completion_md, settings: { business_name, logo_url } }`; `renderMarkdown()` from `composables/useMarkdown.ts`.

- [ ] **Step 1: Write the page**

```vue
<script setup lang="ts">
import { renderMarkdown } from '~/composables/useMarkdown'

definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = route.params.slug as string

interface DoneData {
  project: { name: string; slug: string }
  customer: { name: string }
  completion_md: string
  settings: { business_name: string; logo_url: string | null }
}

const { data, error } = await useFetch<DoneData>(`/api/done/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'الصفحة غير موجودة', fatal: true })
}

const renderedBody = computed(() => data.value ? renderMarkdown(data.value.completion_md) : '')

useHead(() => ({
  title: data.value ? `${data.value.project.name} — اكتمال المشروع` : 'اكتمال المشروع',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))

function printIt() { window.print() }
</script>

<template>
  <div v-if="data" class="min-h-screen bg-cream py-10 px-4">
    <article class="completion mx-auto max-w-3xl bg-white rounded-2xl border border-black/10 p-8 sm:p-10">
      <header class="text-center mb-10 pb-8 border-b border-black/10 no-print">
        <img v-if="data.settings.logo_url" :src="data.settings.logo_url" alt="" class="h-8 w-auto mx-auto mb-6" />
        <div v-else class="text-lg font-bold mb-6">{{ data.settings.business_name }}</div>
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          تم إنجاز المشروع
        </div>
        <h1 class="text-2xl font-bold">{{ data.project.name }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ data.customer.name }}</p>
      </header>

      <div class="completion-prose text-ink-soft text-[15px] leading-[1.85]" v-html="renderedBody"></div>
    </article>

    <div class="max-w-3xl mx-auto mt-6 text-center no-print">
      <button @click="printIt" class="px-5 py-2 bg-black text-white rounded-lg text-sm">اطبع / احفظ PDF</button>
    </div>
  </div>
</template>

<style>
@media print {
  @page { size: A4; margin: 16mm; }
  body { background: white !important; }
  .no-print { display: none !important; }
  .completion { box-shadow: none !important; border: none !important; }
  a { color: inherit; text-decoration: none; }
}

.completion-prose {
  font-feature-settings: "tnum" 1, "ss01" 1;
}
.completion-prose h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 0 0 1rem;
}
.completion-prose h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.03em;
  line-height: 1.3;
  margin-top: 3.25rem;
  padding-top: 1.75rem;
  margin-bottom: 1rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.completion-prose > h2:first-child,
.completion-prose > hr + h2 {
  margin-top: 0.5rem;
  padding-top: 0;
  border-top: 0;
}
.completion-prose h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.02em;
  margin-top: 2rem;
  margin-bottom: 0.625rem;
}
.completion-prose h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.completion-prose p {
  margin-bottom: 1.15rem;
  color: #424245;
}
.completion-prose strong { color: #000; font-weight: 700; }
.completion-prose em { color: #000; font-style: italic; }
.completion-prose a {
  color: #15803D;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: opacity 0.15s;
}
.completion-prose a:hover { opacity: 0.7; }
.completion-prose blockquote {
  background: #F5F5F7;
  border-radius: 1.25rem;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  border: 0;
  font-style: normal;
  font-size: 0.9375rem;
  color: #424245;
  line-height: 1.85;
}
.completion-prose blockquote p { margin: 0.25rem 0; }
.completion-prose blockquote p:first-child { margin-top: 0; }
.completion-prose blockquote p:last-child { margin-bottom: 0; }
.completion-prose blockquote strong { color: #000; font-weight: 600; }
.completion-prose ul {
  list-style: none;
  margin: 1.25rem 0;
  padding-inline-start: 0;
}
.completion-prose ul li {
  position: relative;
  padding-inline-start: 1.5rem;
  margin-bottom: 0.625rem;
  color: #424245;
}
.completion-prose ul li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0.375rem;
  top: 0.75rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: #15803D;
}
.completion-prose ol {
  list-style: decimal;
  margin: 1.25rem 0;
  padding-inline-start: 1.75rem;
}
.completion-prose ol li {
  margin-bottom: 0.625rem;
  color: #424245;
  padding-inline-start: 0.375rem;
}
.completion-prose ol li::marker {
  color: #6E6E73;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.completion-prose table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.75rem 0;
  font-size: 0.9375rem;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
}
.completion-prose thead { background: #F5F5F7; }
.completion-prose thead th {
  font-weight: 600;
  color: #000;
  text-align: start;
  padding: 0.875rem 1.125rem;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.completion-prose tbody td {
  padding: 1rem 1.125rem;
  color: #424245;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  vertical-align: top;
  line-height: 1.65;
}
.completion-prose tbody tr:last-child td { border-bottom: 0; }
.completion-prose tbody tr td:first-child {
  color: #000;
  font-weight: 500;
  width: 38%;
}
.completion-prose tbody td strong { color: #000; font-weight: 700; }
.completion-prose hr {
  border: 0;
  margin: 2.75rem auto;
  width: 60px;
  height: 4px;
  background-image:
    radial-gradient(circle, #15803D 50%, transparent 55%),
    radial-gradient(circle, rgba(0,0,0,0.18) 50%, transparent 55%),
    radial-gradient(circle, rgba(0,0,0,0.18) 50%, transparent 55%);
  background-size: 4px 4px;
  background-repeat: no-repeat;
  background-position: 50% 0, 0 0, 100% 0;
  opacity: 0.8;
}
.completion-prose code {
  background: #F5F5F7;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #000;
}
.completion-prose pre {
  background: #1D1D1F;
  color: #F5F5F7;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.7;
}
.completion-prose pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
}
@media (max-width: 640px) {
  .completion-prose h2 { font-size: 1.375rem; margin-top: 2.5rem; padding-top: 1.5rem; }
  .completion-prose blockquote { padding: 1rem 1.125rem; border-radius: 1rem; }
  .completion-prose table { font-size: 0.875rem; }
  .completion-prose thead th { padding: 0.75rem 0.875rem; }
  .completion-prose tbody td { padding: 0.875rem; }
}
</style>
```

- [ ] **Step 2: Verify 404 in the browser**

With `yarn dev` running, `curl -X PUT` the test project's `completion_md` to `null` (as in Task 3 Step 2), then open `http://localhost:3002/done/<slug>` in a browser. Expected: Nuxt's error page (`error.vue`) renders, not the completion layout.

- [ ] **Step 3: Restore content and verify rendering**

Restore the test markdown (Task 3 Step 3's curl), then reload `http://localhost:3002/done/<slug>`. Confirm:
- The header shows the business logo/name, "تم إنجاز المشروع" eyebrow, the project name, and the customer name.
- The markdown body renders the `# اكتمال المشروع — تجربة` heading, the paragraph, and the `## الميزات` bullet list with green-dot bullets.
- The "اطبع / احفظ PDF" button opens the browser's print dialog.

- [ ] **Step 4: Full end-to-end pass with the real example content**

In the admin "الإكمال" tab (Task 4), paste in a markdown version of the RIYAD STUDIO-style example the user originally provided (tech stack, client access, completed pages, admin panel, delivered scope, support period sections), save, then open `/done/<slug>` and visually confirm every section (including the table under "Delivered Scope" if written as a markdown table, and any headings/lists) renders cleanly with no raw markdown syntax showing through.

- [ ] **Step 5: Stage & propose commit**

```bash
git add pages/done/\[slug\].vue
git commit -m "add public project completion page at /done/[slug]"
```

---

## Self-Review Notes

- **Spec coverage:** migration (Task 1) → admin write path (Task 2) → public read path (Task 3) → admin UI tab (Task 4) → public page (Task 5) covers every section of the design spec (architecture, admin UI, public page, edge cases). Deletion-cascade and slug-change edge cases need no new code — they're inherent to the existing `projects` row lifecycle, confirmed by inspection, not left as untested assumptions.
- **Type/name consistency:** `completion_md` is the field name used identically in the migration, the PUT body, the GET response, and the Vue refs (`completionMd`) — no mismatches.
- **No placeholder steps:** every step above has literal code or an exact command with an exact expected result.
