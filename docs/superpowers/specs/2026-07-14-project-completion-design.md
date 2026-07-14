# Project Completion — Design Spec

## Goal

Give the admin a way to tell a client "the project is done" with a proper handover
document, shareable via a plain link — modeled on the RIYAD STUDIO example the user
provided (tech stack, delivered pages, admin panel features, delivered scope,
support period, etc.).

## Non-Goals

- No structured/templated fields (tech stack list, feature checklist, etc.) — the
  admin writes one freeform markdown document, same as proposals.
- No draft/publish workflow — saving makes the public link live immediately.
- No PDF generation beyond the browser's native print — matches the invoice viewer.
- No WhatsApp/email send integration for this link — admin copies and sends it
  manually, same as invoice/proposal links today.
- No automatic change to `projects.status` — marking a project "منتهي" (completed)
  stays a separate, manual action on the existing project edit form.

## Decisions

| Question | Decision |
|---|---|
| Tied to existing `projects` system or standalone entity? | Tied to existing `projects` row (1:1) |
| Content model | Freeform markdown, single field |
| Where shown to client | Separate public link, no password |
| Publish step | None — visible immediately on save |
| Route | `/done/<project-slug>` (reuses the project's existing slug) |
| Storage | New nullable column `completion_md` on `projects` |

## Data Model

**Migration `0008_project_completion.sql`:**

```sql
ALTER TABLE projects ADD COLUMN completion_md TEXT;
```

No new table. This mirrors the existing `invoices.notes` pattern — an optional
free-text column on the parent row, not a child table, since there's exactly one
completion document per project.

## API Changes

### Admin write path

Extend the existing `PUT /api/admin/projects/[id].put.ts` (already does
`if (body.field !== undefined) { updates.push(...) }` for each editable field) to
accept and persist `completion_md`. No new endpoint.

### Public read path

New `server/api/done/[slug].get.ts`, modeled on `server/api/i/[slug].get.ts`:

- Look up `projects` row by `slug`.
- 404 (`"الصفحة غير موجودة"`) if the project doesn't exist OR `completion_md` is
  null/empty — a project with no completion content has no public page, full stop.
- Join `customers` for the customer name.
- Include business settings (logo_url, business_name) for branded header, same
  fields already selected in `server/api/i/[slug].get.ts`.
- Return: `{ project: { name, slug }, customer: { name }, completion_md, settings }`.

No auth, no password, no preview mode — this endpoint is either 404 or fully public,
matching the "no draft state" decision.

## Admin UI

**`pages/admin/projects/[id].vue`** — add a third tab next to `البورد` / `الموارد`:

- Tab label: **"الإكمال"**.
- Content: a single large `<textarea>` bound to a local `completionMd` ref,
  initialized from `board.project.completion_md ?? ''`.
- "حفظ" button calls `PUT /api/admin/projects/{id}` with `{ completion_md }`, then
  refreshes.
- When `board.project.completion_md` is non-empty, show below the textarea:
  - The public URL `sufyanfa.com/done/<slug>` (read-only, `dir="ltr"`).
  - "نسخ الرابط" button — same clipboard pattern as `copyLink()` on
    `pages/admin/invoices/[id].vue`.
  - "عرض" link — opens `/done/<slug>` in a new tab.
- No separate "publish" control — writing content and saving is the only action.

The `board.project` object returned by `GET /api/admin/projects/[id]` needs
`completion_md` added to its `SELECT`.

## Public Page

**`pages/done/[slug].vue`**, `bare` layout, modeled on `pages/i/[slug].vue`'s
loading/not-found handling and `pages/p/[slug].vue`'s markdown rendering:

- **Loading**: minimal centered `…` state while fetching.
- **Not found**: same 404 card pattern as `/p/[slug].vue` — "الصفحة غير موجودة" with
  a link back to `sufyanfa.com`.
- **Loaded**:
  - Header card: sufyanfa logo (or business logo if set), eyebrow tag "تم إنجاز
    المشروع", project name, customer name. No accept/decline actions — this is a
    record, not a decision point.
  - Body: `renderMarkdown(completion_md)` rendered via `v-html`, wrapped in a
    `.completion-prose` class carrying the same editorial CSS block currently in
    `pages/p/[slug].vue` (`.proposal-prose`) — headings, lists, blockquote,
    table, hr ornament, code block styling. Copied into this page's own `<style>`
    block per the existing convention that each viewer page owns its prose styles.
  - "طباعة / حفظ PDF" button at the bottom, same `printIt()` pattern as
    `pages/i/[slug].vue`, with matching `@media print` rules.
  - `useHead` sets `robots: noindex, nofollow`, matching other client-facing pages.

## Edge Cases

- **Project deleted**: `DELETE /api/admin/projects/[id]` already cascades (FK
  `ON DELETE CASCADE` on child tables); `completion_md` is a column on the row
  itself so it's gone with it — `/done/<slug>` 404s automatically, no extra
  cleanup.
- **Slug changed**: the project edit form already allows changing `slug` (with a
  uniqueness check). Changing it changes the `/done/<slug>` URL too, same as
  `/project/<slug>` today — no separate token to keep in sync.
- **Empty markdown after having content**: if the admin clears the textarea and
  saves, `completion_md` becomes `''`/empty — `/done/<slug>` should treat empty
  string the same as null (404), not render a blank page.

## Testing

- `curl` the admin `PUT` endpoint with `completion_md` set, verify D1 row updated.
- `curl /api/done/<slug>` before any content exists → 404.
- `curl /api/done/<slug>` after saving content → 200 with markdown in payload.
- Browser: fill in the admin textarea (using the RIYAD STUDIO-style example
  content), save, open `/done/<slug>` in a new tab, verify rendered output looks
  right (headings, lists, tables all styled), verify print button opens the
  browser print dialog.
- Verify deleting the project removes the public page (404).

## Implementation Order

1. Migration `0008_project_completion.sql`, apply locally.
2. `server/api/admin/projects/[id].put.ts` — accept `completion_md`.
3. `server/api/admin/projects/[id].get.ts` — include `completion_md` in the
   response used by the admin board page.
4. `server/api/done/[slug].get.ts` — new public read endpoint.
5. `pages/admin/projects/[id].vue` — add الإكمال tab.
6. `pages/done/[slug].vue` — new public page.
7. Manual curl + browser verification per Testing section above.
8. Apply migration to remote D1, deploy (only if user asks, per CLAUDE.md).
