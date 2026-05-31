# Invoice & Billing System — Design Spec

**Date:** 2026-05-17
**Status:** Approved (pending user spec review)
**Author:** Sufyan Farea + Claude
**Related:** [Proposal system spec](2026-05-13-proposal-system-design.md) — shares auth, D1 binding, slug pattern

---

## Goal

Build a billing/invoice system at `sufyanfa.com` so Sufyan can manage monthly invoices for hosting, database, and tech services across multiple customers. Each invoice gets a shareable public link the customer opens in the browser and can print/save as PDF. Admin manages customers, invoices, and issuer settings via the existing `/admin` dashboard (JWT-cookie auth, same as proposals).

## Non-goals (v1)

- No email-send (admin shares link via WhatsApp/email manually)
- No customer-facing portal showing invoice history
- No multi-currency (SAR only)
- No VAT (per user choice — can be added later in a separate spec)
- No server-side PDF generation (browser print-to-PDF only)
- No quantity / unit-price columns on line items (description + amount only)
- No subscriptions / cron auto-generation (manual "duplicate for next month" button only)
- No file upload for logo (URL field; reuse `/logo.svg` or paste a hosted URL)

## Decisions (confirmed with user)

| Topic | Decision |
| --- | --- |
| Delivery | Shareable link `/i/<slug>` + browser print-to-PDF |
| Customer model | Stored customers (reusable across invoices) |
| Recurring | Manual "duplicate for next month" button (no cron) |
| Payment tracking | Status (`draft`/`sent`/`paid`) + `due_date` + computed `overdue` badge |
| VAT | None |
| Line items | Description + amount, plus optional adjustment field at bottom |
| Access | Public link with random 22-char slug (no password) |
| Language | Arabic RTL only |
| Currency | SAR (single, hardcoded default) |
| Issuer info | Single-row `settings` table editable via `/admin/settings` |
| Dashboard | Widget on `/admin` showing outstanding + overdue totals |

---

## Architecture overview

Mirrors the proposal system:

- **Storage:** Cloudflare D1 (existing binding `DB` from `wrangler.toml`)
- **Auth:** existing admin `__session` JWT cookie + `getAdminSession`/admin middleware
- **Public viewer:** Nuxt page at `/i/[slug]` using the `bare` layout
- **Admin UI:** Nuxt pages under `/admin/invoices`, `/admin/customers`, `/admin/settings`
- **PDF:** browser `window.print()` with print CSS — no server-side library, no headless Chrome
- **No new modules, no new bindings.** Pure additive feature on the existing stack.

---

## Data model

New migration `migrations/0002_invoices.sql`:

```sql
-- Reusable customer records
CREATE TABLE customers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  notes        TEXT,           -- private admin notes
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_customers_name ON customers(name);

-- Invoices
CREATE TABLE invoices (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,         -- 22-char URL-safe random
  number        TEXT NOT NULL UNIQUE,         -- e.g. "INV-2026-0001"
  customer_id   INTEGER NOT NULL REFERENCES customers(id),
  status        TEXT NOT NULL DEFAULT 'draft',-- 'draft' | 'sent' | 'paid'
  issue_date    TEXT NOT NULL,                -- ISO 'YYYY-MM-DD'
  due_date      TEXT NOT NULL,                -- ISO 'YYYY-MM-DD'
  currency      TEXT NOT NULL DEFAULT 'SAR',
  adjustment    INTEGER NOT NULL DEFAULT 0,   -- minor units (halalas), +/-
  adjustment_label TEXT,
  notes         TEXT,                         -- shown on the invoice
  paid_at       INTEGER,
  sent_at       INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Line items
CREATE TABLE invoice_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id    INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  description   TEXT NOT NULL,
  amount        INTEGER NOT NULL              -- minor units (halalas)
);
CREATE INDEX idx_items_invoice ON invoice_items(invoice_id);

-- Single-row issuer settings
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
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed the single settings row so admin UI never sees an empty state
INSERT INTO settings (id, business_name) VALUES (1, 'سفيان فارع');
```

### Money handling

All amounts stored as integer **halalas** (e.g. 200.00 SAR = `20000`) to avoid floating-point drift. Format at the leaf via `server/utils/money.ts`:

