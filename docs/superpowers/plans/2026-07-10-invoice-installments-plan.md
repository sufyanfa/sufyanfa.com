# Invoice Installments & Status Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an invoice be collected in multiple tranches (e.g. 40% deposit / 60% on completion), each tracked with its own due date and paid/pending state, and add a stats bar to `/admin/invoices` showing how many invoices are in each state and how much money is outstanding vs collected.

**Architecture:** Purely additive to the existing invoice system (`migrations/0002_invoices.sql`, `server/api/admin/invoices/*`, `pages/admin/invoices/*`). A new `invoice_installments` table holds the payment plan; `invoices.status` becomes derived from installment state (`draft`/`sent`/`partially_paid`/`paid`) instead of being toggled directly, except for the existing `draft`→`sent` transition. Money stays integer halalas throughout, matching the rest of the codebase.

**Tech Stack:** Nuxt 3 (Vue 3, `<script setup>`), Cloudflare D1 (via `useDB(event)`), Nitro server routes, Tailwind, Arabic RTL, `yarn`.

## Global Constraints

- Use **yarn** for all commands, never npm.
- Dev server runs on **port 3002** (`yarn dev`, already wired).
- Money is integer **halalas** (SAR × 100) everywhere; format only at the leaf via `formatSAR`/`useMoney`.
- **No emojis** anywhere in UI copy.
- Arabic RTL copy throughout; match the existing tone (e.g. `الفاتورة غير موجودة`, `العميل مطلوب`).
- This project has **no automated test runner** (no vitest/jest in `package.json`). Every task's verification step below is a concrete manual command (D1 SQL via `wrangler d1 execute`, `curl` against a running `yarn dev`, or an exact browser click-path) with an exact expected result — this replaces unit tests for this codebase, it is not a placeholder.
- **Per this repo's CLAUDE.md: do not run `git commit` automatically.** Each task below ends with a "Stage & propose commit" step showing the exact `git add` + `git commit -m "..."` command to run — treat it as a checkpoint to show the user and get a go-ahead, not something to execute unprompted.
- Full deploy preflight (`CLAUDE.md`) is required before any `yarn deploy` / `wrangler pages deploy` — not part of this plan's per-task verification, only the final task.
- Before starting: confirm a local admin user exists (`yarn db:seed:local <email> <password>` if not — check by attempting the login curl in Task 2's verification).

---

## File Structure

New files:
- `migrations/0007_invoice_installments.sql` — table + backfill
- `server/utils/installments.ts` — shared plan-building, insertion, and status-derivation logic used by every endpoint below
- `server/api/admin/invoices/[id]/installments/[iid]/mark-paid.post.ts` — mark one installment paid

Modified files:
- `server/api/admin/invoices/index.post.ts` — accept `installments[]` on create
- `server/api/admin/invoices/[id].put.ts` — accept `installments[]` on update (locked once any installment is paid)
- `server/api/admin/invoices/[id].get.ts` — return `installments[]`
- `server/api/admin/invoices/[id]/mark-paid.post.ts` — repurposed to settle all remaining installments
- `server/api/admin/invoices/index.get.ts` — list response gains per-row `collected`/`has_overdue` and a `stats` block
- `server/api/admin/invoices/[id]/duplicate.post.ts` — clone the installment plan
- `server/api/i/[slug].get.ts` — public payload gains `installments[]`
- `components/Admin/InvoiceForm.vue` — "خطة الدفع" split-payment section
- `pages/admin/invoices/[id].vue` — per-installment payment UI, `locked` state, Arabic status label
- `pages/admin/invoices/index.vue` — stats bar, `partially_paid` filter/badge
- `pages/i/[slug].vue` — public payment schedule table

---

### Task 1: Migration — `invoice_installments` table + backfill

**Files:**
- Create: `migrations/0007_invoice_installments.sql`

**Interfaces:**
- Produces: table `invoice_installments(id, invoice_id, position, label, percentage, amount, due_date, status, paid_at, created_at, updated_at)` — every task below depends on this schema exactly.

- [ ] **Step 1: Write the migration**

```sql
-- Split-payment installment plans for invoices.
-- Every invoice (old and new) has >=1 installment row, so status-derivation
-- logic never has to special-case "no installments". Amounts stored as
-- halalas, snapshotted at plan-save time (see server/utils/installments.ts).

CREATE TABLE invoice_installments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  label        TEXT NOT NULL,
  percentage   INTEGER,
  amount       INTEGER NOT NULL,
  due_date     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  paid_at      INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_installments_invoice ON invoice_installments(invoice_id);

-- Backfill: every existing invoice gets one implicit 100% installment
-- mirroring its current status.
INSERT INTO invoice_installments
  (invoice_id, position, label, percentage, amount, due_date, status, paid_at, created_at, updated_at)
SELECT
  i.id, 0, 'الدفعة الكاملة', 100,
  COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment,
  i.due_date,
  CASE WHEN i.status = 'paid' THEN 'paid' ELSE 'pending' END,
  i.paid_at,
  i.created_at,
  i.updated_at
FROM invoices i;
```

- [ ] **Step 2: Apply locally**

Run: `yarn db:migrate:local`
Expected: output lists `0007_invoice_installments.sql` as applied, no errors.

- [ ] **Step 3: Verify backfill row count matches invoice count**

Run:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT (SELECT COUNT(*) FROM invoices) AS invoices, (SELECT COUNT(*) FROM invoice_installments) AS installments"
```
Expected: `invoices` and `installments` columns show the same number (one installment per invoice).

- [ ] **Step 4: Spot-check one row's amount**

Run:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT i.id, i.status, i.adjustment, (SELECT SUM(amount) FROM invoice_items WHERE invoice_id=i.id) AS items_sum, ii.amount AS installment_amount, ii.status AS installment_status FROM invoices i JOIN invoice_installments ii ON ii.invoice_id = i.id LIMIT 5"
```
Expected: for each row, `installment_amount` = `items_sum + adjustment`, and `installment_status` is `'paid'` exactly when `i.status = 'paid'`.

- [ ] **Step 5: Stage & propose commit**

```bash
git add migrations/0007_invoice_installments.sql
git commit -m "add invoice_installments table with backfill for split payments"
```

---

### Task 2: `server/utils/installments.ts` — shared plan logic, wired into invoice create

**Files:**
- Create: `server/utils/installments.ts`
- Modify: `server/api/admin/invoices/index.post.ts`

**Interfaces:**
- Consumes: `D1Database`/`D1PreparedStatement` types from `server/utils/db.ts` (`useDB(event)` returns `D1Database`); `createError` (Nitro global, used the same way `server/utils/db.ts` already uses it with no import).
- Produces (used by every later task):
  - `interface InstallmentInput { label: string; percentage: number; due_date: string }`
  - `interface InstallmentPlanRow { label: string; percentage: number | null; amount: number; due_date: string }`
  - `buildInstallmentPlan(input: InstallmentInput[] | undefined, invoiceTotal: number, issueDate: string, fallbackDueDate: string): InstallmentPlanRow[]`
  - `insertInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void>`
  - `replaceInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void>` — throws 409 if any existing installment is already `'paid'`
  - `deriveInvoiceStatus(installments: { status: string }[]): 'sent' | 'partially_paid' | 'paid'`
  - `recomputeInvoiceStatus(db: D1Database, invoiceId: number): Promise<void>` — writes `invoices.status`/`paid_at`/`updated_at`

- [ ] **Step 1: Write `server/utils/installments.ts`**

```ts
import type { D1Database } from './db'

export interface InstallmentInput {
  label: string
  percentage: number
  due_date: string
}

export interface InstallmentPlanRow {
  label: string
  percentage: number
  amount: number
  due_date: string
}

/**
 * Builds a validated installment plan from admin input.
 * - No input (or empty array) -> a single 100% installment using fallbackDueDate.
 * - Percentages must sum to exactly 100; amounts are computed with the last
 *   row absorbing the rounding remainder so the sum always equals
 *   invoiceTotal exactly (no floating halalas lost to rounding).
 */
export function buildInstallmentPlan(
  input: InstallmentInput[] | undefined,
  invoiceTotal: number,
  issueDate: string,
  fallbackDueDate: string,
): InstallmentPlanRow[] {
  if (!input || input.length === 0) {
    return [{ label: 'الدفعة الكاملة', percentage: 100, amount: invoiceTotal, due_date: fallbackDueDate }]
  }

  for (const row of input) {
    if (!row.label?.trim()) throw createError({ statusCode: 400, statusMessage: 'وصف الدفعة مطلوب' })
    if (!Number.isFinite(row.percentage) || row.percentage <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'نسبة الدفعة غير صحيحة' })
    }
    if (!row.due_date || row.due_date < issueDate) {
      throw createError({ statusCode: 400, statusMessage: 'تاريخ استحقاق الدفعة غير صحيح' })
    }
  }

  const pctSum = input.reduce((s, r) => s + r.percentage, 0)
  if (pctSum !== 100) {
    throw createError({ statusCode: 400, statusMessage: 'مجموع نسب الدفعات يجب أن يساوي 100%' })
  }
  let allocated = 0
  return input.map((r, idx) => {
    const isLast = idx === input.length - 1
    const amount = isLast ? invoiceTotal - allocated : Math.floor((invoiceTotal * r.percentage) / 100)
    allocated += amount
    return { label: r.label.trim(), percentage: r.percentage, amount, due_date: r.due_date }
  })
}

export async function insertInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void> {
  const now = Date.now()
  for (let i = 0; i < plan.length; i++) {
    const p = plan[i]
    await db
      .prepare(`
        INSERT INTO invoice_installments
          (invoice_id, position, label, percentage, amount, due_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `)
      .bind(invoiceId, i, p.label, p.percentage, p.amount, p.due_date, now, now)
      .run()
  }
}

export async function replaceInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void> {
  const { results } = await db
    .prepare('SELECT status FROM invoice_installments WHERE invoice_id = ?')
    .bind(invoiceId)
    .all<{ status: string }>()
  if (results.some(r => r.status === 'paid')) {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن تعديل خطة الدفع بعد تسجيل دفعة واحدة على الأقل' })
  }
  await db.prepare('DELETE FROM invoice_installments WHERE invoice_id = ?').bind(invoiceId).run()
  await insertInstallments(db, invoiceId, plan)
}

export function deriveInvoiceStatus(installments: { status: string }[]): 'sent' | 'partially_paid' | 'paid' {
  const paidCount = installments.filter(i => i.status === 'paid').length
  if (paidCount === 0) return 'sent'
  if (paidCount === installments.length) return 'paid'
  return 'partially_paid'
}

export async function recomputeInvoiceStatus(db: D1Database, invoiceId: number): Promise<void> {
  const { results } = await db
    .prepare('SELECT status, paid_at FROM invoice_installments WHERE invoice_id = ?')
    .bind(invoiceId)
    .all<{ status: string; paid_at: number | null }>()
  const status = deriveInvoiceStatus(results)
  const paidAt = status === 'paid'
    ? results.reduce((max, r) => Math.max(max, r.paid_at ?? 0), 0) || null
    : null
  await db
    .prepare('UPDATE invoices SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?')
    .bind(status, paidAt, Date.now(), invoiceId)
    .run()
}
```

- [ ] **Step 2: Wire into `server/api/admin/invoices/index.post.ts`**

Add the import at the top:

```ts
import { buildInstallmentPlan, insertInstallments } from '~/server/utils/installments'
```

Add `installments?: import('~/server/utils/installments').InstallmentInput[]` to the `CreateBody` interface:

```ts
interface CreateBody {
  customer_id: number
  issue_date: string         // 'YYYY-MM-DD'
  due_date: string           // 'YYYY-MM-DD'
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
  status?: 'draft' | 'sent'  // defaults to 'draft'
  installments?: import('~/server/utils/installments').InstallmentInput[]
}
```

Inside the handler, right after items validation and before `const status = ...` line, compute the total and build the plan (this runs before the INSERT, so validation errors surface before anything is written):

```ts
  const invoiceTotal = body.items.reduce((s, it) => s + Math.trunc(it.amount), 0) + (Number.isFinite(body.adjustment) ? Math.trunc(body.adjustment as number) : 0)
  const plan = buildInstallmentPlan(body.installments, invoiceTotal, body.issue_date, body.due_date)
```

Inside the retry loop, right after the items-insert `for` loop and before `// Read back the assigned number + slug.`, add:

```ts
      await insertInstallments(db, invoiceId, plan)
```

- [ ] **Step 3: Get a local admin session cookie for curl verification**

Run (adjust email/password to your seeded local admin):
```bash
curl -s -c /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```
Expected: `{"ok":true,"email":"you@example.com"}`. (Requires `yarn dev` running in another terminal, on port 3002.)

- [ ] **Step 4: Create a customer to attach the invoice to (skip if one already exists)**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"عميل اختبار"}'
```
Expected: `{"ok":true, ...}` with an `id` — note it for the next step (call it `<CUSTOMER_ID>`).

- [ ] **Step 5: Create a split invoice via curl and verify the plan**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": <CUSTOMER_ID>,
    "issue_date": "2026-07-10",
    "due_date": "2026-08-10",
    "items": [{"description":"تصميم موقع","amount":1000000}],
    "installments": [
      {"label":"دفعة مقدمة","percentage":40,"due_date":"2026-07-10"},
      {"label":"الدفعة النهائية","percentage":60,"due_date":"2026-08-10"}
    ]
  }'
```
Expected: `{"ok":true,"invoice":{"id":<N>,...}}`.

Then:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT label, percentage, amount, due_date FROM invoice_installments WHERE invoice_id = <N> ORDER BY position"
```
Expected: two rows — `دفعة مقدمة` at `400000` halalas (40% of 1,000,000), `الدفعة النهائية` at `600000` halalas, summing exactly to `1000000`.

- [ ] **Step 6: Verify the percentage-sum guard rejects bad input**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": <CUSTOMER_ID>,
    "issue_date": "2026-07-10",
    "due_date": "2026-08-10",
    "items": [{"description":"بند","amount":1000}],
    "installments": [{"label":"دفعة","percentage":40,"due_date":"2026-07-10"}]
  }'
```
Expected: HTTP 400 with `statusMessage: "مجموع نسب الدفعات يجب أن يساوي 100%"`.

- [ ] **Step 7: Stage & propose commit**

```bash
git add server/utils/installments.ts server/api/admin/invoices/index.post.ts
git commit -m "add installment plan support to invoice creation"
```

---

### Task 3: Wire installment plan into invoice update (locked once paid)

**Files:**
- Modify: `server/api/admin/invoices/[id].put.ts`

**Interfaces:**
- Consumes: `buildInstallmentPlan`, `replaceInstallments` from Task 2.

- [ ] **Step 1: Update `server/api/admin/invoices/[id].put.ts`**

Add the import:

```ts
import { buildInstallmentPlan, replaceInstallments } from '~/server/utils/installments'
```

Add `installments?: import('~/server/utils/installments').InstallmentInput[]` to `UpdateBody`:

```ts
interface UpdateBody {
  customer_id: number
  issue_date: string
  due_date: string
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
  installments?: import('~/server/utils/installments').InstallmentInput[]
}
```

At the end of the handler, after the items delete+reinsert loop and before `return { ok: true }`, add:

```ts
  if (body.installments) {
    const invoiceTotal = body.items.reduce((s, it) => s + Math.trunc(it.amount), 0) + adjustment
    const plan = buildInstallmentPlan(body.installments, invoiceTotal, body.issue_date, body.due_date)
    await replaceInstallments(db, id, plan)
  }
```

(`replaceInstallments` itself throws the 409 "لا يمكن تعديل خطة الدفع..." if any installment on this invoice is already paid — no extra guard needed here. If `body.installments` is omitted entirely, existing installments are left untouched.)

- [ ] **Step 2: Verify editing an unpaid split invoice replaces the plan**

Using the invoice id `<N>` from Task 2 Step 5:

```bash
curl -s -b /tmp/admin-cookie.txt -X PUT http://localhost:3002/api/admin/invoices/<N> \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": <CUSTOMER_ID>,
    "issue_date": "2026-07-10",
    "due_date": "2026-08-20",
    "items": [{"description":"تصميم موقع","amount":1000000}],
    "installments": [
      {"label":"دفعة مقدمة","percentage":30,"due_date":"2026-07-10"},
      {"label":"الدفعة النهائية","percentage":70,"due_date":"2026-08-20"}
    ]
  }'
```
Expected: `{"ok":true}`.

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT label, percentage, amount FROM invoice_installments WHERE invoice_id = <N> ORDER BY position"
```
Expected: `300000` / `700000` halalas — the old 40/60 plan is gone, replaced by 30/70.

- [ ] **Step 3: Verify the locked guard**

Mark one installment paid directly in D1 to simulate a payment (Task 5 adds the real endpoint for this — this is just to test the guard in isolation):

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "UPDATE invoice_installments SET status='paid', paid_at=1700000000000 WHERE invoice_id=<N> AND position=0"
```

Then retry the same PUT from Step 2 (any installments payload):
Expected: HTTP 409 with `statusMessage: "لا يمكن تعديل خطة الدفع بعد تسجيل دفعة واحدة على الأقل"`.

Revert the simulated payment so later tasks start clean:
```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "UPDATE invoice_installments SET status='pending', paid_at=NULL WHERE invoice_id=<N> AND position=0"
```

- [ ] **Step 4: Stage & propose commit**

```bash
git add server/api/admin/invoices/[id].put.ts
git commit -m "let invoice updates replace the installment plan until a payment is recorded"
```

---

### Task 4: Return installments from `GET /api/admin/invoices/[id]`

**Files:**
- Modify: `server/api/admin/invoices/[id].get.ts`

**Interfaces:**
- Produces: response gains `installments: { id, position, label, percentage, amount, due_date, status, paid_at }[]`, consumed by the admin edit page (Task 10) and its `locked` computation.

- [ ] **Step 1: Update the handler**

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

  const { results: installments } = await db
    .prepare('SELECT id, position, label, percentage, amount, due_date, status, paid_at FROM invoice_installments WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all()

  return { invoice, customer, items, installments }
})
```

- [ ] **Step 2: Verify**

```bash
curl -s -b /tmp/admin-cookie.txt http://localhost:3002/api/admin/invoices/<N> | python3 -m json.tool
```
Expected: response has an `installments` array with 2 rows (label/percentage/amount/due_date/status/paid_at per row, from Task 3's 30/70 plan).

- [ ] **Step 3: Stage & propose commit**

```bash
git add "server/api/admin/invoices/[id].get.ts"
git commit -m "return installment plan from invoice detail endpoint"
```

---

### Task 5: Per-installment and settle-all payment endpoints

**Files:**
- Modify: `server/api/admin/invoices/[id]/mark-paid.post.ts`
- Create: `server/api/admin/invoices/[id]/installments/[iid]/mark-paid.post.ts`

**Interfaces:**
- Consumes: `recomputeInvoiceStatus` from Task 2.
- Produces: both endpoints return `{ ok: true }` and leave `invoices.status`/`paid_at` correctly derived — consumed by the admin detail page (Task 10).

- [ ] **Step 1: Repurpose `server/api/admin/invoices/[id]/mark-paid.post.ts` to settle all remaining installments**

```ts
import { useDB } from '~/server/utils/db'
import { recomputeInvoiceStatus } from '~/server/utils/installments'

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
    .prepare(`UPDATE invoice_installments SET status = 'paid', paid_at = COALESCE(paid_at, ?), updated_at = ? WHERE invoice_id = ? AND status != 'paid'`)
    .bind(now, now, id)
    .run()
  await recomputeInvoiceStatus(db, id)
  return { ok: true }
})
```

- [ ] **Step 2: Create `server/api/admin/invoices/[id]/installments/[iid]/mark-paid.post.ts`**

```ts
import { useDB } from '~/server/utils/db'
import { recomputeInvoiceStatus } from '~/server/utils/installments'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const iid = Number(getRouterParam(event, 'iid'))
  if (!Number.isFinite(id) || !Number.isFinite(iid)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status === 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن وضع مسودة كمدفوعة. اعرضها أولاً.' })
  }

  const installment = await db
    .prepare('SELECT id, status FROM invoice_installments WHERE id = ? AND invoice_id = ?')
    .bind(iid, id)
    .first<{ id: number; status: string }>()
  if (!installment) throw createError({ statusCode: 404, statusMessage: 'الدفعة غير موجودة' })
  if (installment.status === 'paid') {
    throw createError({ statusCode: 409, statusMessage: 'هذه الدفعة مدفوعة بالفعل' })
  }

  const now = Date.now()
  await db
    .prepare(`UPDATE invoice_installments SET status = 'paid', paid_at = ?, updated_at = ? WHERE id = ?`)
    .bind(now, now, iid)
    .run()
  await recomputeInvoiceStatus(db, id)
  return { ok: true }
})
```

- [ ] **Step 3: First mark invoice `<N>` sent (installments can't be paid on a draft), then pay one installment**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices/<N>/mark-sent
```
Expected: `{"ok":true}`.

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT id, label, status FROM invoice_installments WHERE invoice_id=<N> ORDER BY position"
```
Note the `id` of the first row (deposit) — call it `<IID>`.

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices/<N>/installments/<IID>/mark-paid
```
Expected: `{"ok":true}`.

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT status, paid_at FROM invoices WHERE id=<N>"
```
Expected: `status = 'partially_paid'`, `paid_at` is `NULL`.

- [ ] **Step 4: Settle the rest via mark-paid and verify full completion**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices/<N>/mark-paid
```
Expected: `{"ok":true}`.

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT status, paid_at FROM invoices WHERE id=<N>"
```
Expected: `status = 'paid'`, `paid_at` is a non-null timestamp.

- [ ] **Step 5: Verify double-paying the same installment 409s**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices/<N>/installments/<IID>/mark-paid
```
Expected: HTTP 409 with `statusMessage: "هذه الدفعة مدفوعة بالفعل"`.

