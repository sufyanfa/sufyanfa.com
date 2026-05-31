# Invoice & Billing System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a multi-customer invoice/billing system to sufyanfa.com with shareable public links, browser print-to-PDF, status tracking (draft/sent/paid/overdue), and an admin dashboard widget. Mirrors the proposal system's architecture.

**Architecture:** Cloudflare D1 (existing `DB` binding) + Nuxt 3 SSR on Pages. Reuses the existing JWT-cookie admin auth and `bare` layout. Public viewer at `/i/[slug]`; admin under `/admin/{invoices,customers,settings}`. PDF via browser `window.print()` + print CSS (no headless Chrome, no server-side PDF lib). Money stored as integer halalas, formatted at the leaf via `Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' })`.

**Tech Stack:** Nuxt 3, Vue, TypeScript, Cloudflare D1 + Pages, Web Crypto, Tailwind, Rubik. Arabic RTL throughout. No new modules, no new bindings.

**Spec:** [`docs/superpowers/specs/2026-05-17-invoice-billing-design.md`](../specs/2026-05-17-invoice-billing-design.md)

**Conventions (project-specific, override the skill's defaults):**
- **Yarn only**, never npm.
- **Dev server on port 3002+**, never 3000/3001.
- **No emojis** in UI, copy, code comments, or commit messages.
- **Commits only when the user explicitly asks.** Each "Commit" step in this plan is a checkpoint — the implementer pauses and asks the user before running `git commit`.
- **Deploy preflight is mandatory** before any deploy — clean build, verify no `vite-node-shared.mjs` leak, smoke-test via `wrangler pages dev dist/`, then deploy and verify preview URL before trusting prod. Details in `CLAUDE.md`.
- **No new test framework.** Verification is via the dev server + the deploy preflight smoke tests. Each implementation task ends with manual verification steps + a commit checkpoint.

---

## File map

**New files:**

```
migrations/0002_invoices.sql

server/utils/money.ts
server/utils/slug.ts

server/api/admin/customers/index.get.ts
server/api/admin/customers/index.post.ts
server/api/admin/customers/[id].get.ts
server/api/admin/customers/[id].put.ts
server/api/admin/customers/[id].delete.ts

server/api/admin/settings.get.ts
server/api/admin/settings.put.ts

server/api/admin/invoices/index.get.ts
server/api/admin/invoices/index.post.ts
server/api/admin/invoices/[id].get.ts
server/api/admin/invoices/[id].put.ts
server/api/admin/invoices/[id].delete.ts
server/api/admin/invoices/[id]/duplicate.post.ts
server/api/admin/invoices/[id]/mark-sent.post.ts
server/api/admin/invoices/[id]/mark-paid.post.ts

server/api/i/[slug].get.ts

composables/useMoney.ts

components/admin/CustomerPicker.vue
components/admin/InvoiceForm.vue

pages/admin/customers/index.vue
pages/admin/customers/new.vue
pages/admin/customers/[id].vue
pages/admin/settings.vue
pages/admin/invoices/index.vue
pages/admin/invoices/new.vue
pages/admin/invoices/[id].vue
pages/i/[slug].vue
```

**Modified files:**

```
pages/admin/index.vue        (add invoices dashboard widget)
nuxt.config.ts               (add /i/** to prerender ignore)
```

---

## Task 1: Schema migration + apply locally

**Files:** Create `migrations/0002_invoices.sql`

- [ ] **Step 1.1: Write the migration**

Create `migrations/0002_invoices.sql`:

```sql
-- Invoices system: customers, invoices, line items, single-row settings.
-- Timestamps are INTEGER milliseconds (Date.now()), matching 0001_initial.sql.

CREATE TABLE customers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  notes        TEXT,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_customers_name ON customers(name);

CREATE TABLE invoices (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT NOT NULL UNIQUE,
  number            TEXT NOT NULL UNIQUE,
  customer_id       INTEGER NOT NULL REFERENCES customers(id),
  status            TEXT NOT NULL DEFAULT 'draft',
  issue_date        TEXT NOT NULL,
  due_date          TEXT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'SAR',
  adjustment        INTEGER NOT NULL DEFAULT 0,
  adjustment_label  TEXT,
  notes             TEXT,
  paid_at           INTEGER,
  sent_at           INTEGER,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE TABLE invoice_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  description  TEXT NOT NULL,
  amount       INTEGER NOT NULL
);
CREATE INDEX idx_items_invoice ON invoice_items(invoice_id);

CREATE TABLE settings (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  business_name       TEXT NOT NULL,
  logo_url            TEXT,
  email               TEXT,
  phone               TEXT,
  address             TEXT,
  bank_name           TEXT,
  bank_account_name   TEXT,
  bank_account_number TEXT,
  bank_iban           TEXT,
  default_due_days    INTEGER NOT NULL DEFAULT 14,
  default_notes       TEXT,
  updated_at          INTEGER NOT NULL
);

-- Seed the single settings row so the admin UI never sees an empty state.
INSERT INTO settings (id, business_name, logo_url, default_due_days, updated_at)
VALUES (1, 'سفيان فارع', '/logo.svg', 14, 0);
```

- [ ] **Step 1.2: Apply migration to the local D1 database**

Run:

```sh
npx wrangler d1 execute sufyanfa-proposals --local --file=migrations/0002_invoices.sql
```

Expected: `Executed N commands` (no errors).

- [ ] **Step 1.3: Verify the schema applied**

Run:

```sh
npx wrangler d1 execute sufyanfa-proposals --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected: output includes `customers`, `invoices`, `invoice_items`, `settings`, plus existing `proposals`/`users`/`proposal_views`.

```sh
npx wrangler d1 execute sufyanfa-proposals --local --command="SELECT id, business_name FROM settings;"
```

Expected: row `(1, 'سفيان فارع')`.

- [ ] **Step 1.4: Commit (ask user first)**

```sh
git add migrations/0002_invoices.sql
git commit -m "feat(invoices): schema migration for customers/invoices/items/settings"
```

---

## Task 2: Money + slug utilities

**Files:**
- Create `server/utils/money.ts`
- Create `server/utils/slug.ts`
- Create `composables/useMoney.ts`

- [ ] **Step 2.1: Write `server/utils/money.ts`**

```ts
// Money is stored as integer halalas (1 SAR = 100 halalas) to avoid float drift.
// Formatting happens only at the leaf, via Intl.NumberFormat with Arabic locale.

export const toMinor = (sar: number): number => Math.round(sar * 100)
export const fromMinor = (h: number): number => h / 100

export function formatSAR(halalas: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(halalas / 100)
}

export function computeTotals(items: { amount: number }[], adjustment: number) {
  const subtotal = items.reduce((s, i) => s + (i.amount ?? 0), 0)
  const total = subtotal + (adjustment ?? 0)
  return { subtotal, adjustment, total }
}
```

- [ ] **Step 2.2: Write `composables/useMoney.ts`**

```ts
// Client-side mirror of server/utils/money.ts. Importing server/utils into
// pages/components pulls in server-only code, so we duplicate the small surface.

export function useMoney() {
  const toMinor = (sar: number): number => Math.round(sar * 100)
  const fromMinor = (h: number): number => h / 100
  const formatSAR = (halalas: number): string =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(halalas / 100)
  const computeTotals = (items: { amount: number }[], adjustment: number) => {
    const subtotal = items.reduce((s, i) => s + (i.amount ?? 0), 0)
    return { subtotal, adjustment, total: subtotal + (adjustment ?? 0) }
  }
  return { toMinor, fromMinor, formatSAR, computeTotals }
}
```

- [ ] **Step 2.3: Write `server/utils/slug.ts`**

```ts
// 22-char URL-safe random slug for public invoice links.
// 132 bits of entropy — effectively zero collision probability.

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

export function randomSlug(length = 22): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] & 63]
  return out
}
```

- [ ] **Step 2.4: Verify the files compile**

Run:

```sh
yarn build --dotenv .env 2>&1 | tail -20
```

If you don't want a full build, just save the files and let the dev server typecheck them on next start.

Expected: no TypeScript errors mentioning `money.ts`, `slug.ts`, or `useMoney.ts`.

- [ ] **Step 2.5: Commit (ask user first)**

```sh
git add server/utils/money.ts server/utils/slug.ts composables/useMoney.ts
git commit -m "feat(invoices): money + slug utilities"
```

---

## Task 3: Customer admin API (5 endpoints)

**Files:**
- Create `server/api/admin/customers/index.get.ts`
- Create `server/api/admin/customers/index.post.ts`
- Create `server/api/admin/customers/[id].get.ts`
- Create `server/api/admin/customers/[id].put.ts`
- Create `server/api/admin/customers/[id].delete.ts`

All routes are auto-gated by `server/middleware/admin-auth.ts` (any path matching `/api/admin/*` except `/api/admin/login`).

- [ ] **Step 3.1: List endpoint `server/api/admin/customers/index.get.ts`**

```ts
import { useDB } from '~/server/utils/db'

interface CustomerRow {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  invoice_count: number
  last_invoice_at: number | null
}

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results } = await db
    .prepare(`
      SELECT c.id, c.name, c.email, c.phone, c.company, c.notes,
             COUNT(i.id) AS invoice_count,
             MAX(i.created_at) AS last_invoice_at
      FROM customers c
      LEFT JOIN invoices i ON i.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    .all<CustomerRow>()
  return { customers: results }
})
```

- [ ] **Step 3.2: Create endpoint `server/api/admin/customers/index.post.ts`**

```ts
import { useDB } from '~/server/utils/db'

interface CreateBody {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم مطلوب' })
  }

  const db = useDB(event)
  const now = Date.now()
  const result = await db
    .prepare(`
      INSERT INTO customers (name, email, phone, company, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      body.name.trim(),
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.company?.trim() || null,
      body.notes?.trim() || null,
      now,
      now,
    )
    .run()

  return { ok: true, id: result.meta?.last_row_id }
})
```

- [ ] **Step 3.3: Read endpoint `server/api/admin/customers/[id].get.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const customer = await db
    .prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first()
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'العميل غير موجود' })

  const { results: invoices } = await db
    .prepare(`
      SELECT id, number, status, issue_date, due_date, slug
      FROM invoices WHERE customer_id = ?
      ORDER BY created_at DESC
    `)
    .bind(id)
    .all()

  return { customer, invoices }
})
```

- [ ] **Step 3.4: Update endpoint `server/api/admin/customers/[id].put.ts`**

```ts
import { useDB } from '~/server/utils/db'

interface UpdateBody {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<UpdateBody>(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم مطلوب' })
  }

  const db = useDB(event)
  const result = await db
    .prepare(`
      UPDATE customers
      SET name = ?, email = ?, phone = ?, company = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      body.name.trim(),
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.company?.trim() || null,
      body.notes?.trim() || null,
      Date.now(),
      id,
    )
    .run()

  if (!result.meta?.changes) {
    throw createError({ statusCode: 404, statusMessage: 'العميل غير موجود' })
  }
  return { ok: true }
})
```

- [ ] **Step 3.5: Delete endpoint `server/api/admin/customers/[id].delete.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const existing = await db
    .prepare('SELECT COUNT(*) AS n FROM invoices WHERE customer_id = ?')
    .bind(id)
    .first<{ n: number }>()
  if ((existing?.n ?? 0) > 0) {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن حذف عميل لديه فواتير' })
  }

  await db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run()
  return { ok: true }
})
```

- [ ] **Step 3.6: Verify in dev**

Start dev:
```sh
yarn dev
```

Log in at `http://localhost:3002/admin/login`, then exercise via the browser console (the `__session` cookie is sent automatically):

```js
// in browser devtools on localhost:3002
await fetch('/api/admin/customers', {
  method: 'POST', headers: {'content-type':'application/json'},
  body: JSON.stringify({ name: 'شركة بوصلة', email: 'finance@busala.sa' })
}).then(r => r.json())
// → { ok: true, id: 1 }

await fetch('/api/admin/customers').then(r => r.json())
// → { customers: [{ id: 1, name: 'شركة بوصلة', invoice_count: 0, ... }] }

await fetch('/api/admin/customers/1', {
  method: 'PUT', headers: {'content-type':'application/json'},
  body: JSON.stringify({ name: 'شركة بوصلة', phone: '+966500000000' })
}).then(r => r.json())
// → { ok: true }
```

- [ ] **Step 3.7: Commit (ask user first)**

```sh
git add server/api/admin/customers/
git commit -m "feat(invoices): customers admin API"
```

---

## Task 4: Settings admin API (2 endpoints)

**Files:**
- Create `server/api/admin/settings.get.ts`
- Create `server/api/admin/settings.put.ts`

- [ ] **Step 4.1: Read endpoint `server/api/admin/settings.get.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const settings = await db
    .prepare('SELECT * FROM settings WHERE id = 1')
    .first()
  if (!settings) {
    throw createError({ statusCode: 500, statusMessage: 'Settings row missing — re-run migration 0002_invoices.sql' })
  }
  return { settings }
})
```

- [ ] **Step 4.2: Update endpoint `server/api/admin/settings.put.ts`**

```ts
import { useDB } from '~/server/utils/db'

interface UpdateBody {
  business_name: string
  logo_url?: string
  email?: string
  phone?: string
  address?: string
  bank_name?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_iban?: string
  default_due_days?: number
  default_notes?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateBody>(event)
  if (!body?.business_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'اسم النشاط مطلوب' })
  }
  const dueDays = Number(body.default_due_days)
  if (!Number.isFinite(dueDays) || dueDays < 0) {
    throw createError({ statusCode: 400, statusMessage: 'مدة الاستحقاق غير صحيحة' })
  }

  const db = useDB(event)
  await db
    .prepare(`
      UPDATE settings SET
        business_name = ?, logo_url = ?, email = ?, phone = ?, address = ?,
        bank_name = ?, bank_account_name = ?, bank_account_number = ?, bank_iban = ?,
        default_due_days = ?, default_notes = ?, updated_at = ?
      WHERE id = 1
    `)
    .bind(
      body.business_name.trim(),
      body.logo_url?.trim() || null,
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.address?.trim() || null,
      body.bank_name?.trim() || null,
      body.bank_account_name?.trim() || null,
      body.bank_account_number?.trim() || null,
      body.bank_iban?.trim() || null,
      dueDays,
      body.default_notes?.trim() || null,
      Date.now(),
    )
    .run()

  return { ok: true }
})
```

- [ ] **Step 4.3: Verify in dev**

In the logged-in browser console:

```js
await fetch('/api/admin/settings').then(r => r.json())
// → { settings: { id: 1, business_name: 'سفيان فارع', logo_url: '/logo.svg', default_due_days: 14, ... } }

await fetch('/api/admin/settings', {
  method: 'PUT', headers: {'content-type':'application/json'},
  body: JSON.stringify({
    business_name: 'سفيان فارع',
    bank_name: 'الراجحي',
    bank_account_name: 'سفيان فارع',
    bank_iban: 'SA0380000000608010167519',
    default_due_days: 14,
    default_notes: 'شكراً لتعاملك. يُرجى السداد خلال 14 يوماً.',
  })
}).then(r => r.json())
// → { ok: true }
```

- [ ] **Step 4.4: Commit (ask user first)**

```sh
git add server/api/admin/settings.get.ts server/api/admin/settings.put.ts
git commit -m "feat(invoices): settings admin API"
```

---

## Task 5: Invoice admin API — CRUD (5 endpoints)

**Files:**
- Create `server/api/admin/invoices/index.get.ts`
- Create `server/api/admin/invoices/index.post.ts`
- Create `server/api/admin/invoices/[id].get.ts`
- Create `server/api/admin/invoices/[id].put.ts`
- Create `server/api/admin/invoices/[id].delete.ts`

- [ ] **Step 5.1: List endpoint `server/api/admin/invoices/index.get.ts`**

Computes the total client-side on the list view (subtotal + adjustment from a SUM join). Filterable by status via `?status=draft|sent|paid`.

```ts
import { useDB } from '~/server/utils/db'

interface ListRow {
  id: number
  slug: string
  number: string
  status: string
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_name: string
  customer_id: number
  subtotal: number
}

export default defineEventHandler(async (event) => {
  const status = getQuery(event).status as string | undefined
  const db = useDB(event)

  const where = status && ['draft', 'sent', 'paid'].includes(status)
    ? 'WHERE i.status = ?'
    : ''

  const stmt = db.prepare(`
    SELECT i.id, i.slug, i.number, i.status, i.issue_date, i.due_date,
           i.currency, i.adjustment, i.customer_id,
           c.name AS customer_name,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) AS subtotal
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    ${where}
    ORDER BY i.created_at DESC
  `)
  const bound = where ? stmt.bind(status) : stmt
  const { results } = await bound.all<ListRow>()

  return { invoices: results }
})
```

- [ ] **Step 5.2: Create endpoint `server/api/admin/invoices/index.post.ts`**

Assigns slug + atomic invoice number in one INSERT.

```ts
import { useDB } from '~/server/utils/db'
import { randomSlug } from '~/server/utils/slug'

interface ItemInput {
  description: string
  amount: number
}

interface CreateBody {
  customer_id: number
  issue_date: string         // 'YYYY-MM-DD'
  due_date: string           // 'YYYY-MM-DD'
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
  status?: 'draft' | 'sent'  // defaults to 'draft'
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  if (!Number.isFinite(body.customer_id)) {
    throw createError({ statusCode: 400, statusMessage: 'العميل مطلوب' })
  }
  if (!isISODate(body.issue_date) || !isISODate(body.due_date)) {
    throw createError({ statusCode: 400, statusMessage: 'التواريخ غير صحيحة' })
  }
  if (body.due_date < body.issue_date) {
    throw createError({ statusCode: 400, statusMessage: 'تاريخ الاستحقاق قبل تاريخ الإصدار' })
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'يجب إضافة بند واحد على الأقل' })
  }
  for (const it of body.items) {
    if (!it.description?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'وصف البند مطلوب' })
    }
    if (!Number.isFinite(it.amount) || it.amount < 0) {
      throw createError({ statusCode: 400, statusMessage: 'مبلغ البند غير صحيح' })
    }
  }
  const status = body.status === 'sent' ? 'sent' : 'draft'
  const adjustment = Number.isFinite(body.adjustment) ? Math.trunc(body.adjustment as number) : 0
  const now = Date.now()

  const db = useDB(event)

  // Verify the customer exists.
  const cust = await db.prepare('SELECT id FROM customers WHERE id = ?').bind(body.customer_id).first()
  if (!cust) throw createError({ statusCode: 400, statusMessage: 'العميل غير موجود' })

  // Atomic insert with computed sequential number. Up to 2 retries on rare
  // slug/number race (D1 has no transactions across .run() calls).
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug()
    try {
      const result = await db
        .prepare(`
          INSERT INTO invoices
            (slug, number, customer_id, status, issue_date, due_date, currency,
             adjustment, adjustment_label, notes, sent_at, created_at, updated_at)
          VALUES (
            ?,
            'INV-' || strftime('%Y','now') || '-' ||
              printf('%04d',
                COALESCE(
                  (SELECT MAX(CAST(substr(number, 10) AS INTEGER))
                     FROM invoices
                    WHERE number LIKE 'INV-' || strftime('%Y','now') || '-%'),
                  0) + 1),
            ?, ?, ?, ?, 'SAR', ?, ?, ?, ?, ?, ?
          )
        `)
        .bind(
          slug,
          body.customer_id,
          status,
          body.issue_date,
          body.due_date,
          adjustment,
          body.adjustment_label?.trim() || null,
          body.notes?.trim() || null,
          status === 'sent' ? now : null,
          now,
          now,
        )
        .run()

      const invoiceId = result.meta?.last_row_id
      if (!invoiceId) throw new Error('No last_row_id returned')

      // Insert items.
      for (let i = 0; i < body.items.length; i++) {
        const it = body.items[i]
        await db
          .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
          .bind(invoiceId, i, it.description.trim(), Math.trunc(it.amount))
          .run()
      }

      // Read back the assigned number + slug.
      const created = await db
        .prepare('SELECT id, slug, number FROM invoices WHERE id = ?')
        .bind(invoiceId)
        .first<{ id: number; slug: string; number: string }>()

      return { ok: true, invoice: created }
    } catch (e: any) {
      lastErr = e
      // UNIQUE failures on slug or number → retry. Anything else → bail.
      const msg = String(e?.message ?? e)
      if (!/UNIQUE/i.test(msg)) throw e
    }
  }
  throw createError({ statusCode: 500, statusMessage: `Failed to create invoice: ${String(lastErr)}` })
})
```

- [ ] **Step 5.3: Read endpoint `server/api/admin/invoices/[id].get.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const invoice = await db
    .prepare('SELECT * FROM invoices WHERE id = ?')
    .bind(id)
    .first()
  if (!invoice) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  const customer = await db
    .prepare('SELECT * FROM customers WHERE id = ?')
    .bind((invoice as any).customer_id)
    .first()

  const { results: items } = await db
    .prepare('SELECT id, position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all()

  return { invoice, customer, items }
})
```

- [ ] **Step 5.4: Update endpoint `server/api/admin/invoices/[id].put.ts`**

Replaces fields + the full items list. Does NOT change number/slug/status (those have dedicated endpoints).

```ts
import { useDB } from '~/server/utils/db'

interface ItemInput {
  description: string
  amount: number
}

interface UpdateBody {
  customer_id: number
  issue_date: string
  due_date: string
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<UpdateBody>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })
  if (!Number.isFinite(body.customer_id)) throw createError({ statusCode: 400, statusMessage: 'العميل مطلوب' })
  if (!isISODate(body.issue_date) || !isISODate(body.due_date)) {
    throw createError({ statusCode: 400, statusMessage: 'التواريخ غير صحيحة' })
  }
  if (body.due_date < body.issue_date) {
    throw createError({ statusCode: 400, statusMessage: 'تاريخ الاستحقاق قبل تاريخ الإصدار' })
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'يجب إضافة بند واحد على الأقل' })
  }
  for (const it of body.items) {
    if (!it.description?.trim()) throw createError({ statusCode: 400, statusMessage: 'وصف البند مطلوب' })
    if (!Number.isFinite(it.amount) || it.amount < 0) throw createError({ statusCode: 400, statusMessage: 'مبلغ البند غير صحيح' })
  }

  const db = useDB(event)

  const cust = await db.prepare('SELECT id FROM customers WHERE id = ?').bind(body.customer_id).first()
  if (!cust) throw createError({ statusCode: 400, statusMessage: 'العميل غير موجود' })

  const adjustment = Number.isFinite(body.adjustment) ? Math.trunc(body.adjustment as number) : 0

  const result = await db
    .prepare(`
      UPDATE invoices SET
        customer_id = ?, issue_date = ?, due_date = ?,
        adjustment = ?, adjustment_label = ?, notes = ?,
        updated_at = ?
      WHERE id = ?
    `)
    .bind(
      body.customer_id,
      body.issue_date,
      body.due_date,
      adjustment,
      body.adjustment_label?.trim() || null,
      body.notes?.trim() || null,
      Date.now(),
      id,
    )
    .run()

  if (!result.meta?.changes) {
    throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  }

  // Replace items: delete + reinsert (simplest, correct, low row counts).
  await db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').bind(id).run()
  for (let i = 0; i < body.items.length; i++) {
    const it = body.items[i]
    await db
      .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
      .bind(id, i, it.description.trim(), Math.trunc(it.amount))
      .run()
  }

  return { ok: true }
})
```

- [ ] **Step 5.5: Delete endpoint `server/api/admin/invoices/[id].delete.ts`**

Only `draft` invoices may be deleted; sent/paid kept forever.

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status !== 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن حذف فاتورة مرسلة أو مدفوعة' })
  }

  await db.prepare('DELETE FROM invoices WHERE id = ?').bind(id).run()
  // invoice_items rows cascade via ON DELETE CASCADE.
  return { ok: true }
})
```

- [ ] **Step 5.6: Verify in dev**

In the logged-in browser console:

```js
// Create invoice
await fetch('/api/admin/invoices', {
  method: 'POST', headers: {'content-type':'application/json'},
  body: JSON.stringify({
    customer_id: 1,
    issue_date: '2026-05-17',
    due_date: '2026-05-31',
    items: [
      { description: 'استضافة — مايو 2026', amount: 20000 },
      { description: 'قاعدة بيانات — مايو 2026', amount: 15000 },
    ],
    adjustment: -5000,
    adjustment_label: 'خصم العميل المميز',
    notes: 'شكراً لتعاملك.',
  })
}).then(r => r.json())
// → { ok: true, invoice: { id: 1, slug: '...', number: 'INV-2026-0001' } }

await fetch('/api/admin/invoices').then(r => r.json())
// → { invoices: [{ id:1, number:'INV-2026-0001', customer_name:'شركة بوصلة', subtotal:35000, adjustment:-5000, ... }] }

await fetch('/api/admin/invoices/1').then(r => r.json())
// → { invoice, customer, items: [...] }
```

Verify atomic numbering: create a second invoice and confirm `number = 'INV-2026-0002'`.

- [ ] **Step 5.7: Commit (ask user first)**

```sh
git add server/api/admin/invoices/index.get.ts server/api/admin/invoices/index.post.ts \
        server/api/admin/invoices/\[id\].get.ts server/api/admin/invoices/\[id\].put.ts \
        server/api/admin/invoices/\[id\].delete.ts
git commit -m "feat(invoices): invoice CRUD admin API"
```

---

## Task 6: Invoice admin API — actions (3 endpoints)

**Files:**
- Create `server/api/admin/invoices/[id]/duplicate.post.ts`
- Create `server/api/admin/invoices/[id]/mark-sent.post.ts`
- Create `server/api/admin/invoices/[id]/mark-paid.post.ts`

- [ ] **Step 6.1: Duplicate endpoint `server/api/admin/invoices/[id]/duplicate.post.ts`**

Clones items, resets status=draft, issue_date=today, due_date=today + `settings.default_due_days`, assigns new number + slug.

```ts
import { useDB } from '~/server/utils/db'
import { randomSlug } from '~/server/utils/slug'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const src = await db.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first<any>()
  if (!src) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  const settings = await db
    .prepare('SELECT default_due_days FROM settings WHERE id = 1')
    .first<{ default_due_days: number }>()
  const dueDays = settings?.default_due_days ?? 14

  const issue = todayISO()
  const due = addDaysISO(issue, dueDays)
  const now = Date.now()

  let newId: number | undefined
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug()
    try {
      const result = await db
        .prepare(`
          INSERT INTO invoices
            (slug, number, customer_id, status, issue_date, due_date, currency,
             adjustment, adjustment_label, notes, created_at, updated_at)
          VALUES (
            ?,
            'INV-' || strftime('%Y','now') || '-' ||
              printf('%04d',
                COALESCE(
                  (SELECT MAX(CAST(substr(number, 10) AS INTEGER))
                     FROM invoices
                    WHERE number LIKE 'INV-' || strftime('%Y','now') || '-%'),
                  0) + 1),
            ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?
          )
        `)
        .bind(
          slug,
          src.customer_id,
          issue,
          due,
          src.currency || 'SAR',
          src.adjustment,
          src.adjustment_label,
          src.notes,
          now,
          now,
        )
        .run()
      newId = result.meta?.last_row_id
      if (!newId) throw new Error('No last_row_id')
      break
    } catch (e: any) {
      lastErr = e
      if (!/UNIQUE/i.test(String(e?.message ?? e))) throw e
    }
  }
  if (!newId) throw createError({ statusCode: 500, statusMessage: `Failed to duplicate: ${String(lastErr)}` })

  // Clone items.
  const { results: items } = await db
    .prepare('SELECT position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all<{ position: number; description: string; amount: number }>()
  for (const it of items) {
    await db
      .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
      .bind(newId, it.position, it.description, it.amount)
      .run()
  }

  return { ok: true, id: newId }
})
```

- [ ] **Step 6.2: Mark-sent endpoint `server/api/admin/invoices/[id]/mark-sent.post.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status === 'paid') {
    throw createError({ statusCode: 409, statusMessage: 'الفاتورة مدفوعة بالفعل' })
  }

  const now = Date.now()
  await db
    .prepare(`UPDATE invoices SET status = 'sent', sent_at = COALESCE(sent_at, ?), updated_at = ? WHERE id = ?`)
    .bind(now, now, id)
    .run()
  return { ok: true }
})
```

- [ ] **Step 6.3: Mark-paid endpoint `server/api/admin/invoices/[id]/mark-paid.post.ts`**

```ts
import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status === 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن وضع مسودة كمدفوعة. اعرضها أولاً.' })
  }

  const now = Date.now()
  await db
    .prepare(`UPDATE invoices SET status = 'paid', paid_at = COALESCE(paid_at, ?), updated_at = ? WHERE id = ?`)
    .bind(now, now, id)
    .run()
  return { ok: true }
})
```

- [ ] **Step 6.4: Verify in dev**

```js
await fetch('/api/admin/invoices/1/mark-sent', { method: 'POST' }).then(r => r.json())
// → { ok: true }

await fetch('/api/admin/invoices/1/duplicate', { method: 'POST' }).then(r => r.json())
// → { ok: true, id: 3 }   (cloned to a new draft with new number INV-2026-0003)

await fetch('/api/admin/invoices/1/mark-paid', { method: 'POST' }).then(r => r.json())
// → { ok: true }
```

- [ ] **Step 6.5: Commit (ask user first)**

```sh
git add server/api/admin/invoices/\[id\]/
git commit -m "feat(invoices): duplicate + mark-sent + mark-paid actions"
```

---

## Task 7: Public viewer API `server/api/i/[slug].get.ts`

Returns the invoice + customer + items + settings for the public viewer. Draft invoices return 404 unless the request carries a valid admin `__session` cookie and `?preview=1`.

**Files:** Create `server/api/i/[slug].get.ts`

- [ ] **Step 7.1: Write the endpoint**

```ts
import { useDB } from '~/server/utils/db'
import { getAdminSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const preview = String(getQuery(event).preview ?? '') === '1'

  const db = useDB(event)
  const invoice = await db
    .prepare('SELECT * FROM invoices WHERE slug = ?')
    .bind(slug)
    .first<any>()
  if (!invoice) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  if (invoice.status === 'draft') {
    if (!preview) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
    const session = await getAdminSession(event)
    if (!session) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  }

  const customer = await db
    .prepare('SELECT id, name, email, phone, company FROM customers WHERE id = ?')
    .bind(invoice.customer_id)
    .first()

  const { results: items } = await db
    .prepare('SELECT id, position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(invoice.id)
    .all()

  const settings = await db
    .prepare(`
      SELECT business_name, logo_url, email, phone, address,
             bank_name, bank_account_name, bank_account_number, bank_iban
      FROM settings WHERE id = 1
    `)
    .first()

  // Don't expose customer.notes or settings.default_notes/default_due_days.
  return { invoice, customer, items, settings }
})
```

- [ ] **Step 7.2: Verify in dev (incognito)**

Fetch slug from `await fetch('/api/admin/invoices/1').then(r=>r.json())` (you'll get `invoice.slug`).

In incognito (no admin cookie):
```sh
curl -s http://localhost:3002/api/i/<paste-slug-here> | jq
```
Expected: full invoice + customer + items + settings JSON (since invoice #1 was marked-sent then paid in task 6).

Test draft 404: create another draft invoice via the API, then in incognito:
```sh
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/api/i/<draft-slug>
```
Expected: `404`.

Test admin preview override (in browser with valid session):
```js
await fetch('/api/i/<draft-slug>?preview=1').then(r => r.status)
// → 200
```

- [ ] **Step 7.3: Commit (ask user first)**

```sh
git add server/api/i/\[slug\].get.ts
git commit -m "feat(invoices): public viewer API"
```

---

## Task 8: Customer admin pages (3 pages)

**Files:**
- Create `pages/admin/customers/index.vue`
- Create `pages/admin/customers/new.vue`
- Create `pages/admin/customers/[id].vue`

All admin pages live under the default layout's admin shell (the existing `pages/admin/index.vue` is plain — no AdminLayout component; each page does its own session check via `useFetch('/api/admin/me')`).

- [ ] **Step 8.1: List page `pages/admin/customers/index.vue`**

```vue
<script setup lang="ts">
import { formatDate } from '@vueuse/core'

definePageMeta({ middleware: 'admin' })

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  invoice_count: number
  last_invoice_at: number | null
}

const { data } = await useFetch<{ customers: Customer[] }>('/api/admin/customers')

function fmtDate(ms: number | null): string {
  if (!ms) return '—'
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(ms))
}
</script>

<template>
  <div class="mx-auto max-w-5xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">العملاء</h1>
      <NuxtLink to="/admin/customers/new" class="px-4 py-2 bg-black text-white rounded-lg text-sm">
        + عميل جديد
      </NuxtLink>
    </div>

    <div v-if="!data?.customers?.length" class="text-center py-16 text-gray-500">
      لا يوجد عملاء بعد.
    </div>

    <div v-else class="bg-white border border-black/10 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-cream text-right">
          <tr>
            <th class="p-3 font-medium">الاسم</th>
            <th class="p-3 font-medium">البريد</th>
            <th class="p-3 font-medium">الهاتف</th>
            <th class="p-3 font-medium">الفواتير</th>
            <th class="p-3 font-medium">آخر فاتورة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in data.customers" :key="c.id" class="border-t border-black/5 hover:bg-cream/50 cursor-pointer">
            <td class="p-3">
              <NuxtLink :to="`/admin/customers/${c.id}`" class="font-medium">{{ c.name }}</NuxtLink>
              <div v-if="c.company" class="text-xs text-gray-500">{{ c.company }}</div>
            </td>
            <td class="p-3 text-gray-600">{{ c.email || '—' }}</td>
            <td class="p-3 text-gray-600">{{ c.phone || '—' }}</td>
            <td class="p-3">{{ c.invoice_count }}</td>
            <td class="p-3 text-gray-600">{{ fmtDate(c.last_invoice_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

- [ ] **Step 8.2: Create page `pages/admin/customers/new.vue`**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const form = reactive({ name: '', email: '', phone: '', company: '', notes: '' })
const saving = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/customers', {
      method: 'POST',
      body: form,
    })
    await navigateTo(`/admin/customers/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <h1 class="text-2xl font-bold mb-6">عميل جديد</h1>

    <form @submit.prevent="save" class="space-y-4 bg-white border border-black/10 rounded-2xl p-6">
      <div>
        <label class="block text-sm font-medium mb-1">الاسم *</label>
        <input v-model="form.name" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">الجهة (اختياري)</label>
        <input v-model="form.company" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">البريد</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الهاتف</label>
          <input v-model="form.phone" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">ملاحظات خاصة (لا تُعرض على العميل)</label>
        <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg"></textarea>
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving" class="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-50">
          {{ saving ? 'جارٍ الحفظ…' : 'حفظ' }}
        </button>
        <NuxtLink to="/admin/customers" class="px-5 py-2 border border-black/10 rounded-lg">إلغاء</NuxtLink>
      </div>
    </form>
  </div>
</template>
```

- [ ] **Step 8.3: Edit page `pages/admin/customers/[id].vue`**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const id = route.params.id

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
}
interface InvoiceRow {
  id: number
  number: string
  status: string
  issue_date: string
  due_date: string
  slug: string
}

const { data, refresh } = await useFetch<{ customer: Customer; invoices: InvoiceRow[] }>(
  () => `/api/admin/customers/${id}`,
)

const form = reactive<Customer>({
  id: 0, name: '', email: '', phone: '', company: '', notes: '',
})

watchEffect(() => {
  if (data.value?.customer) Object.assign(form, data.value.customer)
})

const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/customers/${id}`, { method: 'PUT', body: form })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('هل تريد حذف هذا العميل؟')) return
  deleting.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
    await navigateTo('/admin/customers')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <NuxtLink to="/admin/customers" class="text-sm text-gray-500 mb-3 inline-block">← العملاء</NuxtLink>
    <h1 class="text-2xl font-bold mb-6">{{ form.name }}</h1>

    <form @submit.prevent="save" class="space-y-4 bg-white border border-black/10 rounded-2xl p-6 mb-6">
      <div>
        <label class="block text-sm font-medium mb-1">الاسم *</label>
        <input v-model="form.name" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">الجهة</label>
        <input v-model="form.company" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">البريد</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الهاتف</label>
          <input v-model="form.phone" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">ملاحظات</label>
        <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg"></textarea>
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving" class="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-50">
          {{ saving ? 'جارٍ الحفظ…' : 'حفظ' }}
        </button>
        <button
          type="button"
          :disabled="deleting || (data?.invoices?.length ?? 0) > 0"
          :title="(data?.invoices?.length ?? 0) > 0 ? 'لا يمكن حذف عميل لديه فواتير' : ''"
          @click="remove"
          class="px-5 py-2 border border-red-200 text-red-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >حذف</button>
      </div>
    </form>

    <section v-if="data?.invoices?.length">
      <h2 class="text-lg font-semibold mb-3">فواتير هذا العميل</h2>
      <div class="bg-white border border-black/10 rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="inv in data.invoices" :key="inv.id" class="border-t border-black/5 first:border-0">
              <td class="p-3">
                <NuxtLink :to="`/admin/invoices/${inv.id}`" class="font-medium">{{ inv.number }}</NuxtLink>
              </td>
              <td class="p-3 text-gray-600">{{ inv.status }}</td>
              <td class="p-3 text-gray-600">{{ inv.issue_date }} → {{ inv.due_date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 8.4: Confirm `admin` middleware exists**

Check `middleware/` for an `admin.ts` that redirects unauthenticated users to `/admin/login`. The proposals admin pages use it. If absent, look at `pages/admin/index.vue` to see how it gates access and copy that pattern (likely an `onMounted` fetch of `/api/admin/me` with redirect on 401). Use whatever exists — do NOT invent a new pattern.

If you need to create one, place at `middleware/admin.ts`:
```ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return
  try {
    await $fetch('/api/admin/me')
  } catch {
    return navigateTo('/admin/login')
  }
})
```

- [ ] **Step 8.5: Verify in dev**

Visit `http://localhost:3002/admin/customers`. Confirm:
- Empty list shows "لا يوجد عملاء بعد" (or your earlier seeded customer if the DB persists)
- "+ عميل جديد" → create form → save → redirects to edit page
- Edit page → change name → save → name updates
- Customer with invoices → Delete button disabled with tooltip

- [ ] **Step 8.6: Commit (ask user first)**

```sh
git add pages/admin/customers/ middleware/admin.ts 2>/dev/null || git add pages/admin/customers/
git commit -m "feat(invoices): customer admin pages"
```

---

## Task 9: Settings admin page

**Files:** Create `pages/admin/settings.vue`

- [ ] **Step 9.1: Write the page**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

interface Settings {
  business_name: string
  logo_url: string | null
  email: string | null
  phone: string | null
  address: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_iban: string | null
  default_due_days: number
  default_notes: string | null
}

const { data, refresh } = await useFetch<{ settings: Settings }>('/api/admin/settings')

const form = reactive<Settings>({
  business_name: '', logo_url: '', email: '', phone: '', address: '',
  bank_name: '', bank_account_name: '', bank_account_number: '', bank_iban: '',
  default_due_days: 14, default_notes: '',
})

watchEffect(() => {
  if (data.value?.settings) Object.assign(form, data.value.settings)
})

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  saved.value = false
  try {
    await $fetch('/api/admin/settings', { method: 'PUT', body: form })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <h1 class="text-2xl font-bold mb-6">إعدادات الفواتير</h1>

    <form @submit.prevent="save" class="space-y-6 bg-white border border-black/10 rounded-2xl p-6">

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">معلومات النشاط</h2>
        <div>
          <label class="block text-sm font-medium mb-1">اسم النشاط *</label>
          <input v-model="form.business_name" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">رابط الشعار</label>
          <input v-model="form.logo_url" placeholder="/logo.svg" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">البريد</label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">الهاتف</label>
            <input v-model="form.phone" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">العنوان</label>
          <input v-model="form.address" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">معلومات الدفع</h2>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">البنك</label>
            <input v-model="form.bank_name" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">اسم الحساب</label>
            <input v-model="form.bank_account_name" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">رقم الحساب</label>
          <input v-model="form.bank_account_number" class="w-full px-3 py-2 border border-black/10 rounded-lg font-mono" dir="ltr" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الآيبان</label>
          <input v-model="form.bank_iban" placeholder="SA..." class="w-full px-3 py-2 border border-black/10 rounded-lg font-mono" dir="ltr" />
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">افتراضات الفاتورة</h2>
        <div>
          <label class="block text-sm font-medium mb-1">مدة الاستحقاق (أيام)</label>
          <input v-model.number="form.default_due_days" type="number" min="0" class="w-32 px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات افتراضية تظهر على الفاتورة</label>
          <textarea v-model="form.default_notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg"></textarea>
        </div>
      </section>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" :disabled="saving" class="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-50">
          {{ saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات' }}
        </button>
        <span v-if="saved" class="text-green-700 text-sm">تم الحفظ</span>
      </div>
    </form>
  </div>
</template>
```

- [ ] **Step 9.2: Verify in dev**

Visit `http://localhost:3002/admin/settings`. Fill in bank details, save, refresh — values persist.

- [ ] **Step 9.3: Commit (ask user first)**

```sh
git add pages/admin/settings.vue
git commit -m "feat(invoices): settings admin page"
```

---

## Task 10: Shared admin components

**Files:**
- Create `components/admin/CustomerPicker.vue`
- Create `components/admin/InvoiceForm.vue`

- [ ] **Step 10.1: `components/admin/CustomerPicker.vue` — searchable dropdown + inline-create modal**

```vue
<script setup lang="ts">
interface Customer { id: number; name: string; company: string | null; email: string | null }

const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>()

const { data, refresh } = await useFetch<{ customers: Customer[] }>('/api/admin/customers')

const query = ref('')
const open = ref(false)
const showNew = ref(false)
const newForm = reactive({ name: '', email: '', phone: '', company: '' })
const newError = ref<string | null>(null)
const newSaving = ref(false)

const filtered = computed(() => {
  const list = data.value?.customers ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.company ?? '').toLowerCase().includes(q) ||
    (c.email ?? '').toLowerCase().includes(q),
  )
})

const selected = computed(() => data.value?.customers.find(c => c.id === props.modelValue))

function pick(c: Customer) {
  emit('update:modelValue', c.id)
  open.value = false
  query.value = ''
}

async function createNew() {
  if (!newForm.name.trim()) { newError.value = 'الاسم مطلوب'; return }
  newSaving.value = true
  newError.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/customers', {
      method: 'POST', body: newForm,
    })
    await refresh()
    emit('update:modelValue', res.id)
    showNew.value = false
    Object.assign(newForm, { name: '', email: '', phone: '', company: '' })
  } catch (e: any) {
    newError.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    newSaving.value = false
  }
}
</script>

<template>
  <div class="relative">
    <div class="flex gap-2">
      <button
        type="button"
        @click="open = !open"
        class="flex-1 text-right px-3 py-2 border border-black/10 rounded-lg bg-white"
      >
        <span v-if="selected">{{ selected.name }}<span v-if="selected.company" class="text-gray-500"> — {{ selected.company }}</span></span>
        <span v-else class="text-gray-400">اختر عميلاً…</span>
      </button>
      <button type="button" @click="showNew = true" class="px-3 py-2 border border-black/10 rounded-lg">+ جديد</button>
    </div>

    <div v-if="open" class="absolute top-full right-0 left-0 mt-1 bg-white border border-black/10 rounded-lg shadow-lg z-10 max-h-80 overflow-auto">
      <input v-model="query" placeholder="ابحث…" class="w-full px-3 py-2 border-b border-black/10 focus:outline-none" />
      <button
        v-for="c in filtered"
        :key="c.id"
        type="button"
        @click="pick(c)"
        class="w-full text-right px-3 py-2 hover:bg-cream"
      >
        {{ c.name }}<span v-if="c.company" class="text-gray-500"> — {{ c.company }}</span>
      </button>
      <div v-if="!filtered.length" class="px-3 py-4 text-center text-sm text-gray-500">
        لا توجد نتائج
      </div>
    </div>

    <!-- Inline-create modal -->
    <div v-if="showNew" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="showNew = false">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">عميل جديد</h3>
        <div class="space-y-3">
          <input v-model="newForm.name" placeholder="الاسم *" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.company" placeholder="الجهة" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.email" placeholder="البريد" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.phone" placeholder="الهاتف" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
        </div>
        <div v-if="newError" class="text-red-600 text-sm mt-3">{{ newError }}</div>
        <div class="flex gap-3 mt-5">
          <button type="button" @click="createNew" :disabled="newSaving" class="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">
            {{ newSaving ? 'جارٍ الحفظ…' : 'حفظ' }}
          </button>
          <button type="button" @click="showNew = false" class="px-4 py-2 border border-black/10 rounded-lg">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 10.2: `components/admin/InvoiceForm.vue`**

```vue
<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

interface Item { description: string; amount: number }
interface FormShape {
  customer_id: number | null
  issue_date: string
  due_date: string
  items: Item[]
  adjustment: number
  adjustment_label: string
  notes: string
}

const props = defineProps<{
  initial?: Partial<FormShape>
  defaultDueDays?: number
  defaultNotes?: string
  submitLabels: { draft: string; sent: string }
  showSentButton?: boolean
}>()
const emit = defineEmits<{
  (e: 'submit', body: { status: 'draft' | 'sent'; data: FormShape }): void
}>()

const { formatSAR } = useMoney()

function todayISO(): string { return new Date().toISOString().slice(0, 10) }
function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const issueInit = props.initial?.issue_date ?? todayISO()
const dueInit = props.initial?.due_date ?? addDaysISO(issueInit, props.defaultDueDays ?? 14)

const form = reactive<FormShape>({
  customer_id: props.initial?.customer_id ?? null,
  issue_date: issueInit,
  due_date: dueInit,
  items: props.initial?.items?.length
    ? props.initial.items.map(i => ({ description: i.description, amount: i.amount }))
    : [{ description: '', amount: 0 }],
  adjustment: props.initial?.adjustment ?? 0,
  adjustment_label: props.initial?.adjustment_label ?? '',
  notes: props.initial?.notes ?? props.defaultNotes ?? '',
})

const adjustmentOpen = ref((form.adjustment ?? 0) !== 0 || !!form.adjustment_label)
const saving = ref(false)
const error = ref<string | null>(null)

// Amounts edited as decimal SAR, stored as halalas.
const itemViews = reactive(form.items.map(i => ({ description: i.description, sar: i.amount / 100 })))
const adjustmentSAR = ref(form.adjustment / 100)

function addItem() { itemViews.push({ description: '', sar: 0 }) }
function removeItem(i: number) { itemViews.splice(i, 1) }

const subtotal = computed(() => itemViews.reduce((s, i) => s + Math.round((i.sar || 0) * 100), 0))
const adjustmentHalalas = computed(() => Math.round((adjustmentSAR.value || 0) * 100))
const total = computed(() => subtotal.value + adjustmentHalalas.value)

function buildBody(): FormShape {
  return {
    customer_id: form.customer_id,
    issue_date: form.issue_date,
    due_date: form.due_date,
    items: itemViews.map(i => ({ description: i.description.trim(), amount: Math.round((i.sar || 0) * 100) })),
    adjustment: adjustmentOpen.value ? adjustmentHalalas.value : 0,
    adjustment_label: adjustmentOpen.value ? form.adjustment_label.trim() : '',
    notes: form.notes,
  }
}

async function submit(status: 'draft' | 'sent') {
  if (!form.customer_id) { error.value = 'اختر عميلاً'; return }
  if (itemViews.length === 0) { error.value = 'أضف بنداً واحداً على الأقل'; return }
  if (form.due_date < form.issue_date) { error.value = 'تاريخ الاستحقاق قبل تاريخ الإصدار'; return }
  saving.value = true
  error.value = null
  try {
    emit('submit', { status, data: buildBody() })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit('draft')" class="space-y-6">
    <section class="bg-white border border-black/10 rounded-2xl p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">العميل *</label>
        <CustomerPicker v-model="form.customer_id" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الإصدار</label>
          <input v-model="form.issue_date" type="date" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
          <input v-model="form.due_date" type="date" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
      </div>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6 space-y-3">
      <h2 class="text-sm font-semibold">البنود</h2>
      <div v-for="(it, idx) in itemViews" :key="idx" class="flex gap-3">
        <input v-model="it.description" placeholder="وصف البند" class="flex-1 px-3 py-2 border border-black/10 rounded-lg" />
        <input v-model.number="it.sar" type="number" step="0.01" min="0" placeholder="0.00" class="w-32 px-3 py-2 border border-black/10 rounded-lg text-left" dir="ltr" />
        <button type="button" @click="removeItem(idx)" class="px-3 py-2 border border-black/10 rounded-lg text-red-600">×</button>
      </div>
      <button type="button" @click="addItem" class="text-sm text-forest underline">+ إضافة بند</button>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6">
      <button v-if="!adjustmentOpen" type="button" @click="adjustmentOpen = true" class="text-sm text-forest underline">
        + إضافة خصم أو رسوم
      </button>
      <div v-else class="flex gap-3 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">وصف التعديل</label>
          <input v-model="form.adjustment_label" placeholder="مثلاً: خصم العميل المميز" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div class="w-40">
          <label class="block text-sm font-medium mb-1">المبلغ (موجب أو سالب)</label>
          <input v-model.number="adjustmentSAR" type="number" step="0.01" class="w-full px-3 py-2 border border-black/10 rounded-lg text-left" dir="ltr" />
        </div>
        <button type="button" @click="adjustmentOpen = false; adjustmentSAR = 0; form.adjustment_label = ''" class="px-3 py-2 border border-black/10 rounded-lg">إزالة</button>
      </div>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6">
      <label class="block text-sm font-medium mb-1">ملاحظات تظهر على الفاتورة</label>
      <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg"></textarea>
    </section>

    <section class="bg-cream border border-black/10 rounded-2xl p-6 sticky bottom-4">
      <div class="flex justify-between text-sm">
        <span>الإجمالي الفرعي</span>
        <span dir="ltr">{{ formatSAR(subtotal) }}</span>
      </div>
      <div v-if="adjustmentOpen && adjustmentHalalas !== 0" class="flex justify-between text-sm mt-1">
        <span>{{ form.adjustment_label || 'تعديل' }}</span>
        <span dir="ltr">{{ formatSAR(adjustmentHalalas) }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-black/10">
        <span>الإجمالي</span>
        <span class="text-forest" dir="ltr">{{ formatSAR(total) }}</span>
      </div>

      <div v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</div>

      <div class="flex gap-3 mt-4">
        <button type="submit" :disabled="saving" class="px-5 py-2 border border-black/10 rounded-lg disabled:opacity-50">
          {{ submitLabels.draft }}
        </button>
        <button v-if="showSentButton !== false" type="button" @click="submit('sent')" :disabled="saving" class="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-50">
          {{ submitLabels.sent }}
        </button>
      </div>
    </section>
  </form>
</template>
```

Notes:
- `CustomerPicker` is auto-imported by Nuxt from `components/admin/` thanks to default component auto-import; if your repo uses a non-default path prefix, import it explicitly with `import CustomerPicker from '~/components/admin/CustomerPicker.vue'`.
- The `text-forest` class assumes a Tailwind theme entry. If your Tailwind config doesn't define `forest`, replace with `text-[#15803D]` literally.

- [ ] **Step 10.3: Verify Tailwind `forest` color exists**

Run:
```sh
grep -n "forest" tailwind.config.* 2>/dev/null
```

If no result, replace `text-forest` and `bg-forest` (if any) in the components above with `text-[#15803D]` / `bg-[#15803D]`. Forest green hex is `#15803D` per `CLAUDE.md`.

- [ ] **Step 10.4: Commit (ask user first)**

```sh
git add components/admin/CustomerPicker.vue components/admin/InvoiceForm.vue
git commit -m "feat(invoices): shared CustomerPicker + InvoiceForm components"
```

---

## Task 11: Invoice admin pages (list, new, edit)

**Files:**
- Create `pages/admin/invoices/index.vue`
- Create `pages/admin/invoices/new.vue`
- Create `pages/admin/invoices/[id].vue`

- [ ] **Step 11.1: List page `pages/admin/invoices/index.vue`**

```vue
<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ middleware: 'admin' })

interface InvoiceRow {
  id: number
  slug: string
  number: string
  status: 'draft' | 'sent' | 'paid'
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_id: number
  customer_name: string
  subtotal: number
}

const route = useRoute()
const router = useRouter()
const { formatSAR } = useMoney()

const filter = computed(() => (route.query.status as string) || 'all')

const queryParam = computed(() => filter.value === 'all' ? '' : `?status=${filter.value}`)
const { data, refresh } = await useFetch<{ invoices: InvoiceRow[] }>(
  () => `/api/admin/invoices${queryParam.value}`,
)

const todayISO = new Date().toISOString().slice(0, 10)

function setFilter(f: string) {
  router.push({ path: '/admin/invoices', query: f === 'all' ? {} : { status: f } })
}

function isOverdue(inv: InvoiceRow): boolean {
  return inv.status === 'sent' && inv.due_date < todayISO
}

function badgeClass(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'bg-red-50 text-red-700 border-red-100'
  if (inv.status === 'paid') return 'bg-green-50 text-green-700 border-green-100'
  if (inv.status === 'sent') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}

function badgeText(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'متأخرة'
  if (inv.status === 'paid') return 'مدفوعة'
  if (inv.status === 'sent') return 'مرسلة'
  return 'مسودة'
}

const totals = computed(() => {
  let outstanding = 0, overdue = 0, overdueCount = 0
  for (const inv of data.value?.invoices ?? []) {
    const total = inv.subtotal + (inv.adjustment ?? 0)
    if (inv.status === 'sent') {
      outstanding += total
      if (isOverdue(inv)) { overdue += total; overdueCount++ }
    }
  }
  return { outstanding, overdue, overdueCount }
})
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">الفواتير</h1>
      <NuxtLink to="/admin/invoices/new" class="px-4 py-2 bg-black text-white rounded-lg text-sm">+ فاتورة جديدة</NuxtLink>
    </div>

    <div class="flex gap-2 mb-5">
      <button v-for="opt in ['all', 'draft', 'sent', 'paid']" :key="opt"
        @click="setFilter(opt)"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm border',
          filter === opt ? 'bg-black text-white border-black' : 'border-black/10 hover:bg-cream'
        ]"
      >
        {{ ({ all: 'الكل', draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة' } as any)[opt] }}
      </button>
    </div>

    <div v-if="!data?.invoices?.length" class="text-center py-16 text-gray-500">
      لا توجد فواتير بعد.
    </div>

    <div v-else class="bg-white border border-black/10 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-cream text-right">
          <tr>
            <th class="p-3 font-medium">الرقم</th>
            <th class="p-3 font-medium">العميل</th>
            <th class="p-3 font-medium">الإصدار</th>
            <th class="p-3 font-medium">الاستحقاق</th>
            <th class="p-3 font-medium">الحالة</th>
            <th class="p-3 font-medium text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in data.invoices" :key="inv.id" class="border-t border-black/5 hover:bg-cream/50 cursor-pointer">
            <td class="p-3"><NuxtLink :to="`/admin/invoices/${inv.id}`" class="font-mono">{{ inv.number }}</NuxtLink></td>
            <td class="p-3">{{ inv.customer_name }}</td>
            <td class="p-3 text-gray-600">{{ inv.issue_date }}</td>
            <td class="p-3 text-gray-600">{{ inv.due_date }}</td>
            <td class="p-3"><span :class="['inline-block px-2 py-0.5 rounded-md text-xs border', badgeClass(inv)]">{{ badgeText(inv) }}</span></td>
            <td class="p-3 text-left font-medium" dir="ltr">{{ formatSAR(inv.subtotal + (inv.adjustment ?? 0)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

- [ ] **Step 11.2: New page `pages/admin/invoices/new.vue`**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { data: settingsData } = await useFetch<{ settings: { default_due_days: number; default_notes: string | null } }>('/api/admin/settings')

const saving = ref(false)
const error = ref<string | null>(null)

async function onSubmit(payload: { status: 'draft' | 'sent'; data: any }) {
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: boolean; invoice: { id: number } }>('/api/admin/invoices', {
      method: 'POST',
      body: { ...payload.data, status: payload.status },
    })
    await navigateTo(`/admin/invoices/${res.invoice.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/admin/invoices" class="text-sm text-gray-500 mb-3 inline-block">← الفواتير</NuxtLink>
    <h1 class="text-2xl font-bold mb-6">فاتورة جديدة</h1>

    <div v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</div>

    <InvoiceForm
      :default-due-days="settingsData?.settings.default_due_days ?? 14"
      :default-notes="settingsData?.settings.default_notes ?? ''"
      :submit-labels="{ draft: 'حفظ كمسودة', sent: 'حفظ ووضع كمرسلة' }"
      @submit="onSubmit"
    />
  </div>
</template>
```

- [ ] **Step 11.3: Edit page `pages/admin/invoices/[id].vue`**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const id = route.params.id

interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'paid'
  customer_id: number
  issue_date: string; due_date: string
  adjustment: number; adjustment_label: string | null
  notes: string | null
}
interface ItemRow { id: number; position: number; description: string; amount: number }

const { data, refresh } = await useFetch<{ invoice: Invoice; items: ItemRow[] }>(
  () => `/api/admin/invoices/${id}`,
)

const error = ref<string | null>(null)
const busy = ref(false)

const publicUrl = computed(() => {
  if (!data.value?.invoice?.slug) return ''
  if (typeof window === 'undefined') return `/i/${data.value.invoice.slug}`
  return `${window.location.origin}/i/${data.value.invoice.slug}`
})

async function onSubmit(payload: { status: 'draft' | 'sent'; data: any }) {
  busy.value = true; error.value = null
  try {
    await $fetch(`/api/admin/invoices/${id}`, { method: 'PUT', body: payload.data })
    // Edit page doesn't toggle status (mark-sent button does that). Refresh and continue.
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally { busy.value = false }
}

async function markSent() {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/mark-sent`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function markPaid() {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/mark-paid`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function duplicate() {
  busy.value = true; error.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>(`/api/admin/invoices/${id}/duplicate`, { method: 'POST' })
    await navigateTo(`/admin/invoices/${res.id}`)
  } catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function remove() {
  if (!confirm('هل تريد حذف هذه الفاتورة؟')) return
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' }); await navigateTo('/admin/invoices') }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function copyLink() {
  if (!publicUrl.value) return
  try { await navigator.clipboard.writeText(publicUrl.value) } catch {}
}

const initial = computed(() => {
  if (!data.value) return undefined
  return {
    customer_id: data.value.invoice.customer_id,
    issue_date: data.value.invoice.issue_date,
    due_date: data.value.invoice.due_date,
    items: data.value.items.map(i => ({ description: i.description, amount: i.amount })),
    adjustment: data.value.invoice.adjustment,
    adjustment_label: data.value.invoice.adjustment_label ?? '',
    notes: data.value.invoice.notes ?? '',
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-6" v-if="data">
    <NuxtLink to="/admin/invoices" class="text-sm text-gray-500 mb-3 inline-block">← الفواتير</NuxtLink>

    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold font-mono">{{ data.invoice.number }}</h1>
        <div class="text-sm text-gray-500 mt-1">الحالة: {{ data.invoice.status }}</div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button type="button" @click="duplicate" :disabled="busy" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">تكرار للشهر القادم</button>
        <button v-if="data.invoice.status === 'draft'" type="button" @click="markSent" :disabled="busy" class="px-3 py-1.5 text-sm bg-black text-white rounded-lg">وضع كمرسلة</button>
        <button v-if="data.invoice.status === 'sent'" type="button" @click="markPaid" :disabled="busy" class="px-3 py-1.5 text-sm bg-[#15803D] text-white rounded-lg">وضع كمدفوعة</button>
        <a v-if="data.invoice.status !== 'draft'" :href="publicUrl" target="_blank" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">عرض الفاتورة</a>
        <button v-if="data.invoice.status !== 'draft'" type="button" @click="copyLink" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">نسخ الرابط</button>
        <button v-if="data.invoice.status === 'draft'" type="button" @click="remove" :disabled="busy" class="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg">حذف</button>
      </div>
    </div>

    <div v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</div>

    <InvoiceForm
      v-if="initial"
      :initial="initial"
      :submit-labels="{ draft: 'حفظ التغييرات', sent: 'حفظ ووضع كمرسلة' }"
      :show-sent-button="data.invoice.status === 'draft'"
      @submit="onSubmit"
    />
  </div>
</template>
```

- [ ] **Step 11.4: Verify in dev**

Visit `http://localhost:3002/admin/invoices`. Confirm:
- Empty filter chips switch and reload list
- "+ فاتورة جديدة" → form loads with default due_date = today + 14
- CustomerPicker shows existing customers + "+ جديد" works inline
- Item rows add/remove; subtotal updates live; adjustment expand/collapse works
- Save as draft → redirects to edit page with the new number
- Mark sent → button switches to "وضع كمدفوعة"
- Duplicate → navigates to a new draft with cloned items
- "عرض الفاتورة" opens `/i/<slug>` (404 for now — viewer page not built yet)
- Delete only available on draft

- [ ] **Step 11.5: Commit (ask user first)**

```sh
git add pages/admin/invoices/
git commit -m "feat(invoices): invoice admin pages"
```

---

## Task 12: Public invoice viewer `/i/[slug]`

**Files:** Create `pages/i/[slug].vue`

- [ ] **Step 12.1: Write the viewer page**

```vue
<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = route.params.slug as string
const preview = route.query.preview === '1' ? '?preview=1' : ''

interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'paid'
  issue_date: string; due_date: string
  currency: string
  adjustment: number
  adjustment_label: string | null
  notes: string | null
}
interface Customer { name: string; email: string | null; phone: string | null; company: string | null }
interface ItemRow { id: number; position: number; description: string; amount: number }
interface Settings {
  business_name: string; logo_url: string | null
  email: string | null; phone: string | null; address: string | null
  bank_name: string | null; bank_account_name: string | null
  bank_account_number: string | null; bank_iban: string | null
}

const { data, error } = await useFetch<{
  invoice: Invoice; customer: Customer; items: ItemRow[]; settings: Settings
}>(`/api/i/${slug}${preview}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة', fatal: true })
}

const { formatSAR } = useMoney()

const subtotal = computed(() => (data.value?.items ?? []).reduce((s, i) => s + i.amount, 0))
const adjustment = computed(() => data.value?.invoice.adjustment ?? 0)
const total = computed(() => subtotal.value + adjustment.value)

const todayISO = new Date().toISOString().slice(0, 10)
const isOverdue = computed(() => data.value?.invoice.status === 'sent' && data.value.invoice.due_date < todayISO)
const isPaid = computed(() => data.value?.invoice.status === 'paid')

useHead(() => ({
  title: data.value ? `${data.value.invoice.number} — فاتورة` : 'فاتورة',
}))

function printIt() { window.print() }
</script>

<template>
  <div v-if="data" class="min-h-screen bg-cream py-10 px-4">
    <div class="invoice mx-auto max-w-3xl bg-white rounded-2xl border border-black/10 p-10 relative">

      <!-- Status ribbons (screen only) -->
      <div v-if="isPaid" class="ribbon absolute top-6 left-6 px-3 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium no-print">مدفوعة</div>
      <div v-else-if="isOverdue" class="ribbon absolute top-6 left-6 px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm font-medium no-print">متأخرة</div>

      <!-- Header -->
      <header class="flex items-start justify-between mb-10 pb-6 border-b border-black/10">
        <div>
          <img v-if="data.settings.logo_url" :src="data.settings.logo_url" alt="" class="h-10 w-auto" />
          <div v-else class="text-lg font-bold">{{ data.settings.business_name }}</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">فاتورة</div>
          <div class="font-mono text-sm mt-1">{{ data.invoice.number }}</div>
          <div class="text-sm text-gray-600 mt-1">تاريخ الإصدار: {{ data.invoice.issue_date }}</div>
          <div class="text-sm text-gray-600">تاريخ الاستحقاق: {{ data.invoice.due_date }}</div>
        </div>
      </header>

      <!-- From / To -->
      <section class="grid grid-cols-2 gap-6 mb-10">
        <div>
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">من</div>
          <div class="font-semibold">{{ data.settings.business_name }}</div>
          <div v-if="data.settings.email" class="text-sm text-gray-600">{{ data.settings.email }}</div>
          <div v-if="data.settings.phone" class="text-sm text-gray-600" dir="ltr">{{ data.settings.phone }}</div>
          <div v-if="data.settings.address" class="text-sm text-gray-600">{{ data.settings.address }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">إلى</div>
          <div v-if="data.customer.company" class="font-semibold">{{ data.customer.company }}</div>
          <div :class="data.customer.company ? 'text-sm text-gray-700' : 'font-semibold'">{{ data.customer.name }}</div>
          <div v-if="data.customer.email" class="text-sm text-gray-600">{{ data.customer.email }}</div>
          <div v-if="data.customer.phone" class="text-sm text-gray-600" dir="ltr">{{ data.customer.phone }}</div>
        </div>
      </section>

      <!-- Items -->
      <section class="mb-10">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/10">
              <th class="text-right py-3 font-medium">البند</th>
              <th class="text-left py-3 font-medium w-40">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in data.items" :key="it.id" class="border-b border-black/5">
              <td class="py-3">{{ it.description }}</td>
              <td class="py-3 text-left" dir="ltr">{{ formatSAR(it.amount) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="ml-auto mt-6 max-w-xs space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">الإجمالي الفرعي</span>
            <span dir="ltr">{{ formatSAR(subtotal) }}</span>
          </div>
          <div v-if="adjustment !== 0" class="flex justify-between">
            <span class="text-gray-600">{{ data.invoice.adjustment_label || 'تعديل' }}</span>
            <span dir="ltr">{{ formatSAR(adjustment) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold pt-3 border-t-2 border-[#15803D]">
            <span>الإجمالي</span>
            <span dir="ltr">{{ formatSAR(total) }}</span>
          </div>
        </div>
      </section>

      <!-- Bank -->
      <section v-if="data.settings.bank_name || data.settings.bank_iban" class="bg-cream rounded-xl p-5 mb-8">
        <h3 class="font-semibold mb-3">معلومات الدفع</h3>
        <dl class="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          <dt class="text-gray-600">البنك</dt><dd>{{ data.settings.bank_name || '—' }}</dd>
          <dt class="text-gray-600">اسم الحساب</dt><dd>{{ data.settings.bank_account_name || '—' }}</dd>
          <dt v-if="data.settings.bank_account_number" class="text-gray-600">رقم الحساب</dt>
          <dd v-if="data.settings.bank_account_number" class="font-mono" dir="ltr">{{ data.settings.bank_account_number }}</dd>
          <dt v-if="data.settings.bank_iban" class="text-gray-600">الآيبان</dt>
          <dd v-if="data.settings.bank_iban" class="font-mono" dir="ltr">{{ data.settings.bank_iban }}</dd>
        </dl>
      </section>

      <!-- Notes -->
      <section v-if="data.invoice.notes" class="text-sm text-gray-700 whitespace-pre-wrap">
        <h3 class="font-semibold mb-2 text-gray-900">ملاحظات</h3>
        {{ data.invoice.notes }}
      </section>
    </div>

    <div class="max-w-3xl mx-auto mt-6 text-center no-print">
      <button @click="printIt" class="px-5 py-2 bg-black text-white rounded-lg text-sm">اطبع / احفظ PDF</button>
    </div>
  </div>
</template>

<style>
@media print {
  @page { size: A4; margin: 16mm; }
  body { background: white !important; }
  .no-print, .ribbon { display: none !important; }
  .invoice { box-shadow: none !important; border: none !important; }
  a { color: inherit; text-decoration: none; }
}
</style>
```

- [ ] **Step 12.2: Add `/i/**` to `nuxt.config.ts` prerender ignore**

Edit `nuxt.config.ts`, in the `nitro.prerender.ignore` array, add `'/i/**'`:

```ts
ignore: ['/build/ai-agent-v1', '/admin', '/admin/**', '/p/**', '/i/**'],
```

- [ ] **Step 12.3: Verify in dev (incognito)**

In an incognito window (no admin cookie):
- Visit `http://localhost:3002/i/<slug-of-a-sent-invoice>` → renders correctly
- Visit `http://localhost:3002/i/<slug-of-a-draft>` → 404 page
- Browser print preview (Cmd+P): A4 layout, no buttons/ribbon, prints cleanly

Visual checks:
- Logo top-right (RTL), invoice title and number top-left after RTL flip
- Two-column "من / إلى" block
- Items table with right-aligned descriptions, left-aligned amounts
- Totals stack right-aligned with forest-green underline on الإجمالي
- Cream bank block
- IBAN/account number in monospace, LTR
- "اطبع / احفظ PDF" button at bottom (screen only)

- [ ] **Step 12.4: Commit (ask user first)**

```sh
git add pages/i/\[slug\].vue nuxt.config.ts
git commit -m "feat(invoices): public viewer page + print CSS + prerender ignore"
```

---

## Task 13: Admin dashboard widget

**Files:** Modify `pages/admin/index.vue`

- [ ] **Step 13.1: Inspect the existing dashboard**

Read `pages/admin/index.vue` to see the current structure (proposals widget). Insert the invoices widget above it. The exact placement depends on the existing markup — match the proposal widget's container style.

- [ ] **Step 13.2: Add the widget**

In `pages/admin/index.vue`, in the `<script setup>` section, add:

```ts
import { useMoney } from '~/composables/useMoney'

interface InvoiceRow {
  id: number; status: string; due_date: string
  subtotal: number; adjustment: number
}

const { formatSAR } = useMoney()
const { data: invData } = await useFetch<{ invoices: InvoiceRow[] }>('/api/admin/invoices')
const today = new Date().toISOString().slice(0, 10)

const invStats = computed(() => {
  let outstanding = 0, outstandingCount = 0, overdue = 0, overdueCount = 0
  for (const inv of invData.value?.invoices ?? []) {
    if (inv.status !== 'sent') continue
    const total = inv.subtotal + (inv.adjustment ?? 0)
    outstanding += total; outstandingCount++
    if (inv.due_date < today) { overdue += total; overdueCount++ }
  }
  return { outstanding, outstandingCount, overdue, overdueCount }
})
```

And in the `<template>`, above the existing proposals section, add:

```vue
<section class="bg-white border border-black/10 rounded-2xl p-6 mb-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold">الفواتير</h2>
    <div class="flex gap-2">
      <NuxtLink to="/admin/customers" class="text-sm text-gray-500 hover:underline">العملاء</NuxtLink>
      <span class="text-gray-300">·</span>
      <NuxtLink to="/admin/settings" class="text-sm text-gray-500 hover:underline">الإعدادات</NuxtLink>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-6 mb-4">
    <div>
      <div class="text-xs text-gray-500 mb-1">المعلقة</div>
      <div class="text-xl font-bold" dir="ltr">{{ formatSAR(invStats.outstanding) }}</div>
      <div class="text-xs text-gray-500 mt-0.5">{{ invStats.outstandingCount }} فاتورة</div>
    </div>
    <div>
      <div class="text-xs text-gray-500 mb-1">المتأخرة</div>
      <div class="text-xl font-bold" :class="invStats.overdue > 0 ? 'text-red-600' : ''" dir="ltr">{{ formatSAR(invStats.overdue) }}</div>
      <div class="text-xs text-gray-500 mt-0.5">{{ invStats.overdueCount }} فاتورة</div>
    </div>
  </div>
  <NuxtLink to="/admin/invoices" class="text-sm text-[#15803D] hover:underline">عرض كل الفواتير ←</NuxtLink>
</section>
```

- [ ] **Step 13.3: Verify in dev**

Visit `http://localhost:3002/admin`. Confirm the invoices widget appears with correct outstanding/overdue totals.

- [ ] **Step 13.4: Commit (ask user first)**

```sh
git add pages/admin/index.vue
git commit -m "feat(invoices): admin dashboard widget"
```

---

## Task 14: Local end-to-end exercise

This is verification, no new code. Run before the deploy preflight.

- [ ] **Step 14.1: Reset local DB to a clean slate (optional, recommended)**

```sh
npx wrangler d1 execute sufyanfa-proposals --local --command="DELETE FROM invoice_items; DELETE FROM invoices; DELETE FROM customers; UPDATE settings SET bank_name='الراجحي', bank_account_name='سفيان فارع', bank_iban='SA0380000000608010167519', default_notes='شكراً لتعاملك. يُرجى السداد خلال 14 يوماً.' WHERE id=1;"
```

- [ ] **Step 14.2: Walk the full flow in the browser**

1. Log in at `http://localhost:3002/admin/login`
2. Visit `/admin/settings` — confirm fields persisted from step 14.1
3. Visit `/admin/customers/new` — create "شركة بوصلة"
4. Visit `/admin/invoices/new` — pick شركة بوصلة, add 2 items (استضافة 200 SAR, قاعدة بيانات 150 SAR), add adjustment "خصم العميل المميز" -50 SAR. Save as مرسلة.
5. Land on edit page. Click "عرض الفاتورة" — opens `/i/<slug>` in new tab.
6. In the new tab, verify the layout: header / from-to / items table / totals (300.00 ر.س) / bank block / notes / print button.
7. Print preview (Cmd+P) — clean A4, no ribbon, no print button.
8. Back on the edit page, click "وضع كمدفوعة". Reopen viewer — green "مدفوعة" ribbon shows on screen.
9. Click "تكرار للشهر القادم" — lands on a new draft INV-2026-0002 with cloned items.
10. Visit `/admin` — invoices widget shows correct outstanding (0, since #1 is paid) and overdue (0).

If anything fails, fix before proceeding.

---

## Task 15: Deploy preflight + production migration + deploy

This follows the codified preflight in `CLAUDE.md`. **Do not deviate.** Do not skip any step.

- [ ] **Step 15.1: Clean build state**

```sh
rm -rf dist .output .nuxt
```

- [ ] **Step 15.2: Production build**

```sh
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=8192 yarn build
```

Expected: build completes with no errors. Watch for warnings about missing modules or undefined references.

- [ ] **Step 15.3: Verify no dev-runtime leak (CRITICAL)**

```sh
ls dist/_worker.js/chunks/vite-node-shared.mjs 2>&1
```

Expected: `ls: dist/_worker.js/chunks/vite-node-shared.mjs: No such file or directory`. If the file EXISTS, the build has leaked `nitro-cloudflare-dev` into prod — abort and check `nuxt.config.ts`.

```sh
head -1 dist/_worker.js/chunks/app/client.manifest.mjs
```

Expected: starts with `const e={`. NOT `const client_manifest=()=>o("/manifest")`.

- [ ] **Step 15.4: Smoke test via wrangler pages dev (the REAL Workers runtime)**

```sh
# Kill anything on 8790 first
lsof -ti :8790 | xargs -r kill -9 2>/dev/null
npx wrangler pages dev dist/ --port 8790 &
```

Wait ~5 seconds, then smoke-test (use `/usr/bin/curl` to dodge shell aliases):

```sh
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" http://localhost:8790/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" http://localhost:8790/admin/login
/usr/bin/curl -s -o /dev/null -w "/admin/invoices %{http_code}\n" http://localhost:8790/admin/invoices
/usr/bin/curl -s -o /dev/null -w "/admin/customers %{http_code}\n" http://localhost:8790/admin/customers
/usr/bin/curl -s -o /dev/null -w "/admin/settings %{http_code}\n" http://localhost:8790/admin/settings
/usr/bin/curl -s -o /dev/null -w "/api/admin/me (no session) %{http_code}\n" http://localhost:8790/api/admin/me
```

Expected: all page routes 200 (admin pages may render the gated login redirect, but should be 200, not 500). `/api/admin/me` → 401. Kill the wrangler process after.

If any route returns 5xx, abort and diagnose. Common causes:
- Missing `useDB` binding in dev — Pages local dev needs the D1 binding from `wrangler.toml`
- TypeScript error not caught at build time — check the build output more carefully

- [ ] **Step 15.5: Apply the migration to REMOTE D1**

```sh
npx wrangler d1 execute sufyanfa-proposals --remote --file=migrations/0002_invoices.sql
```

Expected: `Executed N commands`. If it fails because the `settings` row already exists (from a re-run), that's fine — the migration is mostly idempotent except for the seed INSERT. To avoid this on re-runs, the seed could use `INSERT OR IGNORE`, but for first run it's clean.

- [ ] **Step 15.6: Deploy the verified build (do NOT rebuild)**

```sh
npx wrangler pages deploy dist --project-name=sufyanfa-com
```

Wrangler will print a preview URL like `https://abc123.sufyanfa-com.pages.dev`.

- [ ] **Step 15.7: Smoke-test the PREVIEW URL**

```sh
PREVIEW_URL=<paste the URL wrangler printed>
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" $PREVIEW_URL/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" $PREVIEW_URL/admin/login
/usr/bin/curl -s -o /dev/null -w "/admin/invoices %{http_code}\n" $PREVIEW_URL/admin/invoices
```

Expected: all 200. If any 5xx, do NOT promote to prod — diagnose.

- [ ] **Step 15.8: Verify prod alias**

```sh
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" https://sufyanfa.com/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" https://sufyanfa.com/admin/login
/usr/bin/curl -s -o /dev/null -w "/admin/invoices %{http_code}\n" https://sufyanfa.com/admin/invoices
```

Expected: all 200.

- [ ] **Step 15.9: Live exercise in prod**

Log in at `https://sufyanfa.com/admin/login`. Repeat task 14's flow against production. Confirm the new D1 tables work end-to-end. If you haven't yet configured settings, do so first (`/admin/settings`).

- [ ] **Step 15.10: Final commit (if there were any post-build fixes)**

If the preflight surfaced any code changes, commit them and re-run from step 15.1. Otherwise nothing to commit here — the implementation commits from Tasks 1-13 already cover the feature.

---

## Self-review notes

This plan was checked against the spec for:

- **Spec coverage:** all 4 tables, all 16 admin API endpoints + 1 public, all 8 admin pages + 1 viewer + 1 widget, both shared components, money utility, slug utility, print CSS, prerender ignore, deploy preflight. Settings bootstrap seeded in the migration. Invoice numbering atomic via `INSERT … strftime('%Y','now') …`. Slug random 22 chars. Draft → 404 (with admin `?preview=1` override). Customer delete blocked when invoices exist (409). Overdue computed client-side from `due_date`.
- **Placeholder scan:** no TBD/TODO. Every commit step shows exact `git` command. Every API endpoint has full code. Tailwind `forest` color contingency handled in Task 10 step 3.
- **Type consistency:** `Invoice.status` is the same literal union across server endpoints and Vue pages. `subtotal` field shape consistent between list endpoint, dashboard widget, and list page. `InvoiceForm` props/emits match what the new/edit pages pass. `useMoney` API identical to the server-side `money.ts`.
- **Scope:** one cohesive feature, single plan, sequenced commits. Each task ends in a working/committable state.

Open assumption: existence of a `middleware/admin.ts` route middleware. If it's not present, Task 8 step 4 provides the literal contents to create it.

Project-rule reminders that override the skill's defaults:
- **Yarn, not npm**, throughout
- **Dev port 3002**
- **No emojis** in any text generated
- **Commits only on explicit user OK** at each commit checkpoint
- **Deploy preflight is mandatory** (Task 15) — never `yarn deploy` blind