```ts
export const toMinor = (sar: number) => Math.round(sar * 100)
export const fromMinor = (h: number) => h / 100
export const formatSAR = (h: number) =>
  new Intl.NumberFormat('ar-SA', {
    style: 'currency', currency: 'SAR',
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(h / 100)
```

Mirror to client via `composables/useMoney.ts`.

### Snapshot vs live data

- **Live-joined on view:** customer (name/email/phone/company), issuer settings (business name, bank, logo) — so corrections propagate everywhere
- **Snapshotted on invoice:** items, adjustment, notes, currency, dates — fixed at creation time

### Invoice numbering (atomic, race-free)

Computed inside the INSERT to avoid a read-then-write race:

```sql
INSERT INTO invoices (number, slug, ...)
VALUES (
  'INV-' || strftime('%Y','now') || '-' ||
    printf('%04d',
      COALESCE(
        (SELECT MAX(CAST(substr(number, 10) AS INTEGER))
           FROM invoices
          WHERE number LIKE 'INV-' || strftime('%Y','now') || '-%'),
        0) + 1),
  ?, ...
);
```

D1 statements are atomic. Year rollover (`INV-2027-0001`) is handled naturally by the `strftime` clause. Number is overridable on the create form (defaults to the computed one).

---

## Route map

### Public

- `GET /i/[slug]` — viewer page (no auth; 404 if draft or unknown slug)
- `GET /api/i/[slug]` — fetch invoice JSON (joined with customer + items + settings)

### Admin pages (require `__session` cookie)

- `GET /admin/invoices` — list with filter chips
- `GET /admin/invoices/new` — create form
- `GET /admin/invoices/[id]` — edit form (also actions: mark sent/paid, duplicate, delete)
- `GET /admin/customers` — list
- `GET /admin/customers/new` / `GET /admin/customers/[id]` — create/edit
- `GET /admin/settings` — issuer info form

### Admin API (require admin session)

```
GET    /api/admin/invoices                       list + filter
POST   /api/admin/invoices                       create (assigns slug + number)
GET    /api/admin/invoices/[id]                  read with items
PUT    /api/admin/invoices/[id]                  update fields + items
DELETE /api/admin/invoices/[id]                  delete (cascades to items; draft only)
POST   /api/admin/invoices/[id]/duplicate        clone → new draft
POST   /api/admin/invoices/[id]/mark-sent        status='sent', sent_at=now
POST   /api/admin/invoices/[id]/mark-paid        status='paid', paid_at=now

GET    /api/admin/customers                      list
POST   /api/admin/customers                      create
GET    /api/admin/customers/[id]                 read
PUT    /api/admin/customers/[id]                 update
DELETE /api/admin/customers/[id]                 delete (409 if has invoices)

GET    /api/admin/settings                       read single row
PUT    /api/admin/settings                       update
```

### File layout

```
server/api/admin/invoices/index.get.ts
server/api/admin/invoices/index.post.ts
server/api/admin/invoices/[id].get.ts
server/api/admin/invoices/[id].put.ts
server/api/admin/invoices/[id].delete.ts
server/api/admin/invoices/[id]/duplicate.post.ts
server/api/admin/invoices/[id]/mark-sent.post.ts
server/api/admin/invoices/[id]/mark-paid.post.ts
server/api/admin/customers/index.get.ts
server/api/admin/customers/index.post.ts
server/api/admin/customers/[id].get.ts
server/api/admin/customers/[id].put.ts
server/api/admin/customers/[id].delete.ts
server/api/admin/settings.get.ts
server/api/admin/settings.put.ts
server/api/i/[slug].get.ts
server/utils/money.ts
server/utils/slug.ts        (reuse existing if present from proposal system)

pages/admin/invoices/index.vue
pages/admin/invoices/new.vue
pages/admin/invoices/[id].vue
pages/admin/customers/index.vue
pages/admin/customers/new.vue
pages/admin/customers/[id].vue
pages/admin/settings.vue
pages/i/[slug].vue                  (uses bare layout)

components/admin/InvoiceForm.vue    (shared by new + edit)
components/admin/CustomerPicker.vue (searchable dropdown + inline-create modal)
composables/useMoney.ts

migrations/0002_invoices.sql
```

Update `nuxt.config.ts` prerender ignore: add `'/i/**'`.

---

## Public viewer `/i/[slug]` — layout