- [ ] **Step 6: Stage & propose commit**

```bash
git add "server/api/admin/invoices/[id]/mark-paid.post.ts" "server/api/admin/invoices/[id]/installments/[iid]/mark-paid.post.ts"
git commit -m "add per-installment payment tracking with derived invoice status"
```

---

### Task 6: List endpoint stats block + per-row overdue/collected

**Files:**
- Modify: `server/api/admin/invoices/index.get.ts`

**Interfaces:**
- Produces: `{ invoices: ListRow[], stats: { counts: { draft, sent, partially_paid, paid, overdue }, totals: { invoiced, collected, outstanding } } }` where `ListRow` gains `collected: number` and `has_overdue: boolean` — consumed by Task 11's admin list page.

- [ ] **Step 1: Rewrite the handler**

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
  collected: number
  has_overdue: boolean
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const status = getQuery(event).status as string | undefined
  const db = useDB(event)
  const today = todayISO()

  const where = status && ['draft', 'sent', 'partially_paid', 'paid'].includes(status)
    ? 'WHERE i.status = ?'
    : ''

  const listStmt = db.prepare(`
    SELECT i.id, i.slug, i.number, i.status, i.issue_date, i.due_date,
           i.currency, i.adjustment, i.customer_id,
           c.name AS customer_name,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) AS subtotal,
           COALESCE((SELECT SUM(amount) FROM invoice_installments WHERE invoice_id = i.id AND status = 'paid'), 0) AS collected,
           EXISTS(
             SELECT 1 FROM invoice_installments
             WHERE invoice_id = i.id AND status = 'pending' AND due_date < ?
           ) AS has_overdue
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    ${where}
    ORDER BY i.created_at DESC
  `)
  const boundList = where ? listStmt.bind(today, status) : listStmt.bind(today)
  const { results } = await boundList.all<ListRow>()
  const invoices = results.map(r => ({ ...r, has_overdue: !!r.has_overdue }))

  const statsStmt = db.prepare(`
    SELECT i.status,
           EXISTS(
             SELECT 1 FROM invoice_installments
             WHERE invoice_id = i.id AND status = 'pending' AND due_date < ?
           ) AS has_overdue,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment AS total,
           COALESCE((SELECT SUM(amount) FROM invoice_installments WHERE invoice_id = i.id AND status = 'paid'), 0) AS collected
    FROM invoices i
  `)
  const { results: statRows } = await statsStmt.bind(today).all<{
    status: string; has_overdue: number; total: number; collected: number
  }>()

  const counts = { draft: 0, sent: 0, partially_paid: 0, paid: 0, overdue: 0 }
  let invoiced = 0
  let collected = 0
  for (const row of statRows) {
    if (row.status in counts) counts[row.status as keyof typeof counts]++
    if (row.status !== 'draft') {
      invoiced += row.total
      collected += row.collected
      if (row.status !== 'paid' && row.has_overdue) counts.overdue++
    }
  }

  return {
    invoices,
    stats: {
      counts,
      totals: { invoiced, collected, outstanding: invoiced - collected },
    },
  }
})
```

- [ ] **Step 2: Verify**

```bash
curl -s -b /tmp/admin-cookie.txt http://localhost:3002/api/admin/invoices | python3 -m json.tool
```
Expected: top-level `stats.counts.paid >= 1` (invoice `<N>` from Task 5), `stats.totals.collected >= 1000000` (10,000.00 SAR in halalas), and each row in `invoices` has `collected` and `has_overdue` keys.

```bash
curl -s -b /tmp/admin-cookie.txt "http://localhost:3002/api/admin/invoices?status=partially_paid" | python3 -m json.tool
```
Expected: `invoices` array filtered to only `partially_paid` rows (should be empty right now since `<N>` is fully paid — create a second split invoice and pay only one installment to see a non-empty result, or trust the SQL logic verified in Task 5).

- [ ] **Step 3: Stage & propose commit**

```bash
git add server/api/admin/invoices/index.get.ts
git commit -m "add stats block and per-row overdue/collected to invoice list endpoint"
```

---

### Task 7: Clone installment plan on duplicate

**Files:**
- Modify: `server/api/admin/invoices/[id]/duplicate.post.ts`

**Interfaces:**
- Consumes: nothing new from `installments.ts` (this is date-shift arithmetic, not plan validation, since the source plan is already valid).

- [ ] **Step 1: Add a day-diff helper and clone the plan**

Add this helper near the existing `addDaysISO`:

```ts
function diffDaysISO(a: string, b: string): number {
  const ta = new Date(a + 'T00:00:00Z').getTime()
  const tb = new Date(b + 'T00:00:00Z').getTime()
  return Math.round((tb - ta) / 86400000)
}
```

After the existing items-clone loop (`for (const it of items) { ... }`), add:

```ts
  // Clone installment plan, shifting each installment's due date by the same
  // offset it had from the source invoice's due date.
  const { results: installments } = await db
    .prepare('SELECT position, label, percentage, amount, due_date FROM invoice_installments WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all<{ position: number; label: string; percentage: number | null; amount: number; due_date: string }>()
  const now2 = Date.now()
  for (const inst of installments) {
    const offset = diffDaysISO(src.due_date, inst.due_date)
    const newDue = addDaysISO(due, offset)
    await db
      .prepare(`
        INSERT INTO invoice_installments
          (invoice_id, position, label, percentage, amount, due_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `)
      .bind(newId, inst.position, inst.label, inst.percentage, inst.amount, newDue, now2, now2)
      .run()
  }
```

- [ ] **Step 2: Verify**

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3002/api/admin/invoices/<N>/duplicate
```
Expected: `{"ok":true,"id":<NEW_N>}`.

```bash
npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT label, percentage, amount, due_date, status FROM invoice_installments WHERE invoice_id=<NEW_N> ORDER BY position"
```
Expected: 2 rows matching `<N>`'s labels/percentages/amounts, all `status='pending'`, due dates shifted to the new invoice's dates.

- [ ] **Step 3: Stage & propose commit**

```bash
git add "server/api/admin/invoices/[id]/duplicate.post.ts"
git commit -m "clone installment plan when duplicating an invoice"
```

---

### Task 8: Expose installments on the public invoice API

**Files:**
- Modify: `server/api/i/[slug].get.ts`

**Interfaces:**
- Produces: public payload gains `installments: { id, position, label, percentage, amount, due_date, status, paid_at }[]`, consumed by Task 12's public page.

- [ ] **Step 1: Add the query**

Add right after the `items` query:

```ts
  const { results: installments } = await db
    .prepare('SELECT id, position, label, percentage, amount, due_date, status, paid_at FROM invoice_installments WHERE invoice_id = ? ORDER BY position ASC')
    .bind(invoice.id)
    .all()
```

Update the return statement:

```ts
  return { invoice, customer, items, installments, settings }
```

- [ ] **Step 2: Verify with the public slug (no auth needed)**

Get the slug: `npx wrangler d1 execute sufyanfa-proposals --local --command "SELECT slug FROM invoices WHERE id=<N>"`

```bash
curl -s http://localhost:3002/api/i/<SLUG> | python3 -m json.tool
```
Expected: response includes `installments` array with 2 rows (label/amount/due_date/status), no auth cookie required since the invoice is not a draft.

- [ ] **Step 3: Stage & propose commit**

```bash
git add "server/api/i/[slug].get.ts"
git commit -m "expose installment plan on the public invoice API"
```

---

### Task 9: `InvoiceForm.vue` — split payment plan section

**Files:**
- Modify: `components/Admin/InvoiceForm.vue`

**Interfaces:**
- Consumes: `useMoney().formatSAR` (already imported).
- Produces: new prop `locked?: boolean`; `FormShape` gains `installments: { label: string; percentage: number; due_date: string }[]`; emitted `submit` payload's `data.installments` is `undefined` when `locked` and an explicit array otherwise — consumed by `[id].vue` (Task 10) and `new.vue` (unchanged, just gets the new field automatically).

- [ ] **Step 1: Extend the script block**

Add `locked` to props and `installments` to `FormShape`:

```ts
interface InstallmentRow { label: string; percentage: number; due_date: string }
interface FormShape {
  customer_id: number | null
  issue_date: string
  due_date: string
  items: Item[]
  adjustment: number
  adjustment_label: string
  notes: string
  installments: InstallmentRow[]
}

const props = defineProps<{
  initial?: Partial<FormShape>
  defaultDueDays?: number
  defaultNotes?: string
  submitLabels: { draft: string; sent: string }
  showSentButton?: boolean
  locked?: boolean
}>()
```

Initialize `splitOpen` and `installmentRows` after the existing `form` reactive block:

```ts
const loadedInstallments = props.initial?.installments?.length ? props.initial.installments : null
const splitOpen = ref(!!loadedInstallments && loadedInstallments.length > 1)
const installmentRows = reactive<InstallmentRow[]>(
  loadedInstallments
    ? loadedInstallments.map(r => ({ label: r.label, percentage: r.percentage, due_date: r.due_date }))
    : [
        { label: 'دفعة مقدمة', percentage: 40, due_date: issueInit },
        { label: 'الدفعة النهائية', percentage: 60, due_date: dueInit },
      ],
)

function toggleSplit(on: boolean) {
  splitOpen.value = on
  if (!on) {
    installmentRows.splice(0, installmentRows.length, { label: 'دفعة مقدمة', percentage: 40, due_date: issueInit })
  }
}
function addInstallment() {
  installmentRows.push({ label: '', percentage: 0, due_date: form.due_date })
}
function removeInstallment(i: number) {
  installmentRows.splice(i, 1)
}

const installmentPercentTotal = computed(() => installmentRows.reduce((s, r) => s + (r.percentage || 0), 0))
```

Update `buildBody()` to include `installments`:

```ts
function buildBody(): FormShape {
  return {
    customer_id: form.customer_id,
    issue_date: form.issue_date,
    due_date: form.due_date,
    items: itemViews.map(i => ({ description: i.description.trim(), amount: Math.round((i.sar || 0) * 100) })),
    adjustment: adjustmentOpen.value ? adjustmentHalalas.value : 0,
    adjustment_label: adjustmentOpen.value ? form.adjustment_label.trim() : '',
    notes: form.notes,
    installments: props.locked
      ? undefined as any
      : splitOpen.value
        ? installmentRows.map(r => ({ label: r.label.trim(), percentage: r.percentage, due_date: r.due_date }))
        : [{ label: 'الدفعة الكاملة', percentage: 100, due_date: form.due_date }],
  }
}
```

Add validation in `submit()`, right after the existing `due_date < issue_date` check:

```ts
  if (!props.locked && splitOpen.value) {
    if (installmentPercentTotal.value !== 100) { error.value = 'مجموع نسب الدفعات يجب أن يساوي 100%'; return }
    for (const r of installmentRows) {
      if (!r.label.trim()) { error.value = 'وصف كل دفعة مطلوب'; return }
      if (r.due_date < form.issue_date) { error.value = 'تاريخ استحقاق الدفعة قبل تاريخ الإصدار'; return }
    }
  }
```

- [ ] **Step 2: Add the template section**

Insert a new `<section>` right after the "البنود" (items) section and before the adjustment section:

```html
    <section class="bg-white border border-black/10 rounded-2xl p-6 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold">خطة الدفع</h2>
        <div v-if="locked" class="text-xs text-ink-mute">تم تسجيل دفعة — لا يمكن تعديل الخطة</div>
      </div>

      <div v-if="!locked" class="flex gap-2">
        <button type="button" @click="toggleSplit(false)"
          :class="['px-3 py-1.5 text-xs rounded-lg border', !splitOpen ? 'bg-ink text-white border-ink' : 'border-black/10']">
          دفعة واحدة
        </button>
        <button type="button" @click="toggleSplit(true)"
          :class="['px-3 py-1.5 text-xs rounded-lg border', splitOpen ? 'bg-ink text-white border-ink' : 'border-black/10']">
          تقسيم لدفعات
        </button>
      </div>

      <div v-if="splitOpen" class="space-y-3">
        <div v-for="(row, idx) in installmentRows" :key="idx" class="flex gap-2 items-end">
          <div class="flex-1">
            <label class="block text-xs text-ink-mute mb-1">الوصف</label>
            <input v-model="row.label" :disabled="locked" placeholder="مثلاً: دفعة مقدمة" class="w-full px-3 py-2 border border-black/10 rounded-lg disabled:bg-cream-deep" />
          </div>
          <div class="w-24">
            <label class="block text-xs text-ink-mute mb-1">النسبة %</label>
            <input v-model.number="row.percentage" :disabled="locked" type="number" min="0" max="100" class="w-full px-3 py-2 border border-black/10 rounded-lg text-left disabled:bg-cream-deep" dir="ltr" />
          </div>
          <div class="w-40">
            <label class="block text-xs text-ink-mute mb-1">تاريخ الاستحقاق</label>
            <input v-model="row.due_date" :disabled="locked" type="date" class="w-full px-3 py-2 border border-black/10 rounded-lg disabled:bg-cream-deep" />
          </div>
          <button v-if="!locked" type="button" @click="removeInstallment(idx)" class="px-3 py-2 border border-black/10 rounded-lg text-red-600">×</button>
        </div>
        <div class="flex items-center justify-between">
          <button v-if="!locked" type="button" @click="addInstallment" class="text-sm text-forest underline">+ إضافة دفعة</button>
          <div :class="['text-xs font-semibold', installmentPercentTotal === 100 ? 'text-ink-mute' : 'text-red-600']">
            المتبقي: {{ 100 - installmentPercentTotal }}%
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Manual verification via browser**

Run `yarn dev` (port 3002), open `http://localhost:3002/admin/invoices/new` (log in if prompted), fill a customer + one item, click "تقسيم لدفعات":
Expected: two rows appear pre-filled 40%/60% with "المتبقي: 0%" in gray. Change one percentage so they no longer sum to 100:
Expected: "المتبقي: N%" turns red and matches `100 - sum`. Set it back to 100, click "حفظ كمسودة":
Expected: no error, redirected/saved successfully (verify via Task 2's curl pattern or the network tab that the POST body's `installments` array has 2 rows).

- [ ] **Step 4: Stage & propose commit**

```bash
git add components/Admin/InvoiceForm.vue
git commit -m "add split-payment plan editor to the invoice form"
```

---

### Task 10: Admin invoice detail page — per-installment payment UI

**Files:**
- Modify: `pages/admin/invoices/[id].vue`

**Interfaces:**
- Consumes: `installments[]` from Task 4's GET endpoint; `POST /api/admin/invoices/[id]/mark-paid` (Task 5, settle-all); `POST /api/admin/invoices/[id]/installments/[iid]/mark-paid` (Task 5, per-installment); `InvoiceForm`'s new `locked` prop and `installments` field (Task 9).

- [ ] **Step 1: Extend the script block**

Add an `Installment` interface and extend `Invoice`'s status union:

```ts
interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'partially_paid' | 'paid'
  customer_id: number
  issue_date: string; due_date: string
  adjustment: number; adjustment_label: string | null
  notes: string | null
}
interface ItemRow { id: number; position: number; description: string; amount: number }
interface Installment {
  id: number; position: number; label: string; percentage: number | null
  amount: number; due_date: string; status: 'pending' | 'paid'; paid_at: number | null
}

const { data, refresh } = await useFetch<{ invoice: Invoice; items: ItemRow[]; installments: Installment[]; customer: any }>(
  () => `/api/admin/invoices/${id}`,
)
```

Add `useMoney` import and a status-label map at the top (near the other imports/consts):

```ts
import { useMoney } from '~/composables/useMoney'
const { formatSAR } = useMoney()

const statusLabels: Record<string, string> = {
  draft: 'مسودة', sent: 'مرسلة', partially_paid: 'مدفوعة جزئياً', paid: 'مكتملة',
}
```

Add a `locked` computed and a per-installment payment method, near the existing `markPaid`/`markSent` functions:

```ts
const locked = computed(() => data.value?.installments?.some(i => i.status === 'paid') ?? false)

async function markInstallmentPaid(iid: number) {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/installments/${iid}/mark-paid`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
```

Update the `initial` computed to include `installments`:

```ts
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
    installments: data.value.installments.map(i => ({ label: i.label, percentage: i.percentage ?? 0, due_date: i.due_date })),
  }
})
```

- [ ] **Step 2: Update the template**

Replace the status line:

```html
        <div class="text-sm text-gray-500 mt-1">الحالة: {{ statusLabels[data.invoice.status] ?? data.invoice.status }}</div>
