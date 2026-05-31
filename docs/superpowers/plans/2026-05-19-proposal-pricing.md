# Proposal Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track an original price and discounted price on every proposal so the admin dashboard shows total income across all proposals.

**Architecture:** Two nullable `INTEGER` columns (`price`, `price_after_discount`) added to the existing `proposals` table, stored as halalas (SAR × 100). Form inputs in admin pages edit decimal SAR; conversion happens client-side. Dashboard widget aggregates client-side from the existing list endpoint — no new endpoints. Public viewer is untouched.

**Tech Stack:** Nuxt 3 (Vue) on Cloudflare Pages + Workers, D1 (binding `DB`), Web Crypto auth, Tailwind. No test framework — verification is manual curl smoke tests against `wrangler pages dev` (matches the project's existing pattern in `CLAUDE.md`).

**Conventions:**
- Money is stored as integer halalas; convert at the leaf.
- Use `yarn` only — never `npm`.
- Dev server runs on port 3002+; smoke-tests run on port 8790 (wrangler).
- Don't run `git commit` unless explicitly authorized. Single commit at the end of this plan.
- Reference the spec at `docs/superpowers/specs/2026-05-19-proposal-pricing-design.md`.

---

## Task 1: Create migration file

**Files:**
- Create: `migrations/0003_proposal_pricing.sql`

- [ ] **Step 1: Write the migration**

Create `migrations/0003_proposal_pricing.sql` with this content:

```sql
-- Add pricing tracking columns to proposals.
-- Both nullable: existing rows get NULL ("not tracked"), counted as 0 in aggregates.
-- Amounts stored as halalas (SAR × 100), matching invoice system convention.

ALTER TABLE proposals ADD COLUMN price                INTEGER;
ALTER TABLE proposals ADD COLUMN price_after_discount INTEGER;
```

- [ ] **Step 2: Sanity-check the file**

Run:
```sh
cat migrations/0003_proposal_pricing.sql
```
Expected: prints the two `ALTER TABLE` statements above.

---

## Task 2: Apply migration to local D1

**Files:**
- Modify: local D1 binding (no source file changes)

- [ ] **Step 1: Apply the migration locally**

Run:
```sh
npx wrangler d1 execute sufyanfa-proposals --local --file=migrations/0003_proposal_pricing.sql
```
Expected: output ends with something like `🚣 Executed 2 commands in N.NNs`. No errors.

- [ ] **Step 2: Verify the columns exist locally**

Run:
```sh
npx wrangler d1 execute sufyanfa-proposals --local --command="SELECT name FROM pragma_table_info('proposals') WHERE name IN ('price','price_after_discount') ORDER BY name"
```
Expected: two rows — `price` and `price_after_discount`.

If only one row or none appears, the migration didn't apply — re-run Step 1 and investigate before continuing.

---

## Task 3: Apply migration to remote D1

**Files:**
- Modify: remote D1 binding (no source file changes)

- [ ] **Step 1: Apply the migration to production D1**

Run:
```sh
npx wrangler d1 execute sufyanfa-proposals --remote --file=migrations/0003_proposal_pricing.sql
```
Expected: prompts for confirmation, then prints something like `🚣 Executed 2 commands in N.NNs`. Confirms with `y` if asked.

- [ ] **Step 2: Verify the columns exist on prod**

Run:
```sh
npx wrangler d1 execute sufyanfa-proposals --remote --command="SELECT name FROM pragma_table_info('proposals') WHERE name IN ('price','price_after_discount') ORDER BY name"
```
Expected: two rows — `price` and `price_after_discount`.

---

## Task 4: Accept price fields on the POST endpoint

**Files:**
- Modify: `server/api/admin/proposals/index.post.ts`

- [ ] **Step 1: Extend the `CreateBody` interface**

Find:
```ts
interface CreateBody {
  slug: string
  title: string
  client_name: string
  client_label?: string
  proposal_date: string
  password: string
  content_md: string
  cta_label?: string
  cta_url?: string
  expires_at?: number | null
}
```

Replace with:
```ts
interface CreateBody {
  slug: string
  title: string
  client_name: string
  client_label?: string
  proposal_date: string
  password: string
  content_md: string
  cta_label?: string
  cta_url?: string
  expires_at?: number | null
  price?: number | null
  price_after_discount?: number | null
}
```

- [ ] **Step 2: Add the columns to the INSERT statement**

Find:
```ts
  const result = await db
    .prepare(`
      INSERT INTO proposals
      (slug, title, client_name, client_label, proposal_date, password_hash, content_md,
       cta_label, cta_url, status, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `)
    .bind(
      body.slug,
      body.title,
      body.client_name,
      body.client_label ?? null,
      body.proposal_date,
      passwordHash,
      body.content_md,
      body.cta_label ?? null,
      body.cta_url ?? null,
      body.expires_at ?? null,
      now,
      now
    )
    .run()
```

Replace with:
```ts
  const result = await db
    .prepare(`
      INSERT INTO proposals
      (slug, title, client_name, client_label, proposal_date, password_hash, content_md,
       cta_label, cta_url, status, expires_at, price, price_after_discount, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)
    `)
    .bind(
      body.slug,
      body.title,
      body.client_name,
      body.client_label ?? null,
      body.proposal_date,
      passwordHash,
      body.content_md,
      body.cta_label ?? null,
      body.cta_url ?? null,
      body.expires_at ?? null,
      body.price ?? null,
      body.price_after_discount ?? null,
      now,
      now
    )
    .run()
```

- [ ] **Step 3: Type-check the file is still valid**

Run:
```sh
yarn nuxt typecheck 2>&1 | grep -i 'index.post.ts' || echo "OK"
```
Expected: `OK` (no errors mentioning this file). If `typecheck` script doesn't exist or fails for unrelated reasons, skip — the manual smoke test in Task 11 will catch real breakage.

---

## Task 5: Accept price fields on the PATCH endpoint

**Files:**
- Modify: `server/api/admin/proposals/[id].patch.ts`

- [ ] **Step 1: Extend the `PatchBody` interface and ALLOWED whitelist**

Find:
```ts
interface PatchBody {
  title?: string
  client_name?: string
  client_label?: string | null
  proposal_date?: string
  password?: string
  content_md?: string
  cta_label?: string | null
  cta_url?: string | null
  expires_at?: number | null
}

const ALLOWED = ['title', 'client_name', 'client_label', 'proposal_date', 'content_md', 'cta_label', 'cta_url', 'expires_at'] as const
```

Replace with:
```ts
interface PatchBody {
  title?: string
  client_name?: string
  client_label?: string | null
  proposal_date?: string
  password?: string
  content_md?: string
  cta_label?: string | null
  cta_url?: string | null
  expires_at?: number | null
  price?: number | null
  price_after_discount?: number | null
}

const ALLOWED = ['title', 'client_name', 'client_label', 'proposal_date', 'content_md', 'cta_label', 'cta_url', 'expires_at', 'price', 'price_after_discount'] as const
```

The existing dynamic UPDATE loop (`for (const k of ALLOWED) { ... values.push(body[k] ?? null) }`) handles both new columns automatically.

---

## Task 6: Return price fields from the list endpoint

**Files:**
- Modify: `server/api/admin/proposals/index.get.ts`

- [ ] **Step 1: Add columns to the SELECT projection**

Find:
```ts
  const { results } = await db
    .prepare(`
      SELECT p.id, p.slug, p.title, p.client_name, p.proposal_date, p.status,
             p.expires_at, p.accepted_at, p.declined_at, p.created_at, p.updated_at,
             (SELECT COUNT(*) FROM proposal_views v WHERE v.proposal_id = p.id) AS views_count,
             (SELECT MAX(viewed_at) FROM proposal_views v WHERE v.proposal_id = p.id) AS last_viewed_at
      FROM proposals p
      ORDER BY p.created_at DESC
    `)
    .all()
```

Replace with:
```ts
  const { results } = await db
    .prepare(`
      SELECT p.id, p.slug, p.title, p.client_name, p.proposal_date, p.status,
             p.expires_at, p.accepted_at, p.declined_at, p.price, p.price_after_discount,
             p.created_at, p.updated_at,
             (SELECT COUNT(*) FROM proposal_views v WHERE v.proposal_id = p.id) AS views_count,
             (SELECT MAX(viewed_at) FROM proposal_views v WHERE v.proposal_id = p.id) AS last_viewed_at
      FROM proposals p
      ORDER BY p.created_at DESC
    `)
    .all()
```

---

## Task 7: Return price fields from the detail endpoint

**Files:**
- Modify: `server/api/admin/proposals/[id].get.ts`

- [ ] **Step 1: Add columns to the SELECT projection**

Find:
```ts
  const proposal = await db
    .prepare(`
      SELECT id, slug, title, client_name, client_label, proposal_date, content_md,
             cta_label, cta_url, status, expires_at, accepted_at, declined_at, decline_note,
             created_at, updated_at
      FROM proposals WHERE id = ?
    `)
```

Replace with:
```ts
  const proposal = await db
    .prepare(`
      SELECT id, slug, title, client_name, client_label, proposal_date, content_md,
             cta_label, cta_url, status, expires_at, accepted_at, declined_at, decline_note,
             price, price_after_discount, created_at, updated_at
      FROM proposals WHERE id = ?
    `)
```

---

## Task 8: Add price inputs to the "new proposal" form

**Files:**
- Modify: `pages/admin/proposals/new.vue`

- [ ] **Step 1: Add price fields to the `form` reactive**

Find:
```ts
const form = reactive({
  title: '',
  slug: '',
  client_name: '',
  client_label: '',
  proposal_date: today,
  password: '',
  content_md: '',
  cta_label: '',
  cta_url: ''
})
```

Replace with:
```ts
const form = reactive({
  title: '',
  slug: '',
  client_name: '',
  client_label: '',
  proposal_date: today,
  password: '',
  content_md: '',
  cta_label: '',
  cta_url: '',
  priceSAR: '' as string,                // edited as decimal SAR; '' means "not tracked"
  priceAfterDiscountSAR: '' as string
})
```

- [ ] **Step 2: Add the two number inputs to the template**

Find the `AdminProposalField` block for `tax_label`/`cta_url`:
```vue
          <div class="grid grid-cols-2 gap-4">
            <AdminProposalField label="نص زر الإجراء (اختياري)">
              <input v-model="form.cta_label" class="input" placeholder="احجز جلسة" />
            </AdminProposalField>
            <AdminProposalField label="رابط زر الإجراء">
              <input v-model="form.cta_url" class="input" placeholder="https://cal.com/..." dir="ltr" />
            </AdminProposalField>
          </div>
```

Immediately AFTER that block (before `<AdminProposalField label="المحتوى (Markdown)">`), insert:
```vue
          <div class="grid grid-cols-2 gap-4">
            <AdminProposalField label="السعر (ر.س. — اختياري)">
              <input v-model="form.priceSAR" type="number" step="0.01" min="0" class="input" placeholder="0.00" dir="ltr" />
            </AdminProposalField>
            <AdminProposalField label="السعر بعد الخصم (ر.س. — اختياري)">
              <input v-model="form.priceAfterDiscountSAR" type="number" step="0.01" min="0" class="input" placeholder="0.00" dir="ltr" />
            </AdminProposalField>
          </div>
```

- [ ] **Step 3: Convert SAR → halalas in the `save()` body**

Find:
```ts
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/proposals', {
      method: 'POST',
      body: {
        slug: form.slug,
        title: form.title,
        client_name: form.client_name,
        client_label: form.client_label || undefined,
        proposal_date: form.proposal_date,
        password: form.password,
        content_md: form.content_md,
        cta_label: form.cta_label || undefined,
        cta_url: form.cta_url || undefined,
        expires_at
      }
    })
```

Replace with:
```ts
    const toHalalas = (s: string): number | null => {
      if (s === '' || s === null || s === undefined) return null
      const n = Number(s)
      if (!Number.isFinite(n)) return null
      return Math.round(n * 100)
    }
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/proposals', {
      method: 'POST',
      body: {
        slug: form.slug,
        title: form.title,
        client_name: form.client_name,
        client_label: form.client_label || undefined,
        proposal_date: form.proposal_date,
        password: form.password,
        content_md: form.content_md,
        cta_label: form.cta_label || undefined,
        cta_url: form.cta_url || undefined,
        expires_at,
        price: toHalalas(form.priceSAR),
        price_after_discount: toHalalas(form.priceAfterDiscountSAR)
      }
    })
```

---

## Task 9: Add price inputs to the edit form on the detail page

**Files:**
- Modify: `pages/admin/proposals/[id].vue`

- [ ] **Step 1: Extend the `Response.proposal` interface**

Find:
```ts
interface Response {
  proposal: {
    id: number
    slug: string
    title: string
    client_name: string
    client_label: string | null
    proposal_date: string
    content_md: string
    cta_label: string | null
    cta_url: string | null
    status: string
    expires_at: number | null
    accepted_at: number | null
    declined_at: number | null
    decline_note: string | null
    created_at: number
    updated_at: number
  }
  views: Array<{ viewed_at: number; user_agent: string | null }>
  stats: { count: number; last_viewed_at: number | null }
}
```

Replace with:
```ts
interface Response {
  proposal: {
    id: number
    slug: string
    title: string
    client_name: string
    client_label: string | null
    proposal_date: string
    content_md: string
    cta_label: string | null
    cta_url: string | null
    status: string
    expires_at: number | null
    accepted_at: number | null
    declined_at: number | null
    decline_note: string | null
    price: number | null
    price_after_discount: number | null
    created_at: number
    updated_at: number
  }
  views: Array<{ viewed_at: number; user_agent: string | null }>
  stats: { count: number; last_viewed_at: number | null }
}
```

- [ ] **Step 2: Add price fields to the `edit` reactive**

Find:
```ts
const edit = reactive({
  title: '',
  client_name: '',
  client_label: '',
  proposal_date: '',
  password: '',
  expiresDate: '',
  cta_label: '',
  cta_url: '',
  content_md: ''
})
```

Replace with:
```ts
const edit = reactive({
  title: '',
  client_name: '',
  client_label: '',
  proposal_date: '',
  password: '',
  expiresDate: '',
  cta_label: '',
  cta_url: '',
  content_md: '',
  priceSAR: '' as string,
  priceAfterDiscountSAR: '' as string
})
```

- [ ] **Step 3: Prefill prices when `data` loads**

Find:
```ts
watch(data, (d) => {
  if (!d) return
  const p = d.proposal
  edit.title = p.title
  edit.client_name = p.client_name
  edit.client_label = p.client_label || ''
  edit.proposal_date = p.proposal_date
  edit.cta_label = p.cta_label || ''
  edit.cta_url = p.cta_url || ''
  edit.content_md = p.content_md
  edit.expiresDate = p.expires_at ? new Date(p.expires_at).toISOString().slice(0, 10) : ''
}, { immediate: true })
```

Replace with:
```ts
watch(data, (d) => {
  if (!d) return
  const p = d.proposal
  edit.title = p.title
  edit.client_name = p.client_name
  edit.client_label = p.client_label || ''
  edit.proposal_date = p.proposal_date
  edit.cta_label = p.cta_label || ''
  edit.cta_url = p.cta_url || ''
  edit.content_md = p.content_md
  edit.expiresDate = p.expires_at ? new Date(p.expires_at).toISOString().slice(0, 10) : ''
  edit.priceSAR = p.price !== null && p.price !== undefined ? (p.price / 100).toFixed(2) : ''
  edit.priceAfterDiscountSAR = p.price_after_discount !== null && p.price_after_discount !== undefined
    ? (p.price_after_discount / 100).toFixed(2)
    : ''
}, { immediate: true })
```

- [ ] **Step 4: Add the two number inputs to the edit form template**

Find (inside the edit form, immediately after the cta `<div class="grid grid-cols-2 gap-4">` block that ends with the cta_url field):
```vue
            <div class="grid grid-cols-2 gap-4">
              <AdminProposalField label="نص زر الإجراء">
                <input v-model="edit.cta_label" class="input" />
              </AdminProposalField>
              <AdminProposalField label="رابط زر الإجراء">
                <input v-model="edit.cta_url" class="input" dir="ltr" />
              </AdminProposalField>
            </div>
```

Immediately AFTER that block (before `<AdminProposalField label="المحتوى (Markdown)">`), insert:
```vue
            <div class="grid grid-cols-2 gap-4">
              <AdminProposalField label="السعر (ر.س. — اختياري)">
                <input v-model="edit.priceSAR" type="number" step="0.01" min="0" class="input" dir="ltr" />
              </AdminProposalField>
              <AdminProposalField label="السعر بعد الخصم (ر.س. — اختياري)">
                <input v-model="edit.priceAfterDiscountSAR" type="number" step="0.01" min="0" class="input" dir="ltr" />
              </AdminProposalField>
            </div>
```

- [ ] **Step 5: Convert SAR → halalas in the `saveEdit()` body**

Find:
```ts
    const body: Record<string, unknown> = {
      title: edit.title,
      client_name: edit.client_name,
      client_label: edit.client_label || null,
      proposal_date: edit.proposal_date,
      cta_label: edit.cta_label || null,
      cta_url: edit.cta_url || null,
      content_md: edit.content_md,
      expires_at: edit.expiresDate ? new Date(edit.expiresDate).getTime() : null
    }
```

Replace with:
```ts
    const toHalalas = (s: string): number | null => {
      if (s === '' || s === null || s === undefined) return null
      const n = Number(s)
      if (!Number.isFinite(n)) return null
      return Math.round(n * 100)
    }
    const body: Record<string, unknown> = {
      title: edit.title,
      client_name: edit.client_name,
      client_label: edit.client_label || null,
      proposal_date: edit.proposal_date,
      cta_label: edit.cta_label || null,
      cta_url: edit.cta_url || null,
      content_md: edit.content_md,
      expires_at: edit.expiresDate ? new Date(edit.expiresDate).getTime() : null,
      price: toHalalas(edit.priceSAR),
      price_after_discount: toHalalas(edit.priceAfterDiscountSAR)
    }
```

---

## Task 10: Add the income widget + price column to the dashboard

**Files:**
- Modify: `pages/admin/proposals/index.vue`

- [ ] **Step 1: Extend the `Proposal` interface**

Find:
```ts
interface Proposal {
  id: number
  slug: string
  title: string
  client_name: string
  proposal_date: string
  status: string
  views_count: number
}
```

Replace with:
```ts
interface Proposal {
  id: number
  slug: string
  title: string
  client_name: string
  proposal_date: string
  status: string
  views_count: number
  price: number | null
  price_after_discount: number | null
}
```

- [ ] **Step 2: Add the `proposalStats` computed**

Find (right after the `counts` computed):
```ts
const counts = computed(() => {
  const c: Record<string, number> = { all: proposals.value.length }
  for (const p of proposals.value) c[p.status] = (c[p.status] ?? 0) + 1
  return c
})
```

Immediately AFTER that block, insert:
```ts
const proposalStats = computed(() => {
  let gross = 0, net = 0
  for (const p of proposals.value) {
    gross += p.price ?? 0
    net   += p.price_after_discount ?? p.price ?? 0
  }
  return { gross, net, discount: gross - net }
})
```

- [ ] **Step 3: Add the income widget to the template**

Find the existing invoices widget closing tag and the start of the proposals header:
```vue
        <NuxtLink to="/admin/invoices" class="text-sm text-[#15803D] hover:underline">عرض كل الفواتير ←</NuxtLink>
      </section>

      <header class="flex items-center justify-between mb-10">
```

Replace with:
```vue
        <NuxtLink to="/admin/invoices" class="text-sm text-[#15803D] hover:underline">عرض كل الفواتير ←</NuxtLink>
      </section>

      <section class="bg-white border border-black/10 rounded-2xl p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">إيرادات العروض</h2>
        <div class="grid grid-cols-3 gap-6">
          <div>
            <div class="text-xs text-gray-500 mb-1">الإجمالي</div>
            <div class="text-xl font-bold" dir="ltr">{{ formatSAR(proposalStats.gross) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">بعد الخصم</div>
            <div class="text-xl font-bold text-[#15803D]" dir="ltr">{{ formatSAR(proposalStats.net) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">مجموع الخصومات</div>
            <div class="text-xl font-bold text-gray-600" dir="ltr">{{ formatSAR(proposalStats.discount) }}</div>
          </div>
        </div>
      </section>

      <header class="flex items-center justify-between mb-10">
```

- [ ] **Step 4: Add the "السعر" column to the list table**

Find the table header row:
```vue
        <div class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
          <div class="col-span-5">العنوان</div>
          <div class="col-span-3">العميل</div>
          <div class="col-span-2">الحالة</div>
          <div class="col-span-1 text-center">المشاهدات</div>
          <div class="col-span-1 text-end">التاريخ</div>
        </div>
```

Replace with:
```vue
        <div class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
          <div class="col-span-4">العنوان</div>
          <div class="col-span-3">العميل</div>
          <div class="col-span-2">الحالة</div>
          <div class="col-span-1 text-end">السعر</div>
          <div class="col-span-1 text-center">المشاهدات</div>
          <div class="col-span-1 text-end">التاريخ</div>
        </div>
```

- [ ] **Step 5: Add the price cell to each row**

Find:
```vue
            <NuxtLink
              :to="`/admin/proposals/${p.id}`"
              class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white transition-colors border-b border-black/[0.04] last:border-0"
            >
              <div class="col-span-5">
                <div class="text-sm font-semibold text-ink truncate">{{ p.title }}</div>
                <div class="text-[12px] text-ink-mute mt-0.5" dir="ltr">/p/{{ p.slug }}</div>
              </div>
              <div class="col-span-3 text-sm text-ink-soft truncate">{{ p.client_name }}</div>
              <div class="col-span-2">
                <AdminStatusBadge :status="p.status" />
              </div>
              <div class="col-span-1 text-center text-sm font-semibold text-ink tabular-nums">{{ p.views_count }}</div>
              <div class="col-span-1 text-end text-[12px] text-ink-mute" dir="ltr">{{ formatDate(p.proposal_date) }}</div>
            </NuxtLink>
```

Replace with:
```vue
            <NuxtLink
              :to="`/admin/proposals/${p.id}`"
              class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white transition-colors border-b border-black/[0.04] last:border-0"
            >
              <div class="col-span-4">
                <div class="text-sm font-semibold text-ink truncate">{{ p.title }}</div>
                <div class="text-[12px] text-ink-mute mt-0.5" dir="ltr">/p/{{ p.slug }}</div>
              </div>
              <div class="col-span-3 text-sm text-ink-soft truncate">{{ p.client_name }}</div>
              <div class="col-span-2">
                <AdminStatusBadge :status="p.status" />
              </div>
              <div class="col-span-1 text-end text-[12px] text-ink tabular-nums" dir="ltr">
                <span v-if="(p.price_after_discount ?? p.price) !== null">{{ formatSAR(p.price_after_discount ?? p.price ?? 0) }}</span>
                <span v-else class="text-ink-mute">—</span>
              </div>
              <div class="col-span-1 text-center text-sm font-semibold text-ink tabular-nums">{{ p.views_count }}</div>
              <div class="col-span-1 text-end text-[12px] text-ink-mute" dir="ltr">{{ formatDate(p.proposal_date) }}</div>
            </NuxtLink>
```

---

## Task 11: Local smoke test via `wrangler pages dev`

**Files:** None (verification only)

- [ ] **Step 1: Clean state**

Run:
```sh
rm -rf dist .output .nuxt
```

- [ ] **Step 2: Build for production**

Run:
```sh
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=8192 yarn build
```
Expected: build completes without errors. Look for `Σ Total size:` line near the end.

- [ ] **Step 3: Verify no vite-node leak**

Run:
```sh
ls dist/_worker.js/chunks/vite-node-shared.mjs 2>&1
```
Expected: `ls: dist/_worker.js/chunks/vite-node-shared.mjs: No such file or directory`

Run:
```sh
head -1 dist/_worker.js/chunks/app/client.manifest.mjs
```
Expected: starts with `const e={` (static object). If it starts with `const client_manifest=()=>o("/manifest")`, the dev runtime leaked into prod — stop and check `nuxt.config.ts` for the `nitro-cloudflare-dev` dev-only guard.

- [ ] **Step 4: Run wrangler dev**

Run in background:
```sh
npx wrangler pages dev dist/ --port 8790
```

- [ ] **Step 5: Smoke-test routes**

Run:
```sh
/usr/bin/curl -s -o /dev/null -w "/admin/proposals %{http_code}\n" http://localhost:8790/admin/proposals
/usr/bin/curl -s -o /dev/null -w "/admin/proposals/new %{http_code}\n" http://localhost:8790/admin/proposals/new
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" http://localhost:8790/
```
Expected: each line ends with `200`. (Admin pages render fine without a session — they client-side redirect, not 4xx.)

- [ ] **Step 6: Functional check — create a priced proposal locally**

Open `http://localhost:8790/admin/login` in a browser, log in with the seeded admin, navigate to `/admin/proposals/new`, fill in:
- Title: `سعر اختباري`
- Slug: `price-test`
- Client name: `اختبار`
- Date: today
- Password: any
- **السعر:** `1000.00`
- **السعر بعد الخصم:** `850.00`
- Content: any

Save and confirm:
- You're redirected to the proposal detail page.
- The dashboard `/admin/proposals` shows the row with `850.00 ر.س.` in the price column.
- The "إيرادات العروض" widget includes those amounts in its totals (manually add to existing rows to verify).

- [ ] **Step 7: Functional check — edit existing proposal**

On `/admin/proposals/<id>`, click "تعديل", change السعر بعد الخصم to `900.00`, save. Confirm:
- After refresh the inputs show `1000.00` and `900.00`.
- Dashboard widget reflects the new net.

- [ ] **Step 8: Stop wrangler**

Stop the background `wrangler pages dev` process before deploying.

---

## Task 12: Deploy and verify on prod

**Files:** None (deploy + verification only)

- [ ] **Step 1: Deploy the verified `dist/`**

Do NOT rebuild — deploy the exact build that passed Task 11.

Run:
```sh
npx wrangler pages deploy dist --project-name=sufyanfa-com
```
Expected: wrangler prints `✨ Deployment complete!` and a preview URL like `https://abc123.sufyanfa-com.pages.dev`.

- [ ] **Step 2: Smoke-test the preview URL**

Substitute the printed preview URL for `<preview>`:
```sh
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" https://<preview>.sufyanfa-com.pages.dev/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" https://<preview>.sufyanfa-com.pages.dev/admin/login
```
Expected: each is `200`.

- [ ] **Step 3: Smoke-test the prod alias**

Run:
```sh
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" https://sufyanfa.com/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" https://sufyanfa.com/admin/login
```
Expected: each is `200`.

- [ ] **Step 4: Visual check on prod**

Open `https://sufyanfa.com/admin/proposals` in a browser, log in. Confirm:
- "إيرادات العروض" widget appears between the invoices widget and the page header.
- All three totals render with Latin digits (e.g. `0.00 ر.س.`).
- Existing proposals show `—` in the new price column.

- [ ] **Step 5: Ask user for permission to commit**

Stop here. Tell the user the feature is live on prod and ask whether to make the final commit. Do NOT run `git commit` unless the user says yes (per the project's standing rule — see `CLAUDE.md`).

If the user authorizes the commit, stage only the relevant files:
```sh
git add \
  migrations/0003_proposal_pricing.sql \
  server/api/admin/proposals/index.post.ts \
  server/api/admin/proposals/index.get.ts \
  server/api/admin/proposals/\[id\].patch.ts \
  server/api/admin/proposals/\[id\].get.ts \
  pages/admin/proposals/new.vue \
  pages/admin/proposals/\[id\].vue \
  pages/admin/proposals/index.vue \
  docs/superpowers/specs/2026-05-19-proposal-pricing-design.md \
  docs/superpowers/plans/2026-05-19-proposal-pricing.md
```

Then commit (no Co-Authored-By line — see standing rule):
```sh
git commit -m "feat: add price + discount tracking to proposals"
```

---

## Spec coverage check

- [x] Migration `0003_proposal_pricing.sql` adds two nullable INTEGER columns → Task 1
- [x] POST accepts both fields → Task 4
- [x] PATCH accepts both fields → Task 5
- [x] List GET returns both fields → Task 6
- [x] Detail GET returns both fields → Task 7
- [x] New proposal form has two SAR inputs → Task 8
- [x] Edit form has two SAR inputs and prefills them → Task 9
- [x] Dashboard widget with gross/net/discount → Task 10 (Steps 2–3)
- [x] Price column in dashboard table → Task 10 (Steps 4–5)
- [x] Public viewer untouched → No task touches `pages/p/[slug].vue` or `server/api/p/*`
- [x] Build verified before deploy (no vite-node leak) → Task 11 (Step 3)
- [x] Local Workers smoke test → Task 11 (Steps 4–7)
- [x] Prod smoke test → Task 12 (Steps 2–4)
- [x] Single commit at the end, gated on explicit user OK → Task 12 (Step 5)