Uses `bare` layout, Rubik, RTL, brand palette (cream `#F5F5F7`, ink `#000`, forest green `#15803D`). Editorial voice, no emojis.

```
┌────────────────────────────────────────────────────────┐
│  [logo]                              فاتورة            │
│                                      INV-2026-0001     │
│                                      تاريخ الإصدار: …  │
│                                      تاريخ الاستحقاق: …│
├────────────────────────────────────────────────────────┤
│  من                          │  إلى                    │
│  سفيان فارع                  │  شركة بوصلة             │
│  business_name               │  company                │
│  email / phone / address     │  name / email / phone   │
├────────────────────────────────────────────────────────┤
│  البند                                  المبلغ          │
│  ─────────────────────────────────────────────────────  │
│  استضافة — مارس 2026                  200.00 ر.س       │
│  قاعدة بيانات — مارس 2026             150.00 ر.س       │
│                                                         │
│                  الإجمالي الفرعي         350.00 ر.س     │
│                  خصم العميل المميز       −50.00 ر.س     │  (only if adjustment != 0)
│                  الإجمالي                300.00 ر.س     │  (bold, forest green underline)
├────────────────────────────────────────────────────────┤
│  معلومات الدفع                                          │  (cream bg)
│  البنك:            …                                   │
│  اسم الحساب:       …                                   │
│  رقم الحساب:       …                                   │
│  الآيبان:          SA…                                 │  (monospace)
├────────────────────────────────────────────────────────┤
│  ملاحظات                                                │
│  …                                                      │
└────────────────────────────────────────────────────────┘
[ اطبع / احفظ PDF ]   (screen-only, hidden in print)
```

### Status overlays (screen only, hidden in print)
- `paid` → green ribbon top-right "مدفوعة"
- `overdue` (status=sent AND `due_date < today`) → red ribbon "متأخرة"
- `draft` → not viewable publicly; viewer returns 404. Admin can preview via `?preview=1` with valid `__session` cookie.

### Print CSS (the bit that makes PDF look right)

```css
@media print {
  @page { size: A4; margin: 16mm; }
  body { background: white; }
  .no-print, .ribbon { display: none !important; }
  .invoice { box-shadow: none; border: none; }
  a { color: inherit; text-decoration: none; }
}
```

`window.print()` → "Save as PDF" produces a clean A4 PDF matching the on-screen design.