```

Replace the single `markPaid` button (`<button v-if="data.invoice.status === 'sent'" ...>وضع كمدفوعة</button>`) with a block that also handles `partially_paid` and adds per-installment rows when there's more than one:

```html
        <button v-if="data.invoice.status === 'sent' || data.invoice.status === 'partially_paid'" type="button" @click="markPaid" :disabled="busy" class="px-3 py-1.5 text-sm bg-[#15803D] text-white rounded-lg">تسجيل الكل كمدفوع</button>
```

Add a new section after the header actions block (`</div>` that closes `flex items-center justify-between mb-6...`) and before `<div v-if="error" ...>`:

```html
    <div v-if="data.installments.length > 1" class="mb-6 border border-black/10 rounded-xl divide-y divide-black/5">
      <div v-for="inst in data.installments" :key="inst.id" class="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          <div class="font-semibold">{{ inst.label }}<span v-if="inst.percentage" class="text-gray-500 font-normal"> ({{ inst.percentage }}%)</span></div>
          <div class="text-gray-500" dir="ltr">{{ formatSAR(inst.amount) }} — {{ inst.status === 'paid' ? `دُفعت` : `تستحق ${inst.due_date}` }}</div>
        </div>
        <button v-if="inst.status === 'pending'" type="button" @click="markInstallmentPaid(inst.id)" :disabled="busy" class="px-3 py-1.5 text-xs bg-[#15803D] text-white rounded-lg">تسجيل كمدفوعة</button>
        <span v-else class="text-xs text-[#15803D] font-semibold">✓ مدفوعة</span>
      </div>
    </div>
```

Pass `locked` to the form:

```html
    <AdminInvoiceForm
      v-if="initial"
      :initial="initial"
      :locked="locked"
      :submit-labels="{ draft: 'حفظ التغييرات', sent: 'حفظ ووضع كمرسلة' }"
      :show-sent-button="data.invoice.status === 'draft'"
      @submit="onSubmit"
    />
```

- [ ] **Step 3: Manual verification via browser**

Open the split invoice `<N>` (or a fresh one) at `/admin/invoices/<N>`:
Expected: if `installments.length > 1`, the installment list renders with amounts/due dates; pending rows show "تسجيل كمدفوعة"; clicking it flips that row to "✓ مدفوعة" and the status line updates (e.g. to "مدفوعة جزئياً"); once all are paid, status line reads "مكتملة" and the "تسجيل الكل كمدفوع" button disappears (status is no longer `sent`/`partially_paid`). Reopen the edit form section "خطة الدفع": with any installment paid, inputs are disabled and "تم تسجيل دفعة — لا يمكن تعديل الخطة" is shown.

- [ ] **Step 4: Stage & propose commit**

```bash
git add "pages/admin/invoices/[id].vue"
git commit -m "add per-installment payment UI to the invoice detail page"
```

---

### Task 11: Admin invoice list — stats bar + `partially_paid` filter/badge

**Files:**
- Modify: `pages/admin/invoices/index.vue`

**Interfaces:**
- Consumes: `stats` block and per-row `collected`/`has_overdue` from Task 6's list endpoint.

- [ ] **Step 1: Update the script block**

Replace the `InvoiceRow` interface, fetch typing, and remove the old client-side `totals` computed:

```ts
interface InvoiceRow {
  id: number
  slug: string
  number: string
  status: 'draft' | 'sent' | 'partially_paid' | 'paid'
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_id: number
  customer_name: string
  subtotal: number
  collected: number
  has_overdue: boolean
}
interface Stats {
  counts: { draft: number; sent: number; partially_paid: number; paid: number; overdue: number }
  totals: { invoiced: number; collected: number; outstanding: number }
}