### Admin overlay
A small "نسخ الرابط" copy button visible only when `__session` cookie is valid (mirrors the proposal viewer's admin overlay trick).

---

## Admin UI flows

### `/admin/invoices` (list)

- Table columns: number, customer, issue date, due date, status badge, total, actions
- Filter chips: الكل / مسودة / مرسلة / مدفوعة / متأخرة
- Sort: newest first
- Empty state: "لا توجد فواتير بعد" + "إنشاء فاتورة جديدة" CTA
- Status badge colors: gray (draft), blue (sent), forest green (paid), red (overdue — computed client-side from due_date)

### `/admin/invoices/new` and `/admin/invoices/[id]`

Shared `components/admin/InvoiceForm.vue`:

1. **Customer**: `CustomerPicker` (searchable dropdown + "+ عميل جديد" inline modal)
2. **Issue date** (default = today), **Due date** (default = today + `settings.default_due_days`)
3. **Items**: dynamic list — description input + amount input + delete. "+ إضافة بند" adds. ≥1 required.
4. **Adjustment**: collapsed by default ("إضافة خصم أو رسوم"); expanded shows label + signed amount.
5. **Notes**: textarea, prefilled from `settings.default_notes` on new.
6. **Computed footer** (live, sticky bottom on mobile): subtotal / adjustment / total.
7. Save buttons: "حفظ كمسودة" (draft) + "حفظ ووضع كمرسلة" (sent, sets `sent_at`).

Edit-page header actions (right-aligned in RTL):
- "تكرار للشهر القادم" → `POST /api/admin/invoices/[id]/duplicate` → redirect to new draft's edit page
- "وضع كمدفوعة" (only if status=sent)
- "عرض الفاتورة" → opens `/i/[slug]` in new tab (only if status≠draft)
- "نسخ الرابط" (only if status≠draft)
- "حذف" with confirm (only if status=draft)

### `/admin/customers`

Table: name, email, phone, # invoices, last invoice date. Row → edit. Delete blocked + disabled in UI if customer has invoices (tooltip: "لا يمكن حذف عميل لديه فواتير").

### `/admin/settings`

Single form for issuer info. Save → PUT → toast "تم الحفظ".

### `/admin` dashboard widget (added above existing proposals section)

```
الفواتير
المعلقة:     1,250.00 ر.س   (3 فواتير)
المتأخرة:    400.00 ر.س      (1 فاتورة)        ← red if > 0
[ عرض كل الفواتير ]
```

Links to `/admin/invoices?status=sent`.

---

## Validation rules (server-side)

Hand-rolled (matches proposal system convention; no new dep):

- **Invoice create/update:** `customer_id` exists, ≥1 item with non-empty description and `amount ≥ 0`, `due_date ≥ issue_date`, `status ∈ {draft,sent,paid}`
- **Customer create/update:** `name` non-empty
- **Settings update:** `business_name` non-empty; everything else optional
- **All money fields:** integer ≥ 0 (or signed integer for `adjustment`)

---

## Edge cases

| Case | Handling |
| --- | --- |
| Stale settings | Always re-read from D1; no caching layer |
| Snapshot vs live | Customer info live-joined; bank info live-joined (so changing banks updates unpaid invoices); items/adjustment/notes/currency/dates snapshotted |
| Draft public access | `/i/<slug>` for draft → 404; admin preview via `?preview=1` + valid session |
| Delete | Only `draft` deletable; sent/paid kept forever (no archive in v1) |
| Slug collision | 22-char random ≈ zero probability; `INSERT OR ABORT` + retry once on UNIQUE violation |
| Year rollover | Numbering computed via `strftime('%Y','now')` inside INSERT — first invoice of 2027 = `INV-2027-0001` |
| Customer delete with invoices | FK rejects; API returns 409 + Arabic message |
| Missing settings row | Migration seeds it; if absent at runtime, viewer renders without bank block (no crash) |
| Money precision | All math in integer halalas; format only at the leaf |

---

## Testing & verification

No new test framework; verification via the codified deploy preflight in `CLAUDE.md`.

### Local verification (before commit)

1. `npx wrangler d1 execute sufyanfa-proposals --local --file=migrations/0002_invoices.sql`
2. `yarn dev` (port 3002) — full flow: create customer → create invoice with 2 items + adjustment → mark sent → open `/i/<slug>` in incognito → print preview correct → mark paid → duplicate → edit settings
3. After commit, apply to remote: `npx wrangler d1 execute sufyanfa-proposals --remote --file=migrations/0002_invoices.sql`

### Pre-deploy (full preflight per `CLAUDE.md`)

1. `rm -rf dist .output .nuxt`
2. `NODE_ENV=production yarn build`
3. Verify no `vite-node-shared.mjs` leak in `dist/_worker.js/chunks/`
4. `npx wrangler pages dev dist/ --port 8790` and curl:
   - `/admin/invoices`, `/admin/customers`, `/admin/settings` → 200 (after login)
   - `/i/<test-slug>` → 200
   - `/api/admin/invoices` (no session) → 401
5. `npx wrangler pages deploy dist --project-name=sufyanfa-com`
6. Smoke-test preview URL, then prod alias

---

## Scope guardrails

Not in v1 (each is a follow-up spec if/when needed):

- Email-send via Resend (deferred — admin shares link manually)
- Customer-facing portal (Approach C, rejected as YAGNI)
- Multi-currency
- VAT
- Server-side PDF generation
- Quantity/unit-price line item columns
- Subscriptions / cron auto-generation
- File upload for logo (use URL field; reuse `/logo.svg` or paste a hosted URL)
- Soft-delete / archive for sent/paid invoices
- Audit log of who-did-what

---

## Implementation order (for the plan to follow)

1. Migration `0002_invoices.sql` + apply locally
2. `server/utils/money.ts` + `composables/useMoney.ts`
3. Admin API routes: customers (5) → settings (2) → invoices (8 incl. actions) → public `/api/i/[slug]` (1)
4. Admin pages: customers (3) → settings (1) → invoices list/new/edit (3) → `InvoiceForm` + `CustomerPicker` components
5. Public viewer `pages/i/[slug].vue` with print CSS
6. Dashboard widget on `/admin`
7. `nuxt.config.ts` prerender ignore: add `'/i/**'`
8. Local end-to-end exercise
9. Deploy preflight + apply remote migration