const { data, refresh } = await useFetch<{ invoices: InvoiceRow[]; stats: Stats }>(
  () => `/api/admin/invoices${queryParam.value}`,
)
```

(`route`, `router`, `formatSAR`, `filter`, `queryParam`, `setFilter` stay unchanged.)

Remove the `todayISO`/`isOverdue` function and the old `totals` computed entirely; replace `isOverdue`/`badgeClass`/`badgeText` with:

```ts
function isOverdue(inv: InvoiceRow): boolean {
  return (inv.status === 'sent' || inv.status === 'partially_paid') && inv.has_overdue
}

function badgeClass(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'bg-red-50 text-red-700 border-red-100'
  if (inv.status === 'paid') return 'bg-green-50 text-green-700 border-green-100'
  if (inv.status === 'partially_paid') return 'bg-amber-50 text-amber-700 border-amber-100'
  if (inv.status === 'sent') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}

function badgeText(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'متأخرة'
  if (inv.status === 'paid') return 'مكتملة'
  if (inv.status === 'partially_paid') return 'مدفوعة جزئياً'
  if (inv.status === 'sent') return 'مرسلة'
  return 'مسودة'
}
```

- [ ] **Step 2: Update the template**

Update the filter buttons array and labels:

```html
        <button v-for="opt in ['all', 'draft', 'sent', 'partially_paid', 'paid']" :key="opt"
          @click="setFilter(opt)"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
            filter === opt ? 'bg-ink text-white' : 'bg-cream-deep text-ink-soft hover:bg-black/[0.06]'
          ]"
        >
          {{ ({ all: 'الكل', draft: 'مسودة', sent: 'مرسلة', partially_paid: 'مدفوعة جزئياً', paid: 'مكتملة' } as any)[opt] }}
        </button>
```

Insert a stats bar right before the "Filters" comment block:

```html
      <div v-if="data?.stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مسودة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.draft }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مرسلة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.sent }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مدفوعة جزئياً</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.partially_paid }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مكتملة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.paid }}</div>
        </div>
        <div class="bg-red-50 rounded-2xl p-4">
          <div class="text-[11px] text-red-700 font-semibold uppercase tracking-wide mb-1">متأخرة</div>
          <div class="text-xl font-bold text-red-700">{{ data.stats.counts.overdue }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">المتبقي</div>
          <div class="text-xl font-bold text-[#15803D]" dir="ltr">{{ formatSAR(data.stats.totals.outstanding) }}</div>
        </div>
      </div>
```

- [ ] **Step 3: Manual verification via browser**

Open `/admin/invoices`:
Expected: the six-tile stats bar renders above the filter chips with correct counts matching Task 6's curl output; a partially-paid invoice shows an amber "مدفوعة جزئياً" badge; clicking the "مدفوعة جزئياً" filter chip shows only those rows; an invoice with a pending installment past its due date shows the red "متأخرة" badge even if its status is `partially_paid`.

- [ ] **Step 4: Stage & propose commit**

```bash
git add pages/admin/invoices/index.vue
git commit -m "add stats bar and partially-paid state to the invoices list page"
```

---

### Task 12: Public invoice page — payment schedule table

**Files:**
- Modify: `pages/i/[slug].vue`

**Interfaces:**
- Consumes: `installments[]` from Task 8's public API.

- [ ] **Step 1: Update the script block**

Extend the fetch typing and status union:

```ts
interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'partially_paid' | 'paid'
  issue_date: string; due_date: string
  currency: string
  adjustment: number
  adjustment_label: string | null
  notes: string | null
}
interface InstallmentRow {
  id: number; position: number; label: string; percentage: number | null
  amount: number; due_date: string; status: 'pending' | 'paid'; paid_at: number | null
}

const { data, error } = await useFetch<{
  invoice: Invoice; customer: Customer; items: ItemRow[]; installments: InstallmentRow[]; settings: Settings
}>(`/api/i/${slug}${preview}`)
```

Update `isPaid`/add a helper for formatting the paid date, near the existing `isOverdue`/`isPaid`:

```ts
const isPaid = computed(() => data.value?.invoice.status === 'paid')

function formatDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}
```

- [ ] **Step 2: Add the schedule table to the template**

Insert right after the totals `</div>` inside the "Items" `<section>` (after the `الإجمالي` block, still inside `<section class="mb-10">`), only when there's more than one installment:

```html
        <div v-if="data.installments.length > 1" class="mt-8 border-t border-black/10 pt-6">
          <h3 class="text-xs uppercase tracking-wide text-gray-500 mb-3">خطة الدفع</h3>
          <div class="space-y-2">
            <div v-for="inst in data.installments" :key="inst.id" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span :class="inst.status === 'paid' ? 'text-[#15803D]' : (inst.due_date < todayISO ? 'text-red-600' : 'text-gray-400')">
                  {{ inst.status === 'paid' ? '✓' : '○' }}
                </span>
                <span>{{ inst.label }}<span v-if="inst.percentage" class="text-gray-500"> ({{ inst.percentage }}%)</span></span>
              </div>
              <div class="flex items-center gap-3" dir="ltr">
                <span class="font-semibold">{{ formatSAR(inst.amount) }}</span>
                <span :class="inst.status === 'paid' ? 'text-[#15803D]' : (inst.due_date < todayISO ? 'text-red-600' : 'text-gray-500')">
                  {{ inst.status === 'paid' ? `دُفعت ${formatDate(inst.paid_at!)}` : `تستحق ${inst.due_date}` }}
                </span>
              </div>
            </div>
          </div>
        </div>
```

- [ ] **Step 3: Manual verification via browser**

Open `/i/<SLUG>` for the split invoice from Task 8 (incognito, no admin cookie):
Expected: below the totals, a "خطة الدفع" block lists both installments with amounts and paid/due status matching the preview from the design spec (✓ green for paid, ○ gray/red for pending depending on overdue). Open `/i/<slug>` for a single-installment invoice (e.g. any pre-existing one):
Expected: no schedule block renders — page looks exactly as it did before this feature.

- [ ] **Step 4: Stage & propose commit**

```bash
git add "pages/i/[slug].vue"
git commit -m "show payment schedule on the public invoice page"
```

---

### Task 13: Full local end-to-end walkthrough + deploy preflight

**Files:** none (verification only)

- [ ] **Step 1: End-to-end flow via browser** (`yarn dev`, port 3002)

1. `/admin/invoices/new` → create a customer, one item (10,000 SAR), split 40/60, save as sent.
2. Open the invoice → confirm status "مرسلة", two installment rows shown with correct amounts (4,000 / 6,000 SAR) and due dates.
3. Open `/i/<slug>` in incognito → confirm the schedule table renders both rows as pending.
4. Back in admin, click "تسجيل كمدفوعة" on the deposit row → confirm status flips to "مدفوعة جزئياً" and the stats bar on `/admin/invoices` updates its "مدفوعة جزئياً" tile.
5. Click "تسجيل الكل كمدفوع" → confirm status flips to "مكتملة", `/i/<slug>` now shows both rows paid with dates.
6. Try to edit the invoice's "خطة الدفع" → confirm it's locked/disabled.
7. Create a second, plain (non-split) invoice, mark it sent, click "تسجيل الكل كمدفوع" → confirm it behaves exactly as the old one-click "وضع كمدفوعة" always did (no installment list shown, since `installments.length === 1`).

- [ ] **Step 2: Full deploy preflight per `CLAUDE.md`**

```bash
rm -rf dist .output .nuxt
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=8192 yarn build
ls dist/_worker.js/chunks/vite-node-shared.mjs   # must NOT exist
head -1 dist/_worker.js/chunks/app/client.manifest.mjs   # must start with `const e={`
npx wrangler pages dev dist/ --port 8790 &
/usr/bin/curl -s -o /dev/null -w "/ %{http_code}\n" http://localhost:8790/
/usr/bin/curl -s -o /dev/null -w "/admin/login %{http_code}\n" http://localhost:8790/admin/login
/usr/bin/curl -s -o /dev/null -w "/i/<SLUG> %{http_code}\n" http://localhost:8790/i/<SLUG>
```
Expected: all page routes 200; no vite-node leak; `client.manifest.mjs` starts with the static-object form.

- [ ] **Step 3: Apply the migration remotely, then deploy**

```bash
npx wrangler d1 migrations apply sufyanfa-proposals --remote
npx wrangler pages deploy dist --project-name=sufyanfa-com
```
Smoke-test the printed preview URL with the same 200 checks as Step 2, then verify `https://sufyanfa.com` the same way.

(Per Global Constraints: do not run this task's deploy/migrate-remote commands without the user's explicit go-ahead at that point in time.)
